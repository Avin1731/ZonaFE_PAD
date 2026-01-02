'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeadlineCard from '@/components/DeadlineCard';
import UniversalModal from '@/components/UniversalModal';
import axios from '@/lib/axios';

interface ApiDeadline {
  id: number;
  jenis_deadline: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
}

type DeadlineType = 'Penilaian SLHD' | 'Penilaian Penghargaan' | 'Validasi 1' | 'Validasi 2';

const INITIAL_MODAL_CONFIG = {
  title: '',
  message: '',
  variant: 'warning' as 'success' | 'warning' | 'danger',
  showCancelButton: true,
  onConfirm: () => {},
  confirmLabel: 'Ya',
  cancelLabel: 'Batal',
};

// Helper Log
const logActivity = async (action: string, description: string) => {
  try {
    await axios.post('/api/logs', { action, description, role: 'pusdatin' });
  } catch (error) { console.error('Log failed', error); }
};

export default function PenilaianDataPage() {
  const router = useRouter();
  const [penilaianSlhd, setPenilaianSlhd] = useState<ApiDeadline | null>(null);
  const [penghargaan, setPenghargaan] = useState<ApiDeadline | null>(null);
  const [validasi1, setValidasi1] = useState<ApiDeadline | null>(null);
  const [validasi2, setValidasi2] = useState<ApiDeadline | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(INITIAL_MODAL_CONFIG);
  const [selectedDlh, setSelectedDlh] = useState<string>('');

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    return dateString.split('-').reverse().join('/');
  };

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const response = await axios.get('/api/deadlines/penilaian');
        const allDeadlines: ApiDeadline[] = response.data;
        setPenilaianSlhd(allDeadlines.find(d => d.jenis_deadline === 'Penilaian SLHD') || null);
        setPenghargaan(allDeadlines.find(d => d.jenis_deadline === 'Penilaian Penghargaan') || null);
        setValidasi1(allDeadlines.find(d => d.jenis_deadline === 'Validasi 1') || null);
        setValidasi2(allDeadlines.find(d => d.jenis_deadline === 'Validasi 2') || null);
      } catch (error) {
        console.error('Gagal mengambil data deadline penilaian:', error);
      }
    };
    fetchDeadlines();
  }, []);

  const closeModal = () => { setIsModalOpen(false); };
  const resetModalConfig = () => { setModalConfig(INITIAL_MODAL_CONFIG); };

  const handleSave = async (deadlineData: ApiDeadline | null, newStartDate: string, newEndDate: string, jenis: DeadlineType) => {
    if (isSaving) return;
    setIsSaving(true);

    const formattedStart = newStartDate.split('/').reverse().join('-');
    const formattedEnd = newEndDate.split('/').reverse().join('-');
    const payload = { jenis_deadline: jenis, tanggal_mulai: formattedStart, tanggal_akhir: formattedEnd };

    try {
      const response = (deadlineData && deadlineData.id)
        ? await axios.put(`/api/deadlines/${deadlineData.id}`, payload)
        : await axios.post('/api/deadlines', payload);

      switch (jenis) {
        case 'Penilaian SLHD': setPenilaianSlhd(response.data); break;
        case 'Penilaian Penghargaan': setPenghargaan(response.data); break;
        case 'Validasi 1': setValidasi1(response.data); break;
        case 'Validasi 2': setValidasi2(response.data); break;
      }

      // --- LOGGING ---
      logActivity('Mengubah Deadline', `Mengubah jadwal penilaian: ${jenis}`);

      setModalConfig({
        title: 'Deadline Berhasil Disimpan',
        message: `Deadline untuk ${jenis} telah berhasil disimpan.`,
        variant: 'success',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'OK',
        cancelLabel: '', 
      });
      setIsModalOpen(true);

    } catch (error) {
      console.error(`Gagal menyimpan deadline ${jenis}:`, error);
      setModalConfig({
        title: 'Gagal Menyimpan Deadline',
        message: `Terjadi kesalahan saat menyimpan deadline untuk ${jenis}.`,
        variant: 'danger',
        showCancelButton: false,
        onConfirm: closeModal,
        confirmLabel: 'Tutup',
        cancelLabel: '', 
      });
      setIsModalOpen(true);

    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    router.push('/pusdatin-dashboard/pengaturan-deadline/edit-deadline');
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <span className="text-sm text-green-600 mb-4">Pengaturan Deadline</span> &gt; <span className="text-sm text-gray-600 mb-4">Pengaturan Deadline Penilaian Data</span>
      </div>
      <header>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Pengaturan Deadline Penilaian Data</h1>
        <p className="text-gray-600">Atur jadwal penilaian data untuk dokumen dari DLH Provinsi dan Kab/Kota.</p>
      </header>

      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis DLH</label>
          <select value={selectedDlh} onChange={(e) => setSelectedDlh(e.target.value)} className="bg-white px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" disabled={isSaving}>
            <option value="">Pilih Jenis DLH</option>
            <option value="provinsi">Provinsi</option>
            <option value="kabupaten">Kabupaten/Kota</option>
          </select>
        </div>
        <button className="bg-[#00A86B] hover:bg-[#00945F] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>Filter</button>
      </div>

      <h2 className="text-xl font-bold text-gray-800 pt-4">Pengaturan Deadline Penilaian</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DeadlineCard title="Penilaian SLHD" startDate={formatDate(penilaianSlhd?.tanggal_mulai)} endDate={formatDate(penilaianSlhd?.tanggal_akhir)} onSave={(start, end) => handleSave(penilaianSlhd, start, end, 'Penilaian SLHD')} disabled={isSaving} />
        <DeadlineCard title="Penilaian Penghargaan" startDate={formatDate(penghargaan?.tanggal_mulai)} endDate={formatDate(penghargaan?.tanggal_akhir)} onSave={(start, end) => handleSave(penghargaan, start, end, 'Penilaian Penghargaan')} disabled={isSaving} />
        <DeadlineCard title="Validasi 1" startDate={formatDate(validasi1?.tanggal_mulai)} endDate={formatDate(validasi1?.tanggal_akhir)} onSave={(start, end) => handleSave(validasi1, start, end, 'Validasi 1')} disabled={isSaving} />
        <DeadlineCard title="Validasi 2" startDate={formatDate(validasi2?.tanggal_mulai)} endDate={formatDate(validasi2?.tanggal_akhir)} onSave={(start, end) => handleSave(validasi2, start, end, 'Validasi 2')} disabled={isSaving} />
      </div>

      <button onClick={handleEditClick} className="bg-[#00A86B] hover:bg-[#00945F] text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>Edit Deadline</button>

      <UniversalModal isOpen={isModalOpen} onClose={closeModal} onExitComplete={resetModalConfig} title={modalConfig.title} message={modalConfig.message} variant={modalConfig.variant} showCancelButton={modalConfig.showCancelButton} onConfirm={modalConfig.onConfirm} confirmLabel={modalConfig.confirmLabel} cancelLabel={modalConfig.cancelLabel} />
    </div>
  );
}