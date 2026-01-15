'use client';

import { useState, useEffect, useCallback } from 'react';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';
import { Calendar, Clock, Save, AlertCircle, RefreshCw } from 'lucide-react';

// --- TYPES ---
interface DeadlineData {
  year: string;
  deadline: string;
  catatan: string;
  is_passed: boolean;
}

// Interface khusus untuk menangani Error Axios
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function PengaturanDeadlinePage() {
  const currentYear = new Date().getFullYear();
  
  // State Data
  const [deadlineData, setDeadlineData] = useState<DeadlineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Form (Disatukan agar lebih rapi)
  const [form, setForm] = useState({
    date: '',
    time: '23:59',
    note: ''
  });

  // State Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success' as 'success' | 'warning' | 'danger',
  });

  // --- FETCH DATA ---
  const fetchDeadline = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<DeadlineData>(`/api/admin/deadline/date/${currentYear}`);
      const data = res.data;
      
      setDeadlineData(data);
      
      // Auto-fill form jika data tersedia
      if (data.deadline) {
        const dt = new Date(data.deadline);
        // Trik format YYYY-MM-DD lokal Indonesia/Asia/Jakarta
        const offset = dt.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dt.getTime() - offset)).toISOString().slice(0, -1);
        
        setForm({
          date: localISOTime.split('T')[0],
          time: dt.toTimeString().slice(0, 5), // Ambil HH:mm
          note: data.catatan || ''
        });
      }
    } catch (error) {
      console.error('Gagal fetch deadline:', error);
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchDeadline();
  }, [fetchDeadline]);

  // --- HANDLE SAVE ---
  const handleSave = async () => {
    if (!form.date) {
      setModal({ isOpen: true, title: 'Validasi Gagal', message: 'Tanggal deadline wajib diisi.', variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        year: currentYear,
        deadline_at: `${form.date}T${form.time}:00`,
        catatan: form.note || 'Deadline penerimaan data submission',
      };

      await axios.post('/api/admin/deadline/set', payload);
      
      setModal({ isOpen: true, title: 'Berhasil', message: 'Deadline berhasil disimpan & Log aktivitas tercatat.', variant: 'success' });
      fetchDeadline(); // Refresh data agar tampilan terupdate
    } catch (error) {
      // Type casting error ke interface ApiError
      const err = error as ApiError;
      setModal({ 
        isOpen: true, 
        title: 'Gagal', 
        message: err.response?.data?.message || 'Terjadi kesalahan sistem saat menyimpan deadline.', 
        variant: 'danger' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper: Format tampilan tanggal
  const displayDeadline = deadlineData?.deadline 
    ? new Date(deadlineData.deadline).toLocaleString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short' 
      }) 
    : '-';

  // Helper: Hitung sisa waktu
  const getTimeRemaining = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - new Date().getTime();
    if (diff <= 0) return 'Waktu Habis';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} hari ${hours} jam lagi`;
  };

  // Loading State
  if (loading) return (
    <div className="max-w-4xl mx-auto p-8 flex justify-center py-20">
      <RefreshCw className="w-10 h-10 animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <header>
        <div className="text-sm text-green-600 mb-2 font-medium">Pengaturan &gt; Deadline Submission</div>
        <h1 className="text-3xl font-extrabold text-gray-900">Pengaturan Deadline</h1>
        <p className="text-gray-500 mt-1">Kelola batas waktu pengumpulan data tahun {currentYear}.</p>
      </header>

      {/* Status Card */}
      <div className={`p-6 rounded-xl border-l-4 shadow-sm transition-all ${
        deadlineData?.is_passed ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${deadlineData?.is_passed ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Deadline Saat Ini</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{displayDeadline}</p>
            <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-bold ${
              deadlineData?.is_passed ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
            }`}>
              {deadlineData?.is_passed ? '⏰ SUDAH LEWAT' : `⏳ ${getTimeRemaining(deadlineData?.deadline || '')}`}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-800">Update Jadwal</h2>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Input Tanggal & Waktu */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input 
                type="date" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam (WIB)</label>
              <input 
                type="time" 
                value={form.time}
                onChange={e => setForm({...form, time: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                disabled={saving}
              />
            </div>
          </div>

          {/* Input Catatan */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
              <textarea 
                rows={4}
                value={form.note}
                onChange={e => setForm({...form, note: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                placeholder="Contoh: Perpanjangan waktu dikarenakan kendala teknis..."
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-full md:w-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Perubahan deadline akan langsung berdampak pada akses input user.</span>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || !form.date}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Universal Modal */}
      <UniversalModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        showCancelButton={false}
        confirmLabel="Tutup"
        onConfirm={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
}