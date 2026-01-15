'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { HiPlus, HiSearch } from 'react-icons/hi';
import StatCard from '@/components/StatCard';
import UserTable from '@/components/UserTable';
import Pagination from '@/components/Pagination';
import UniversalModal from '@/components/UniversalModal';
import { User } from '@/context/AuthContext';

const USERS_PER_PAGE = 10;

// Definisi Tipe Modal Config agar Type-Safe
interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'danger'; // Hapus 'info' karena tidak didukung UniversalModal
  showCancel: boolean;
  onConfirm: () => void;
}

const DEFAULT_MODAL: ModalConfig = {
  isOpen: false,
  title: '',
  message: '',
  variant: 'warning', // Default safe value
  showCancel: false,
  onConfirm: () => {},
};

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modal, setModal] = useState<ModalConfig>(DEFAULT_MODAL);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/pusdatin/1?per_page=500');
      setUsers(res.data.data || []);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nomor_telepon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = (id: number) => {
    const user = users.find(u => u.id === id);
    setModal({
      isOpen: true,
      title: 'Hapus Akun?',
      message: `Anda yakin ingin menghapus akun ${user?.email}? Tindakan ini permanen.`,
      variant: 'danger',
      showCancel: true,
      onConfirm: () => performDelete(id),
    });
  };

  const performDelete = async (id: number) => {
    setModal(prev => ({ ...prev, isOpen: false })); 
    setIsDeleting(true);

    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      
      setModal({
        ...DEFAULT_MODAL,
        isOpen: true,
        title: 'Berhasil',
        message: 'Akun berhasil dihapus.',
        variant: 'success',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
      });
    } catch (error) {
      console.error(error); // Log error agar variable terpakai
      setModal({
        ...DEFAULT_MODAL,
        isOpen: true,
        title: 'Gagal',
        message: 'Terjadi kesalahan saat menghapus akun.',
        variant: 'danger',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Pengaturan Pusdatin</h1>
          <p className="text-gray-500 mt-1">Kelola akun pengguna khusus tim Pusat Data dan Informasi.</p>
        </div>
        <Link
          href="/admin-dashboard/settings/add"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <HiPlus className="text-lg" />
          <span>Buat Akun Baru</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Akun Pusdatin"
          value={users.length}
          // Gunakan tipe 'custom' agar properti custom warna valid
          type="custom"
          customBg="bg-green-50"
          customBorder="border-l-green-400"
          customTitleColor="text-green-800"
          customValueColor="text-green-900"
          customIconBg="bg-green-100"
          customIconColor="text-green-600"
        />
        
        <div className="lg:col-span-3 flex items-end">
          <div className="relative w-full">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau nomor HP..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <UserTable
              users={paginatedUsers.map(u => ({
                id: u.id,
                name: u.name || u.email,
                email: u.email,
                role: 'Pusdatin',
                status: 'aktif',
                province: '-',
                regency: '-',
              }))}
              showLocation={false}
              showDlhSpecificColumns={false}
              onDelete={handleDelete}
              isSubmitting={isDeleting}
            />

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                Tidak ada data akun ditemukan.
              </div>
            )}

            {filteredUsers.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold text-gray-900">{paginatedUsers.length}</span> dari <span className="font-semibold text-gray-900">{filteredUsers.length}</span> akun
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <UniversalModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        showCancelButton={modal.showCancel}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        confirmLabel="Ya, Lanjutkan"
        cancelLabel="Batal"
      />
    </div>
  );
}