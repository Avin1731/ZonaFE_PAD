'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import LastActivityCard, { Log } from '@/components/LastActivityCard';
import Pagination from '@/components/Pagination';
import InnerNav from '@/components/InnerNav';
import axios from '@/lib/axios';
import { FiSearch, FiActivity, FiRefreshCw, FiShield, FiDatabase, FiList } from 'react-icons/fi';

const LOGS_PER_PAGE = 25; // Wajib sama dengan Backend

type TabType = 'all' | 'admin' | 'pusdatin';

// Interface untuk menangkap response pagination Laravel
interface PaginatedResponse {
  data: Log[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function UsersLogsPage() {
  // --- STATE MANAGEMENT ---
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State Pagination Server-Side
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<TabType>('all'); 
  const [selectedYear, setSelectedYear] = useState<number | ''>(''); 
  const [searchTerm, setSearchTerm] = useState('');

  // Statistik (Sekarang pakai null untuk indicate loading awal saja)
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    pusdatin: 0,
    isLoaded: false // Flag untuk initial load
  });

  // --- API CALLS ---
  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', LOGS_PER_PAGE.toString());
      
      if (selectedYear) params.append('year', selectedYear.toString());
      if (activeTab !== 'all') params.append('role', activeTab);
      
      const url = `/api/admin/track?${params.toString()}`;
      
      const res = await axios.get<PaginatedResponse>(url);
      const responseData = res.data;
      
      const dataLogs = Array.isArray(responseData) ? responseData : responseData.data;
      const meta = !Array.isArray(responseData) ? responseData : { 
          last_page: 1, current_page: 1, total: dataLogs.length 
      };

      setLogs(dataLogs);
      setCurrentPage(meta.current_page);
      setTotalPages(meta.last_page);
      setTotalItems(meta.total);
      
      // Update stats: Selalu update angka terbaru, flag isLoaded jadi true
      setStats(prev => ({
        ...prev,
        total: activeTab === 'all' ? meta.total : prev.total, // Update total jika tab all
        // Untuk count spesifik per tab, kita update saat tab tersebut aktif
        admin: activeTab === 'admin' ? meta.total : prev.admin,
        pusdatin: activeTab === 'pusdatin' ? meta.total : prev.pusdatin,
        isLoaded: true
      }));

    } catch (error) {
      console.error('Gagal mengambil data log:', error);
      setLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedYear, activeTab]);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [fetchLogs, currentPage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs(currentPage);
  };

  const handleStatClick = (targetTab: TabType) => {
    setActiveTab(targetTab);
    setCurrentPage(1); 
    setSearchTerm(''); 
  };

  const handlePageChange = (page: number) => {
      setCurrentPage(page);
  };

  // --- LOGIC FILTERING (Client Side Search Only) ---
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;

    const lowerTerm = searchTerm.toLowerCase();
    return logs.filter(log => {
        const user = log.user ? log.user.toLowerCase() : '';
        const action = log.action ? log.action.toLowerCase() : '';
        const target = log.target ? log.target.toLowerCase() : '';
        const catatan = log.catatan ? log.catatan.toLowerCase() : '';

        return user.includes(lowerTerm) ||
               action.includes(lowerTerm) ||
               target.includes(lowerTerm) ||
               catatan.includes(lowerTerm);
    });
  }, [logs, searchTerm]);

  const navTabs = [
    { label: 'Semua Log', value: 'all' },
    { label: 'Admin System', value: 'admin' },
    { label: 'Pusdatin', value: 'pusdatin' },
  ];

  // --- RENDER ---

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50 relative z-0">
      
      {/* 1. Header & Refresh */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Log Riwayat
          </h1>
          <p className="text-gray-500 mt-1">
            Rekap jejak aktivitas sistem secara menyeluruh.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className={`flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <FiRefreshCw className={`${isRefreshing || loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh Data</span>
        </button>
      </header>

      {/* 2. Stats Section - UPDATED: Selalu Tampil Angka */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-0">
        <div onClick={() => handleStatClick('all')} className={`cursor-pointer group transition-all duration-200 ${activeTab === 'all' ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' : ''}`}>
          <StatCard 
            title="Total Log"
            // Tampilkan angka jika sudah loaded atau ada data, jika belum loaded (awal banget) baru '...'
            value={stats.isLoaded ? stats.total.toLocaleString() : '...'}
            type="neutral"
            tag="All Time"
            icon={<FiList className="w-8 h-8 group-hover:scale-110 transition-transform" />}
          />
        </div>

        <div onClick={() => handleStatClick('admin')} className={`cursor-pointer group transition-all duration-200 ${activeTab === 'admin' ? 'ring-2 ring-red-500 ring-offset-2 rounded-xl' : ''}`}>
          <StatCard 
            title="Aktivitas Admin"
            // Tampilkan angka statis jika belum diload spesifik, atau angka real jika sudah
            value={stats.isLoaded ? (stats.admin > 0 ? stats.admin.toLocaleString() : '-') : '...'}
            type="admin"
            tag="System Control"
            icon={<FiShield className="w-8 h-8 group-hover:scale-110 transition-transform" />}
          />
        </div>

        <div onClick={() => handleStatClick('pusdatin')} className={`cursor-pointer group transition-all duration-200 ${activeTab === 'pusdatin' ? 'ring-2 ring-green-500 ring-offset-2 rounded-xl' : ''}`}>
          <StatCard 
            title="Aktivitas Pusdatin"
            value={stats.isLoaded ? (stats.pusdatin > 0 ? stats.pusdatin.toLocaleString() : '-') : '...'}
            type="pusdatin"
            tag="User Activity"
            icon={<FiDatabase className="w-8 h-8 group-hover:scale-110 transition-transform" />}
          />
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div>
        <InnerNav 
          tabs={navTabs} 
          activeTab={activeTab} 
          onChange={(tab) => { setActiveTab(tab as TabType); setCurrentPage(1); }} 
        />
      </div>

      {/* 4. Toolbar (Search & Year Filter) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative z-0">
        
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Cari log ${activeTab === 'all' ? '' : activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm outline-none"
          />
        </div>

        {/* Filter Tahun */}
        <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
          <div className="relative min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiActivity className="text-gray-400" />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value === '' ? '' : Number(e.target.value)); setCurrentPage(1); }}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none cursor-pointer outline-none"
            >
              <option value="">Semua Tahun</option>
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Content Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredLogs.length > 0 ? (
        <>
          <LastActivityCard 
            logs={filteredLogs} 
            theme={activeTab === 'admin' ? 'red' : activeTab === 'pusdatin' ? 'green' : 'slate'}
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="text-gray-900 font-bold">{filteredLogs.length}</span> dari <span className="text-gray-900 font-bold">{totalItems}</span> log
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              siblings={1}
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-dashed p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSearch className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Data Tidak Ditemukan</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? `Tidak ada log yang cocok dengan "${searchTerm}".` 
              : `Belum ada riwayat aktivitas untuk kategori ${activeTab === 'all' ? 'ini' : activeTab}.`}
          </p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedYear(''); setActiveTab('all');}}
            className="mt-6 text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

    </div>
  );
}