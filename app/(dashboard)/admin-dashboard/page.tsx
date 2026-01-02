'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import Link from 'next/link';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, AlertCircle, Users, FileText, HardDrive, RefreshCw } from 'lucide-react';

// --- TYPES ---
interface TimelineItem {
  tahap: string;
  label: string;
  order: number;
  status: 'completed' | 'active' | 'pending';
  deadline?: {
    tanggal: string;
    tanggal_formatted: string;
    is_passed: boolean;
  };
  statistik?: {
    total_submission?: number;
    finalized?: number;
    total_dinilai?: number;
    lolos?: number;
    tidak_lolos?: number;
    total_peserta?: number;
    masuk_penghargaan?: number;
  };
}

interface TimelinePenilaian {
  year: number;
  tahap_aktif: string;
  tahap_label: string;
  pengumuman_terbuka: boolean;
  keterangan: string;
  tahap_mulai_at: string;
  progress_percentage: number;
  timeline: TimelineItem[];
  summary: {
    total_dinas_terdaftar: number;
    total_submission: number;
    lolos_slhd: number;
    masuk_penghargaan: number;
    lolos_validasi_1: number;
    lolos_validasi_2: number;
  };
}

interface DashboardData {
  total_users_aktif: number;
  total_users_pending: number;
  year: number;
  users: {
    total: number;
    pending_approval: number;
    active: number;
    by_role: {
      admin: number;
      pusdatin: number;
      dinas: number;
    };
    dinas_by_type: {
      provinsi: number;
      kabupaten_kota: number;
    };
  };
  submissions: {
    total: number;
    by_status: {
      draft: number;
      finalized: number;
      approved: number;
    };
  };
  storage: {
    used_mb: number;
    used_gb: number;
  };
  timeline_penilaian: TimelinePenilaian;
}

// --- ICONS ---
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- TIMELINE MODAL ---
function TimelineDetailModal({
  item,
  year,
  onClose,
  onUnfinalize
}: {
  item: TimelineItem;
  year: number;
  onClose: () => void;
  onUnfinalize: (tahap: string) => Promise<void>;
}) {
  const [isUnfinalizing, setIsUnfinalizing] = useState(false);

  const handleUnfinalize = async () => {
    if (!confirm(`Yakin ingin membuka kembali tahap "${item.label}"? Ini akan mengembalikan tahap ke status aktif.`)) return;
    
    setIsUnfinalizing(true);
    try {
      await onUnfinalize(item.tahap);
      onClose();
    } catch (error) {
      console.error('Gagal unfinalize:', error);
    } finally {
      setIsUnfinalizing(false);
    }
  };

  const canUnfinalize = item.status === 'completed' && item.tahap !== 'submission';

  const renderStatistik = () => {
    if (!item.statistik) return null;

    const stats = item.statistik;
    
    switch (item.tahap) {
      case 'submission':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Submission</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_submission || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Terfinalisasi</div>
              <div className="text-2xl font-bold text-green-600">{stats.finalized || 0}</div>
            </div>
          </div>
        );
      case 'penilaian_slhd':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Dinilai</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_dinilai || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Lolos</div>
              <div className="text-2xl font-bold text-green-600">{stats.lolos || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Tidak Lolos</div>
              <div className="text-2xl font-bold text-red-600">{stats.tidak_lolos || 0}</div>
            </div>
          </div>
        );
      case 'penilaian_penghargaan':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Peserta</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_peserta || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Masuk Penghargaan</div>
              <div className="text-2xl font-bold text-green-600">{stats.masuk_penghargaan || 0}</div>
            </div>
          </div>
        );
      case 'validasi_1':
      case 'validasi_2':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Peserta</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_peserta || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Lolos</div>
              <div className="text-2xl font-bold text-green-600">{stats.lolos || 0}</div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Tidak Lolos</div>
              <div className="text-2xl font-bold text-red-600">{stats.tidak_lolos || 0}</div>
            </div>
          </div>
        );
      case 'wawancara':
        return (
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Peserta</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_peserta || 0}</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 ${
            item.status === 'completed' ? 'bg-green-500' :
            item.status === 'active' ? 'bg-yellow-500' : 'bg-gray-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {item.status === 'completed' ? <Check className="w-5 h-5 text-white" /> :
                   item.status === 'active' ? <Clock className="w-5 h-5 text-white" /> :
                   <AlertCircle className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{item.label}</h3>
                  <span className={`text-sm ${
                    item.status === 'completed' ? 'text-green-100' :
                    item.status === 'active' ? 'text-yellow-100' : 'text-gray-200'
                  }`}>
                    {item.status === 'completed' ? 'Selesai' :
                     item.status === 'active' ? 'Sedang Berjalan' : 'Belum Dimulai'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Deadline info */}
            {item.deadline && (
              <div className={`p-4 rounded-lg ${item.deadline.is_passed ? 'bg-red-50' : 'bg-blue-50'}`}>
                <div className={`text-sm ${item.deadline.is_passed ? 'text-red-600' : 'text-blue-600'}`}>
                  Deadline
                </div>
                <div className={`text-lg font-semibold ${item.deadline.is_passed ? 'text-red-800' : 'text-blue-800'}`}>
                  {item.deadline.tanggal_formatted}
                </div>
                {item.deadline.is_passed && (
                  <div className="text-sm text-red-600 mt-1">⚠️ Deadline telah terlewat</div>
                )}
              </div>
            )}

            {/* Statistics */}
            {renderStatistik()}

            {/* Unfinalize button */}
            {canUnfinalize && (
              <div className="pt-4 border-t">
                <button
                  onClick={handleUnfinalize}
                  disabled={isUnfinalizing}
                  className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUnfinalizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Buka Kembali Tahap Ini
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ini akan mengembalikan tahap ke status aktif dan membuka akses edit
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- TIMELINE HORIZONTAL ---
function TimelineHorizontal({ 
  items, 
  year,
  onItemClick 
}: { 
  items: TimelineItem[];
  year: number;
  onItemClick: (item: TimelineItem) => void;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-lg text-gray-800 mb-6">Timeline Proses Penilaian {year}</h3>
      <div className="relative">
        {/* Line connector */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
        
        <div className="flex justify-between items-start relative">
          {items.map((item, index) => {
            let iconBg = "bg-gray-100 border-2 border-gray-300 text-gray-400";
            let iconContent: React.ReactNode = <ClockIcon />;

            if (item.status === 'completed') {
              iconBg = "bg-green-100 border-2 border-green-500 text-green-600";
              iconContent = <CheckIcon />;
            } else if (item.status === 'active') {
              iconBg = "bg-yellow-100 border-2 border-yellow-500 text-yellow-600";
              iconContent = <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />;
            }

            return (
              <div 
                key={index} 
                className="flex flex-col items-center z-10 cursor-pointer group" 
                style={{ width: `${100 / items.length}%` }}
                onClick={() => onItemClick(item)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
                  {iconContent}
                </div>
                <p className={`text-xs mt-2 text-center font-medium px-1 group-hover:text-green-600 transition-colors ${
                  item.status === 'completed' ? 'text-green-700' :
                  item.status === 'active' ? 'text-yellow-700' : 'text-gray-500'
                }`}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- TAHAPAN INFO CARD ---
function TahapanInfoCard({ timeline }: { timeline: TimelinePenilaian }) {
  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl h-[100%] p-6  text-white shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-5">
        <h3 className="font-bold text-lg">Tahap Aktif</h3>
        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
          {timeline.progress_percentage}% selesai
        </span>
      </div>
      <p className="text-2xl font-bold mb-2">{timeline.tahap_label}</p>
      <p className="text-green-50 text-sm leading-relaxed">{timeline.keterangan}</p>
      {timeline.pengumuman_terbuka && (
        <div className="mt-4 flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">Pengumuman Tersedia</span>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="mt-4 bg-white/20 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-white rounded-full h-2.5 transition-all duration-500 shadow-sm "
          style={{ width: `${timeline.progress_percentage}%` }}
        />
      </div>
    </div>
  );
}

// --- SUMMARY CARDS ---
function SummaryCards({ summary, submissions, storage }: { 
  summary: TimelinePenilaian['summary'];
  submissions: DashboardData['submissions'];
  storage: DashboardData['storage'];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Dinas Terdaftar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-600">Dinas Terdaftar</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{summary.total_dinas_terdaftar}</div>
      </div>
      
      {/* Total Submission */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-600">Total Submission</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{summary.total_submission}</div>
      </div>

      {/* Submission Draft */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-600">Submission Draft</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{submissions.by_status.draft}</div>
      </div>
      
      {/* Lolos SLHD */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-green-700">Lolos Penilaian SLHD</span>
        </div>
        <div className="text-2xl font-bold text-green-800">{summary.lolos_slhd}</div>
      </div>
      
      {/* Lolos Validasi 1 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-600">Lolos Validasi 1</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{summary.lolos_validasi_1}</div>
      </div>
      
      
      {/* Lolos Validasi 2 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-600">Lolos Validasi 2</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{summary.lolos_validasi_2}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Role guard
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    
    const role = user.role?.name?.toLowerCase();
    if (role !== 'admin') {
      // Redirect ke dashboard yang sesuai
      if (role === 'pusdatin') router.replace('/pusdatin-dashboard');
      else if (role === 'provinsi' || role === 'kabupaten/kota') router.replace('/dlh-dashboard');
      else router.replace('/login');
    }
  }, [user, router]);

  const fetchDashboard = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get('/api/admin/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Gagal mengambil statistik dashboard:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard();
  };

  const handleUnfinalize = async (tahap: string) => {
    if (!data) return;
    
    // Map tahap to API endpoint
    const tahapEndpointMap: Record<string, string> = {
      penilaian_slhd: 'slhd',
      penilaian_penghargaan: 'penghargaan',
      validasi_1: 'validasi1',
      validasi_2: 'validasi2',
      wawancara: 'wawancara',
    };
    
    const endpoint = tahapEndpointMap[tahap];
    if (!endpoint) {
      alert('Tahap ini tidak dapat di-unfinalize');
      return;
    }

    await axios.patch(`/api/admin/unfinalize/${endpoint}/${data.year}`);
    await fetchDashboard();
  };

  if (!user || loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>
          <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>
        </div>
        <div className="h-40 bg-gray-100 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali, Admin. Berikut ringkasan sistem saat ini.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            isRefreshing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium">{isRefreshing ? 'Memperbarui...' : 'Refresh'}</span>
        </button>
      </header>

      {/* Timeline Penilaian */}
      {data.timeline_penilaian && (
        <>
          {/* Tahap Aktif + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <TahapanInfoCard timeline={data.timeline_penilaian} />
            </div>
            <div className="lg:col-span-8">
              <SummaryCards 
                summary={data.timeline_penilaian.summary}
                submissions={data.submissions}
                storage={data.storage}
              />
            </div>
          </div>

          {/* Timeline */}
          <TimelineHorizontal 
            items={data.timeline_penilaian.timeline}
            year={data.year}
            onItemClick={setSelectedTimelineItem}
          />

          {/* Statistik User - Below Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/admin-dashboard/users/aktif"
              className="block group"
            >
              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Total User Aktif</p>
                    <p className="text-4xl font-bold text-green-700">{data.total_users_aktif}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Users className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </div>
            </Link>

            <Link 
              href="/admin-dashboard/users/pending"
              className="block group"
            >
              <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-yellow-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 mb-1">Menunggu Persetujuan (Pending)</p>
                    <p className="text-4xl font-bold text-yellow-700">{data.total_users_pending}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                    <Clock className="w-7 h-7 text-yellow-600" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
           href="/admin-dashboard/settings"
           className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
           <div>
             <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">Kelola Pusdatin</h3>
             <p className="text-sm text-gray-500">Tambah atau hapus akun khusus Pusdatin.</p>
           </div>
           <span className="text-2xl text-gray-400 group-hover:text-green-500">&rarr;</span>
        </Link>

        <Link 
           href="/admin-dashboard/users/logs"
           className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
           <div>
             <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Lihat Log Aktivitas</h3>
             <p className="text-sm text-gray-500">Pantau riwayat aktivitas pengguna di sistem.</p>
           </div>
           <span className="text-2xl text-gray-400 group-hover:text-blue-500">&rarr;</span>
        </Link>
      </div>

      {/* Timeline Detail Modal */}
      {selectedTimelineItem && (
        <TimelineDetailModal
          item={selectedTimelineItem}
          year={data.year}
          onClose={() => setSelectedTimelineItem(null)}
          onUnfinalize={handleUnfinalize}
        />
      )}
    </div>
  );
}