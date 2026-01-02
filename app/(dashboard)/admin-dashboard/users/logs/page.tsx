'use client';

import { useState, useEffect, useMemo } from 'react';
import StatCard from '@/components/StatCard';
import LastActivityCard, { Log } from '@/components/LastActivityCard';
import Pagination from '@/components/Pagination';
import axios from '@/lib/axios';
import { FiSearch } from 'react-icons/fi';

const LOGS_PER_PAGE = 25;

const statCardColors = [
  { bg: 'bg-slate-50', border: 'border-slate-300', titleColor: 'text-slate-600', valueColor: 'text-slate-800' },
  { bg: 'bg-green-50', border: 'border-green-300', titleColor: 'text-green-600', valueColor: 'text-green-800' },
];

export default function UsersLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>(''); // Default kosong = semua tahun
  const [selectedPusdatin, setSelectedPusdatin] = useState('');
  const [pusdatinList, setPusdatinList] = useState<Array<{id: number, email: string}>>([]);

  // Statistik
  const [stats, setStats] = useState({
    totalLogs: 0,
    pusdatinLogs: 0,
  });

  // Fetch pusdatin list untuk dropdown
  useEffect(() => {
    const fetchPusdatinList = async () => {
      try {
        const res = await axios.get('/api/admin/pusdatin/approved');
        const users = Array.isArray(res.data) ? res.data : res.data.data || [];
        setPusdatinList(users.map((u: any) => ({ id: u.id, email: u.email })));
      } catch (error) {
        console.error('Gagal mengambil daftar pusdatin:', error);
      }
    };
    fetchPusdatinList();
  }, []);

  // Fetch data dari API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        
        // Build URL dengan query params (lebih fleksibel)
        const params = new URLSearchParams();
        if (selectedYear) params.append('year', selectedYear.toString());
        if (selectedPusdatin) params.append('pusdatin_id', selectedPusdatin);
        
        const url = `/api/admin/track?${params.toString()}`;
        
        const res = await axios.get(url);
        const data: Log[] = Array.isArray(res.data) ? res.data : res.data.data || [];

        setLogs(data);
        setStats({
          totalLogs: data.length,
          pusdatinLogs: data.length, // Semua log dari backend sudah pusdatin
        });
      } catch (error) {
        console.error('Gagal mengambil data log:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [selectedYear, selectedPusdatin]);

  // Filter logs - hanya search term (backend sudah filter by year & pusdatin)
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by search term (client-side)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.user?.toLowerCase().includes(lowerTerm) ||
        log.action?.toLowerCase().includes(lowerTerm) ||
        log.target?.toLowerCase().includes(lowerTerm)
      );
    }

    return result;
  }, [logs, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * LOGS_PER_PAGE;
    return filteredLogs.slice(start, start + LOGS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Stats Data
  const statsData = [
    { title: 'Total Semua Log', value: stats.totalLogs },
    { title: 'Log Aktivitas Pusdatin', value: stats.pusdatinLogs },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Memuat Log...</h1>
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800">Log Aktivitas Pusdatin</h1>
        <p className="text-gray-600">Riwayat aktivitas pengguna Pusdatin dalam sistem.</p>
      </header>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Tahun</option>
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Pusdatin Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pusdatin
            </label>
            <select
              value={selectedPusdatin}
              onChange={(e) => setSelectedPusdatin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Pusdatin</option>
              {pusdatinList.map(p => (
                <option key={p.id} value={p.id}>{p.email}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aktivitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Semua Log</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Log Aktivitas Pusdatin</h3>
          <p className="text-3xl font-bold text-green-600">{stats.pusdatinLogs}</p>
        </div>
      </div>

      {/* Log Table */}
      {paginatedLogs.length > 0 ? (
        <LastActivityCard
          logs={paginatedLogs}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada log yang cocok dengan pencarian' : 'Belum ada log aktivitas Pusdatin'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {paginatedLogs.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-gray-600">
            Menampilkan {paginatedLogs.length} dari {filteredLogs.length} log
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            siblings={1}
          />
        </div>
      )}
    </div>
  );
}
