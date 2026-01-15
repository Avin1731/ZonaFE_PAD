'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import InnerNav from '@/components/InnerNav';
import UserTable, { UserTableRow } from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';
import { FiSearch, FiClock, FiAlertCircle } from 'react-icons/fi';

// Warna StatCard untuk Pending (Nuansa Kuning/Orange)
const statCardColors = [
  { bg: 'bg-orange-50', border: 'border-orange-200', titleColor: 'text-orange-700', valueColor: 'text-orange-900' },
  { bg: 'bg-yellow-50', border: 'border-yellow-200', titleColor: 'text-yellow-700', valueColor: 'text-yellow-900' },
];

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  confirmLabel: 'Ya',
  showCancelButton: true,
  onConfirm: () => {},
};

// Interface Data User dari API
interface ApiUserData {
  id: number;
  name: string;
  email: string;
  role: string;
  province_name?: string;
  regency_name?: string;
  dinas?: { nama_dinas: string };
}

// Interface Response Pagination
interface PaginatedResponse {
  data: ApiUserData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Custom Error Interface
interface ApiError {
    response?: {
        data?: {
            message?: string;
        }
    }
}

export default function UsersPendingPage() {
  // State Management
  const [activeTab, setActiveTab] = useState<'provinsi' | 'kabkota'>('provinsi');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<ApiUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Action State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);

  // Stats State
  const [stats, setStats] = useState({
    dlhProvinsi: 0,
    dlhKabKota: 0,
    isLoaded: false
  });

  // --- 1. FETCH DATA (Server-Side Pagination) ---
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Mapping tab ke parameter API
      // 'provinsi' -> API role 'provinsi'
      // 'kabkota' -> API role 'kabupaten' (Backend akan convert jadi 'kabupaten/kota')
      const roleParam = activeTab === 'provinsi' ? 'provinsi' : 'kabupaten';
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', '10');
      if (searchTerm) params.append('search', searchTerm);

      // Endpoint: /api/admin/{role}/pending
      const url = `/api/admin/${roleParam}/pending?${params.toString()}`;
      
      const res = await axios.get<PaginatedResponse>(url);
      const responseData = res.data;

      setUsers(responseData.data);
      setCurrentPage(responseData.current_page);
      setTotalPages(responseData.last_page);
      setTotalItems(responseData.total);

      // Update stats count secara real-time berdasarkan total dari API
      setStats(prev => ({
        ...prev,
        [activeTab === 'provinsi' ? 'dlhProvinsi' : 'dlhKabKota']: responseData.total,
        isLoaded: true
      }));

    } catch (error) {
      console.error('Gagal mengambil data user pending:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  // Fetch Stats Awal (Init)
  useEffect(() => {
    const initStats = async () => {
        try {
            const [provRes, kabRes] = await Promise.all([
                axios.get('/api/admin/provinsi/pending?per_page=1'),
                axios.get('/api/admin/kabupaten/pending?per_page=1')
            ]);
            setStats({
                dlhProvinsi: provRes.data.total,
                dlhKabKota: kabRes.data.total,
                isLoaded: true
            });
        } catch (e) { console.error("Init stats error", e); }
    };
    if (!stats.isLoaded) initStats();
  }, [stats.isLoaded]);

  // Trigger fetch saat page/tab/search berubah
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchData(currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData, currentPage]);

  // Reset page saat ganti tab atau search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);


  // --- 2. ACTION HANDLERS ---

  const handleApproveClick = (id: number) => {
    const targetUser = users.find(u => u.id === id);
    setModalConfig({
      title: 'Konfirmasi Approve',
      message: `Apakah Anda yakin ingin menyetujui akun ${targetUser?.email}?`,
      variant: 'warning',
      confirmLabel: 'Ya, Setujui',
      showCancelButton: true,
      onConfirm: () => performAction('approve', id),
    });
    setIsModalOpen(true);
  };

  const handleRejectClick = (id: number) => {
    const targetUser = users.find(u => u.id === id);
    setModalConfig({
      title: 'Konfirmasi Tolak',
      message: `Apakah Anda yakin ingin menolak akun ${targetUser?.email}? Akun akan dihapus permanen.`,
      variant: 'danger',
      confirmLabel: 'Ya, Tolak',
      showCancelButton: true,
      onConfirm: () => performAction('reject', id),
    });
    setIsModalOpen(true);
  };

  const performAction = async (action: 'approve' | 'reject', id: number) => {
    setIsSubmitting(true);
    setIsModalOpen(false); 

    try {
      if (action === 'approve') {
        await axios.patch(`/api/admin/users/approve/${id}`);
      } else {
        await axios.delete(`/api/admin/users/reject/${id}`);
      }

      // Tampilkan Modal Sukses
      setModalConfig({
        title: 'Berhasil',
        message: `User berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}.`,
        variant: 'success',
        confirmLabel: 'OK',
        showCancelButton: false,
        onConfirm: () => {
            setIsModalOpen(false);
            fetchData(currentPage); // Refresh data table
        }, 
      });
      setIsModalOpen(true);

    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Gagal ${action}:`, error);
      setModalConfig({
        title: 'Gagal',
        message: apiError.response?.data?.message || 'Terjadi kesalahan sistem.',
        variant: 'danger',
        confirmLabel: 'Tutup',
        showCancelButton: false,
        onConfirm: () => setIsModalOpen(false),
      });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // --- 3. UI HELPERS ---

  const dlhTabs = [
    { label: 'Provinsi', value: 'provinsi' },
    { label: 'Kab/Kota', value: 'kabkota' },
  ];

  // Transform data untuk tabel (Sesuaikan dengan UserTableRow interface)
  const tableData: UserTableRow[] = useMemo(() => {
    return users.map(u => ({
      id: u.id,
      name: u.dinas?.nama_dinas || u.email,
      email: u.email,
      role: 'DLH',
      jenis_dlh: activeTab === 'provinsi' ? 'DLH Provinsi' : 'DLH Kab-Kota',
      status: 'pending',
      province: u.province_name ?? '-',
      regency: u.regency_name ?? '-',
    }));
  }, [users, activeTab]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-yellow-800">Manajemen Pengguna Pending</h1>
        <p className="text-gray-600">Daftar pengguna DLH yang menunggu persetujuan admin.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => setActiveTab('provinsi')} className="cursor-pointer group">
            <StatCard
                title="Total DLH Provinsi Pending"
                value={stats.isLoaded ? stats.dlhProvinsi : '...'}
                type="custom"
                icon={<FiAlertCircle className="w-6 h-6" />}
                {...statCardColors[0]}
                className={activeTab === 'provinsi' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
            />
        </div>
        <div onClick={() => setActiveTab('kabkota')} className="cursor-pointer group">
            <StatCard
                title="Total DLH Kab/Kota Pending"
                value={stats.isLoaded ? stats.dlhKabKota : '...'}
                type="custom"
                icon={<FiClock className="w-6 h-6" />}
                {...statCardColors[1]}
                className={activeTab === 'kabkota' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
            />
        </div>
      </div>

      {/* Tabs */}
      <InnerNav
        tabs={dlhTabs}
        activeTab={activeTab}
        onChange={(value) => setActiveTab(value as 'provinsi' | 'kabkota')}
      />

      {/* Search Bar */}
      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari email atau nama dinas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      ) : (
        <>
          <UserTable
            users={tableData}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            showLocation={true}
            showDlhSpecificColumns={true}
            isSubmitting={isSubmitting}
          />

          {/* Pagination */}
          {totalItems > 0 ? (
            <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-600">
                Menampilkan {users.length} dari {totalItems} pengguna
                </span>
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                siblings={1}
                />
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl mt-4">
                <p className="text-gray-500">Tidak ada data pending.</p>
            </div>
          )}
        </>
      )}

      {/* Modal Universal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
        showCancelButton={modalConfig.showCancelButton}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}