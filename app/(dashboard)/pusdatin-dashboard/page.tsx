'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

interface DashboardData {
  summary: {
    total_dlh: number;
    total_pengajuan_buku1: number;
    total_pengajuan_buku2: number;
    total_pengajuan_iklh: number;
    rata_rata_nilai: string | null;
  };
  tahap: {
    aktif: string;
    label: string;
    pengumuman_terbuka: boolean;
    keterangan: string;
  };
  progress: {
    buku1: {
      label: string;
      approved: number;
      finalized: number;
      percentage: number;
      is_finalized: boolean;
    };
    buku2: {
      label: string;
      approved: number;
      finalized: number;
      percentage: number;
      is_finalized: boolean;
    };
    iklh: {
      label: string;
      approved: number;
      finalized: number;
      percentage: number;
      is_finalized: boolean;
    };
    slhd: {
      label: string;
      lolos: number;
      total: number;
      percentage: number;
      is_finalized: boolean;
    };
    penghargaan: {
      label: string;
      lolos: number;
      total: number;
      percentage: number;
      is_finalized: boolean;
    };
    validasi1: {
      label: string;
      lolos: number;
      total: number;
      percentage: number;
      is_finalized: boolean;
    };
    validasi2: {
      label: string;
      lolos: number;
      total: number;
      percentage: number;
      is_finalized: boolean;
    };
    wawancara: {
      label: string;
      dinilai: number;
      total: number;
      percentage: number;
      is_finalized: boolean;
    };
  };
}

export default function PusdatinDashboardPage() {
  const { user } = useAuth();
  const userName = user?.name || 'Pusdatin';
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/pusdatin/dashboard/stats?year=${year}`);
        setDashboardData(res.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [year]);

  // Tampilkan UI Loading
  if (loading) {
    return (
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-400 animate-pulse">
            Selamat Datang, {userName.toUpperCase()}
          </h1>
        </header>
        <div className="h-96 w-full bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  const data = dashboardData;

  // Tampilkan UI setelah data terisi
  return (
    <div className="space-y-6 px-8 pb-10 animate-fade-in">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {userName.toUpperCase()}
        </h1>
      </header>

      {/* Statistik Utama (5 Kartu) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm text-gray-600 mb-2">Jumlah DLH Terdaftar</p>
          <p className="text-3xl font-bold text-gray-900">{data?.summary.total_dlh || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm text-gray-600 mb-2">Total Pengajuan Ringkasan Eksekutif</p>
          <p className="text-3xl font-bold text-gray-900">{data?.summary.total_pengajuan_buku1 || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm text-gray-600 mb-2">Total Pengajuan Laporan Utama</p>
          <p className="text-3xl font-bold text-gray-900">{data?.summary.total_pengajuan_buku2 || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-sm text-gray-600 mb-2">Total Pengajuan IKLH</p>
          <p className="text-3xl font-bold text-gray-900">{data?.summary.total_pengajuan_iklh || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-green-50 to-white">
          <p className="text-sm text-green-700 mb-2">Status Tahap Saat Ini</p>
          <p className="text-lg font-bold text-green-800">{data?.tahap.label || '-'}</p>
          <p className="text-xs text-green-600 mt-1 line-clamp-2">{data?.tahap.keterangan || ''}</p>
        </div>
      </section>

      {/* Progress Cards - 8 Cards dalam Grid 2x4 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4">Progress Penilaian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ringkasan Eksekutif */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.buku1.label || 'Ringkasan Eksekutif'}</h3>
              {data?.progress.buku1.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.buku1.approved || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.buku1.finalized || 0} Disetujui</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.buku1.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.buku1.percentage || 0}% Selesai</p>
          </div>

          {/* Card 2: Laporan Utama */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.buku2.label || 'Laporan Utama'}</h3>
              {data?.progress.buku2.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.buku2.approved || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.buku2.finalized || 0} Disetujui</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.buku2.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.buku2.percentage || 0}% Selesai</p>
          </div>

          {/* Card 3: IKLH */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.iklh.label || 'IKLH'}</h3>
              {data?.progress.iklh.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.iklh.approved || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.iklh.finalized || 0} Disetujui</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.iklh.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.iklh.percentage || 0}% Selesai</p>
          </div>

          {/* Card 4: Tahap 1 (SLHD) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.slhd.label || 'Tahap 1 (SLHD)'}</h3>
              {data?.progress.slhd.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.slhd.lolos || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.slhd.total || 0} Lolos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.slhd.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.slhd.percentage || 0}% Selesai</p>
          </div>

          {/* Card 5: Tahap 2 (Penghargaan) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.penghargaan.label || 'Tahap 2 (Penghargaan)'}</h3>
              {data?.progress.penghargaan.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.penghargaan.lolos || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.penghargaan.total || 0} Lolos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.penghargaan.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.penghargaan.percentage || 0}% Selesai</p>
          </div>

          {/* Card 6: Tahap 3 (Validasi 1) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.validasi1.label || 'Tahap 3 (Validasi 1)'}</h3>
              {data?.progress.validasi1.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.validasi1.lolos || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.validasi1.total || 0} Lolos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.validasi1.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.validasi1.percentage || 0}% Selesai</p>
          </div>

          {/* Card 7: Tahap 4 (Validasi 2) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.validasi2.label || 'Tahap 4 (Validasi 2)'}</h3>
              {data?.progress.validasi2.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.validasi2.lolos || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.validasi2.total || 0} Lolos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.validasi2.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.validasi2.percentage || 0}% Selesai</p>
          </div>

          {/* Card 8: Tahap 5 (Wawancara) */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{data?.progress.wawancara.label || 'Tahap 5 (Wawancara)'}</h3>
              {data?.progress.wawancara.is_finalized && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Finalized</span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{data?.progress.wawancara.dinilai || 0}</span>
              <span className="text-sm text-gray-500 mb-1">/ {data?.progress.wawancara.total || 0} Dinilai</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${data?.progress.wawancara.percentage || 0}%`}}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{data?.progress.wawancara.percentage || 0}% Selesai</p>
          </div>
        </div>
      </section>

      {/* Aktivitas Terkini */}
      <section className="mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Aktivitas Terkini</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Belum ada aktivitas terkini</p>
          </div>
        </div>
      </section>
    </div>
  );
}