'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import InnerNav from '@/components/InnerNav';
import UserTable from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import axios from '@/lib/axios';
import { FiSearch, FiRefreshCw, FiUserCheck, FiUsers, FiShield } from 'react-icons/fi';

const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// --- TYPES ---

type MainTab = 'dlh' | 'pusdatin' | 'admin';
type DlhSubTab = 'provinsi' | 'kabkota';

interface UserData {
  id: number;
  name?: string; 
  email: string;
  role: { name: string } | string; 
  dinas?: {
    nama_dinas: string;
    region?: {
      type: string;
      nama_region: string;
      nama_wilayah?: string;
      parent?: { nama_region: string; nama_wilayah?: string; }
    }
  };
  province_name?: string;
  regency_name?: string;
}

interface PaginatedResponse {
  data: UserData[];
  total: number;
  last_page: number;
  current_page: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ProgressStatCardProps {
  title: string;
  current: number;
  max: number;
  color?: 'blue' | 'green' | 'red';
  icon?: React.ElementType; 
  onClick?: () => void;
}

// Global Cache
const dataCache: Record<string, CacheEntry<unknown>> = {};

// --- COMPONENTS ---

const ProgressStatCard = ({ 
  title, current, max, color = 'green', icon: Icon, onClick 
}: ProgressStatCardProps) => {
  const percentage = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  
  const styles = {
    blue: { bar: 'bg-blue-500', border: 'border-l-blue-500', text: 'text-blue-600', bgIcon: 'bg-blue-50' },
    green: { bar: 'bg-green-500', border: 'border-l-green-500', text: 'text-green-600', bgIcon: 'bg-green-50' },
    red: { bar: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-600', bgIcon: 'bg-red-50' },
  };

  const s = styles[color];

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full flex flex-col cursor-pointer border-l-4 ${s.border} hover:shadow-md hover:-translate-y-1 transition-all duration-200 group`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {current.toLocaleString()} 
            {max > 0 && <span className="text-sm text-gray-400 font-normal ml-1">/ {max}</span>}
          </p>
        </div>
        {Icon && <div className={`p-2 rounded-lg ${s.bgIcon} ${s.text} group-hover:scale-110 transition-transform`}><Icon className="w-5 h-5" /></div>}
      </div>
      
      {max > 0 && (
        <div className="mt-auto pt-2">
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full ${s.bar}`} style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---

export default function UsersAktifPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [activeTab, setActiveTab] = useState<MainTab>('dlh');
  const [activeDlhTab, setActiveDlhTab] = useState<DlhSubTab>('provinsi');
  const [searchTerm, setSearchTerm] = useState('');

  const [dlhProvData, setDlhProvData] = useState<PaginatedResponse | null>(null);
  const [dlhKabData, setDlhKabData] = useState<PaginatedResponse | null>(null);
  const [pusdatinData, setPusdatinData] = useState<PaginatedResponse | null>(null);
  const [adminData, setAdminData] = useState<PaginatedResponse | null>(null);

  const [stats, setStats] = useState({
    dlhProvinsi: 0,
    dlhKabKota: 0,
    pusdatin: 0,
    admin: 0,
  });

  const getEndpointConfig = useCallback((tab: string, dlhSubTab: string, page: number) => {
    if (tab === 'dlh') {
      if (dlhSubTab === 'provinsi') return { url: `/api/admin/provinsi/1?page=${page}`, key: `prov-${page}` };
      return { url: `/api/admin/kabupaten/1?page=${page}`, key: `kab-${page}` };
    }
    if (tab === 'pusdatin') return { url: `/api/admin/pusdatin/1?page=${page}`, key: `pus-${page}` };
    if (tab === 'admin') return { url: `/api/admin/admin/1?page=${page}`, key: `adm-${page}` };
    return { url: '', key: '' };
  }, []);

  const fetchWithCache = useCallback(async <T,>(endpoint: string, cacheKey: string, forceRefresh = false) => {
    if (!forceRefresh && dataCache[cacheKey]) {
      const age = Date.now() - dataCache[cacheKey].timestamp;
      if (age < CACHE_DURATION) return dataCache[cacheKey].data as T;
    }

    setLoading(prev => ({ ...prev, [cacheKey]: true }));
    try {
      const res = await axios.get(endpoint);
      const data = res.data;
      // Normalisasi format response (array vs object)
      const formattedData = Array.isArray(data) ? { data, total: data.length, last_page: 1, current_page: 1 } : data;
      
      dataCache[cacheKey] = { data: formattedData, timestamp: Date.now() };
      return formattedData as T;
    } catch (e) {
      console.error(`❌ Gagal fetch ${endpoint}`, e);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, []);

  // 1. Fetch Statistik
  useEffect(() => {
    const fetchStats = async () => {
      const [prov, kab, pus, adm] = await Promise.all([
        fetchWithCache<PaginatedResponse>('/api/admin/provinsi/1?per_page=1', 'stat-prov', refreshKey > 0),
        fetchWithCache<PaginatedResponse>('/api/admin/kabupaten/1?per_page=1', 'stat-kab', refreshKey > 0),
        fetchWithCache<PaginatedResponse>('/api/admin/pusdatin/1?per_page=1', 'stat-pus', refreshKey > 0),
        fetchWithCache<PaginatedResponse>('/api/admin/admin/1?per_page=1', 'stat-adm', refreshKey > 0),
      ]);

      setStats({
        dlhProvinsi: prov?.total || 0,
        dlhKabKota: kab?.total || 0,
        pusdatin: pus?.total || 0,
        admin: adm?.total || 0,
      });
    };
    fetchStats();
  }, [fetchWithCache, refreshKey]);

  // 2. Fetch Data Tabel
  useEffect(() => {
    const loadData = async () => {
      const { url, key } = getEndpointConfig(activeTab, activeDlhTab, currentPage);
      if (!url) return;

      const data = await fetchWithCache<PaginatedResponse>(url, key, refreshKey > 0);
      
      if (data) {
        if (activeTab === 'dlh') {
          if (activeDlhTab === 'provinsi') setDlhProvData(data);
          else setDlhKabData(data);
        } else if (activeTab === 'pusdatin') {
          setPusdatinData(data);
        } else if (activeTab === 'admin') {
          setAdminData(data);
        }
      }
    };
    loadData();
  }, [activeTab, activeDlhTab, currentPage, fetchWithCache, getEndpointConfig, refreshKey]);

  const handleStatClick = (tab: MainTab, subTab?: DlhSubTab) => {
    setActiveTab(tab);
    if (subTab) setActiveDlhTab(subTab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 3. Current Data Set (Pastikan adminData direturn)
  const currentDataSet = useMemo(() => {
    if (activeTab === 'dlh') return activeDlhTab === 'provinsi' ? dlhProvData : dlhKabData;
    if (activeTab === 'pusdatin') return pusdatinData;
    if (activeTab === 'admin') return adminData;
    return null;
  }, [activeTab, activeDlhTab, dlhProvData, dlhKabData, pusdatinData, adminData]);

  const rawUsers = useMemo(() => currentDataSet?.data || [], [currentDataSet]);
  
  // 4. Filtering (Handle null dinas/name untuk Admin)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return rawUsers;
    const lower = searchTerm.toLowerCase();
    
    return rawUsers.filter(u => {
      // Safe check menggunakan optional chaining (?.) dan fallback string kosong
      const name = u.name ? u.name.toLowerCase() : '';
      const email = u.email ? u.email.toLowerCase() : '';
      const dinasName = u.dinas?.nama_dinas ? u.dinas.nama_dinas.toLowerCase() : '';
      
      return name.includes(lower) || email.includes(lower) || dinasName.includes(lower);
    });
  }, [rawUsers, searchTerm]);

  const isTableLoading = loading[getEndpointConfig(activeTab, activeDlhTab, currentPage).key];

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manajemen Pengguna Aktif</h1>
          <p className="text-gray-500 mt-1">Kelola data pengguna yang terdaftar dan aktif dalam sistem.</p>
        </div>
        <button 
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow-sm hover:text-green-600 hover:border-green-200 transition-all"
        >
          <FiRefreshCw className={isTableLoading ? 'animate-spin' : ''} />
          <span className="text-sm font-medium">Refresh Data</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressStatCard 
          title="DLH Provinsi" current={stats.dlhProvinsi} max={38} color="blue" icon={FiUsers}
          onClick={() => handleStatClick('dlh', 'provinsi')}
        />
        <ProgressStatCard 
          title="DLH Kab/Kota" current={stats.dlhKabKota} max={514} color="blue" icon={FiUsers}
          onClick={() => handleStatClick('dlh', 'kabkota')}
        />
        <ProgressStatCard 
          title="Pusdatin" current={stats.pusdatin} max={0} color="green" icon={FiUserCheck}
          onClick={() => handleStatClick('pusdatin')}
        />
        <ProgressStatCard 
          title="Admin System" current={stats.admin} max={0} color="red" icon={FiShield}
          onClick={() => handleStatClick('admin')}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-4">
        <InnerNav 
          tabs={[
            { label: 'Dinas Lingkungan Hidup', value: 'dlh' },
            { label: 'Tim Pusdatin', value: 'pusdatin' },
            { label: 'Admin System', value: 'admin' }, 
          ]} 
          activeTab={activeTab} 
          onChange={(val) => { setActiveTab(val as MainTab); setCurrentPage(1); }} 
        />
        
        {activeTab === 'dlh' && (
          <InnerNav 
            tabs={[
              { label: 'Tingkat Provinsi', value: 'provinsi' },
              { label: 'Tingkat Kab/Kota', value: 'kabkota' },
            ]} 
            activeTab={activeDlhTab} 
            onChange={(val) => { setActiveDlhTab(val as DlhSubTab); setCurrentPage(1); }} 
            className="mt-2"
          />
        )}
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Cari nama, email, atau instansi...`}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      {isTableLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="flex items-center gap-4 animate-pulse">
               <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
               </div>
             </div>
          ))}
        </div>
      ) : (
        <>
          <UserTable
            users={filteredUsers.map((u) => ({
              id: u.id,
              name: u.name || u.email, // Fallback ke email jika name kosong (seperti Admin)
              email: u.email,
              // Logic role fallback yang aman
              role: (typeof u.role === 'string' ? u.role : u.role?.name) || 
                    (activeTab === 'admin' ? 'Admin' : activeTab === 'pusdatin' ? 'Pusdatin' : 'DLH'),
              jenis_dlh: activeTab === 'dlh' ? (activeDlhTab === 'provinsi' ? 'DLH Provinsi' : 'DLH Kab-Kota') : '-',
              status: 'aktif',
              // Logic lokasi yang aman dari undefined
              province: u.province_name || '-',
              regency: u.regency_name || '-',
            }))}
            showLocation={activeTab === 'dlh'}
            showDlhSpecificColumns={activeTab === 'dlh'}
          />

          {/* Pagination */}
          {currentDataSet && currentDataSet.total > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-500 font-medium">
                  Menampilkan <span className="text-gray-900 font-bold">{filteredUsers.length}</span> dari <span className="text-gray-900 font-bold">{currentDataSet.total}</span> data
              </span>
              
              <Pagination
                currentPage={currentPage}
                totalPages={currentDataSet.last_page || 1}
                onPageChange={setCurrentPage}
                siblings={1}
              />
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isTableLoading && filteredUsers.length === 0 && (
         <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
           <div className="bg-gray-50 p-4 rounded-full mb-3">
             <FiSearch className="w-8 h-8 text-gray-400" />
           </div>
           <p className="text-gray-900 font-medium">Data tidak ditemukan</p>
           <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain atau tab kategori berbeda.</p>
           {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="mt-4 text-green-600 hover:text-green-700 text-sm font-semibold">
               Reset Pencarian
             </button>
           )}
         </div>
      )}

    </div>
  );
}