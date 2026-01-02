'use client';

import { useState, useEffect } from 'react';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';
import { Calendar, Clock, Save, AlertCircle } from 'lucide-react';

interface DeadlineData {
  year: string;
  deadline: string;
  catatan: string;
  is_passed: boolean;
}

export default function PengaturanDeadlinePage() {
  const currentYear = new Date().getFullYear();
  const [deadline, setDeadline] = useState<DeadlineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('23:59');
  const [catatan, setCatatan] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    variant: 'success' as 'success' | 'warning' | 'danger',
  });

  // Fetch deadline saat ini
  useEffect(() => {
    fetchDeadline();
  }, []);

  const fetchDeadline = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/deadline/date/${currentYear}`);
      const data: DeadlineData = response.data;
      
      setDeadline(data);
      
      // Parse deadline untuk form
      if (data.deadline) {
        const dt = new Date(data.deadline);
        setSelectedDate(dt.toISOString().split('T')[0]);
        setSelectedTime(dt.toTimeString().slice(0, 5));
      }
      
      setCatatan(data.catatan || '');
    } catch (error) {
      console.error('Gagal memuat deadline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDate) {
      setModalConfig({
        title: 'Validasi Gagal',
        message: 'Tanggal deadline harus diisi.',
        variant: 'warning',
      });
      setModalOpen(true);
      return;
    }

    try {
      setSaving(true);
      
      // Gabungkan date dan time
      const deadlineDateTime = `${selectedDate}T${selectedTime}:00`;
      
      const payload = {
        year: currentYear,
        deadline_at: deadlineDateTime,
        catatan: catatan || 'Deadline penerimaan data submission',
      };

      await axios.post('/api/admin/deadline/set', payload);
      
     
      
      setModalConfig({
        title: 'Berhasil',
        message: 'Deadline berhasil disimpan!',
        variant: 'success',
      });
      setModalOpen(true);
      
      // Refresh data
      await fetchDeadline();
      
    } catch (error: any) {
      console.error('Gagal menyimpan deadline:', error);
      setModalConfig({
        title: 'Gagal',
        message: error.response?.data?.message || 'Gagal menyimpan deadline. Silakan coba lagi.',
        variant: 'danger',
      });
      setModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const dt = new Date(dateString);
    return dt.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  };

  const getTimeRemaining = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Sudah lewat';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} hari lagi`;
    return `${hours} jam lagi`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Breadcrumb */}
      <div className="text-sm text-green-600 mb-4">
        Pengaturan <span className="text-gray-400 mx-2">&gt;</span>
        <span className="text-gray-600">Deadline Submission</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pengaturan Deadline Submission
        </h1>
        <p className="text-gray-600">
          Atur deadline penerimaan data dokumen dari DLH Provinsi dan Kab/Kota untuk tahun {currentYear}
        </p>
      </div>

      {/* Current Deadline Info */}
      {deadline && deadline.deadline && (
        <div className={`mb-6 p-6 rounded-xl border-2 ${
          deadline.is_passed 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${
              deadline.is_passed ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Clock className={`w-6 h-6 ${
                deadline.is_passed ? 'text-red-600' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 ${
                deadline.is_passed ? 'text-red-900' : 'text-blue-900'
              }`}>
                Deadline Saat Ini
              </h3>
              <p className={`text-2xl font-bold mb-2 ${
                deadline.is_passed ? 'text-red-700' : 'text-blue-700'
              }`}>
                {formatDateTime(deadline.deadline)}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  deadline.is_passed 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {deadline.is_passed ? '⏰ Sudah Lewat' : `⏳ ${getTimeRemaining(deadline.deadline)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Atur Deadline Baru
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* Waktu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Deadline
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">Waktu dalam WIB (Asia/Jakarta)</p>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Deadline penerimaan data submission"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={saving}
            />
          </div>

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Perhatian:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Pastikan tanggal dan waktu yang dipilih sudah benar</li>
                <li>Setelah deadline lewat, DLH tidak dapat mengirim data</li>
                <li>Perubahan deadline akan langsung berlaku</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !selectedDate}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Simpan Deadline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <UniversalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        showCancelButton={false}
        onConfirm={() => setModalOpen(false)}
        confirmLabel="OK"
      />
    </div>
  );
}
