'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, AlertCircle, Users, FileText, RefreshCw } from 'lucide-react';

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
const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'completed') return <Check className="w-5 h-5 text-white" />;
    if (status === 'active') return <Clock className="w-5 h-5 text-white" />;
    return <AlertCircle className="w-5 h-5 text-white" />;
};

// --- TIMELINE MODAL ---
function TimelineDetailModal({
  item,
  // year, // Hapus 'year' jika tidak dipakai
  onClose,
  onUnfinalize
}: {
  item: TimelineItem;
  year: number; // Tetap definisikan di prop type agar konsisten
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
      alert('Gagal memproses permintaan.');
    } finally {
      setIsUnfinalizing(false);
    }
  };

  const canUnfinalize = item.status === 'completed' && item.tahap !== 'submission';

  const StatBox = ({ label, value, colorClass = "text-gray-900" }: { label: string, value: number | string, colorClass?: string }) => (
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="text-sm text-gray-600">{label}</div>
          <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      </div>
  );

  const renderStatistik = () => {
    if (!item.statistik) return null;
    const stats = item.statistik;
    
    const Grid = ({ children, cols = 2 }: { children: React.ReactNode, cols?: number }) => (
        <div className={`grid grid-cols-${cols} gap-4`}>{children}</div>
    );

    switch (item.tahap) {
      case 'submission':
        return (
          <Grid>
            <StatBox label="Total Submission" value={stats.total_submission || 0} />
            <StatBox label="Terfinalisasi" value={stats.finalized || 0} colorClass="text-green-600" />
          </Grid>
        );
      case 'penilaian_slhd':
      case 'validasi_1':
      case 'validasi_2':
        return (
          <Grid cols={3}>
            <StatBox label={item.tahap === 'penilaian_slhd' ? "Total Dinilai" : "Total Peserta"} value={item.tahap === 'penilaian_slhd' ? (stats.total_dinilai || 0) : (stats.total_peserta || 0)} />
            <StatBox label="Lolos" value={stats.lolos || 0} colorClass="text-green-600" />
            <StatBox label="Tidak Lolos" value={stats.tidak_lolos || 0} colorClass="text-red-600" />
          </Grid>
        );
      case 'penilaian_penghargaan':
        return (
          <Grid>
            <StatBox label="Total Peserta" value={stats.total_peserta || 0} />
            <StatBox label="Masuk Penghargaan" value={stats.masuk_penghargaan || 0} colorClass="text-green-600" />
          </Grid>
        );
      case 'wawancara':
        return <StatBox label="Total Peserta" value={stats.total_peserta || 0} />;
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
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-6 ${
            item.status === 'completed' ? 'bg-green-600' :
            item.status === 'active' ? 'bg-amber-500' : 'bg-gray-500'
          }`}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <StatusIcon status={item.status} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{item.label}</h3>
                  <span className="text-sm opacity-90">
                    {item.status === 'completed' ? 'Selesai' :
                     item.status === 'active' ? 'Sedang Berjalan' : 'Belum Dimulai'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {item.deadline && (
              <div className={`p-4 rounded-lg border ${item.deadline.is_passed ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className={`text-sm font-semibold mb-1 ${item.deadline.is_passed ? 'text-red-600' : 'text-blue-600'}`}>
                  Deadline
                </div>
                <div className={`text-lg font-bold ${item.deadline.is_passed ? 'text-red-800' : 'text-blue-800'}`}>
                  {item.deadline.tanggal_formatted}
                </div>
                {item.deadline.is_passed && (
                  <div className="text-xs font-medium text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3"/> Deadline telah terlewat
                  </div>
                )}
              </div>
            )}

            {renderStatistik()}

            {canUnfinalize && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleUnfinalize}
                  disabled={isUnfinalizing}
                  className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Tindakan ini akan mengembalikan status tahap menjadi aktif dan membuka akses edit.
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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <h3 className="font-bold text-lg text-gray-800 mb-8 sticky left-0">Timeline Proses Penilaian {year}</h3>
      <div className="relative min-w-[800px]"> 
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full" />
        
        <div className="flex justify-between items-start relative">
          {items.map((item, index) => {
            const isCompleted = item.status === 'completed';
            const isActive = item.status === 'active';

            return (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center z-10 cursor-pointer group w-full" 
                onClick={() => onItemClick(item)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500 border-green-100 text-white shadow-green-200 shadow-lg' :
                  isActive ? 'bg-amber-500 border-amber-100 text-white shadow-amber-200 shadow-lg ring-4 ring-amber-50' :
                  'bg-white border-gray-200 text-gray-300'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : 
                   isActive ? <Clock className="w-5 h-5" /> : 
                   <div className="w-3 h-3 bg-gray-300 rounded-full" />}
                </div>
                <p className={`text-xs mt-3 text-center font-semibold px-2 transition-colors ${
                  isCompleted ? 'text-green-700' :
                  isActive ? 'text-amber-700' : 'text-gray-400'
                }`}>
                  {item.label}
                </p>
              </motion.div>
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
    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl h-full p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
             <h3 className="font-semibold text-green-100 uppercase tracking-wider text-xs">Tahap Aktif</h3>
          </div>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
            {timeline.progress_percentage}% Selesai
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-3">{timeline.tahap_label}</h2>
        <p className="text-green-50 text-sm leading-relaxed opacity-90 mb-6">{timeline.keterangan}</p>
        
        {timeline.pengumuman_terbuka && (
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">📢 Pengumuman Tersedia</span>
          </div>
        )}
        
        <div className="mt-8">
           <div className="flex justify-between text-xs text-green-200 mb-2">
               <span>Progress</span>
               <span>{timeline.progress_percentage}%</span>
           </div>
           <div className="bg-black/20 rounded-full h-1.5 overflow-hidden">
             <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${timeline.progress_percentage}%` }} 
               transition={{ duration: 1, ease: "easeOut" }}
               className="bg-green-300 h-full rounded-full shadow-[0_0_10px_rgba(134,239,172,0.5)]" 
             />
           </div>
        </div>
      </div>
    </div>
  );
}

// --- [FIXED] SUMMARY CARD COMPONENT (Dipindahkan keluar) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SummaryStatCard = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: number, colorClass: string }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all hover:border-green-100 group">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
  </div>
);

// --- SUMMARY CARDS ---
function SummaryCards({ summary, submissions }: { 
  summary: TimelinePenilaian['summary'];
  submissions: DashboardData['submissions'];
}) {
  // Komponen 'Card' dihapus dari sini karena menyebabkan re-render issue.
  // Gunakan SummaryStatCard yang sudah dipindah ke luar.

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
      <SummaryStatCard icon={Users} label="Dinas Terdaftar" value={summary.total_dinas_terdaftar} colorClass="bg-blue-100 text-blue-600" />
      <SummaryStatCard icon={FileText} label="Total Submission" value={summary.total_submission} colorClass="bg-purple-100 text-purple-600" />
      <SummaryStatCard icon={FileText} label="Draft" value={submissions.by_status.draft} colorClass="bg-gray-100 text-gray-600" />
      <SummaryStatCard icon={Check} label="Lolos SLHD" value={summary.lolos_slhd} colorClass="bg-green-100 text-green-600" />
      <SummaryStatCard icon={Check} label="Lolos Validasi 1" value={summary.lolos_validasi_1} colorClass="bg-emerald-100 text-emerald-600" />
      <SummaryStatCard icon={Check} label="Lolos Validasi 2" value={summary.lolos_validasi_2} colorClass="bg-teal-100 text-teal-600" />
    </div>
  );
}

// --- MAIN PAGE ---
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);

  // Role guard
  useEffect(() => {
    isMounted.current = true;
    if (!user) {
      router.replace('/login');
    } else {
      const role = user.role?.name?.toLowerCase();
      if (role !== 'admin') {
        if (role === 'pusdatin') router.replace('/pusdatin-dashboard');
        else if (role === 'provinsi' || role === 'kabupaten/kota') router.replace('/dlh-dashboard');
        else router.replace('/login');
      }
    }
    return () => { isMounted.current = false; };
  }, [user, router]);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    
    try {
      const res = await axios.get('/api/admin/dashboard');
      if (isMounted.current) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Gagal mengambil statistik dashboard:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard();
  };

  const handleUnfinalize = async (tahap: string) => {
    if (!data) return;
    
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
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-64 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="lg:col-span-8 h-64 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Ringkasan status penilaian tahun <span className="font-semibold text-gray-900">{data.year}</span></p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-sm ${
            isRefreshing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:text-green-600 hover:shadow-md'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-medium text-sm">{isRefreshing ? 'Syncing...' : 'Refresh Data'}</span>
        </button>
      </header>

      {/* Main Content Area */}
      {data.timeline_penilaian && (
        <div className="space-y-6">
          {/* Top Section: Hero Card & Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-full">
              <TahapanInfoCard timeline={data.timeline_penilaian} />
            </div>
            <div className="lg:col-span-8 h-full">
              <SummaryCards 
                summary={data.timeline_penilaian.summary}
                submissions={data.submissions}
              />
            </div>
          </div>

          {/* Timeline Section */}
          <TimelineHorizontal 
            items={data.timeline_penilaian.timeline}
            year={data.year}
            onItemClick={setSelectedTimelineItem}
          />

          {/* User Stats & Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Active Card */}
            <Link 
              href="/admin-dashboard/users/aktif"
              className="block group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden h-full">
                <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{data.total_users_aktif}</p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-green-600 transition-colors">Total User Aktif &rarr;</p>
                </div>
              </div>
            </Link>

            {/* User Pending Card */}
            <Link 
              href="/admin-dashboard/users/pending"
              className="block group"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden h-full">
                <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{data.total_users_pending}</p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-amber-600 transition-colors">Menunggu Approval &rarr;</p>
                </div>
              </div>
            </Link>

            {/* Quick Settings */}
            <Link 
               href="/admin-dashboard/settings"
               className="block group"
            >
               <div className="bg-gray-900 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden h-full text-white">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                 <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                     <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                       <Users className="w-6 h-6 text-white" />
                     </div>
                     <h3 className="text-lg font-bold mb-1">Kelola Pusdatin</h3>
                     <p className="text-gray-400 text-sm">Manajemen akun tim pusat data.</p>
                   </div>
                   <div className="mt-4 flex justify-end">
                     <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-all">&rarr;</span>
                   </div>
                 </div>
               </div>
            </Link>
          </div>
        </div>
      )}

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