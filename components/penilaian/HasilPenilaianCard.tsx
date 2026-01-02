'use client';

import { HasilPenilaian } from './HasilPenilaianModal';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface HasilPenilaianCardProps {
  hasil: HasilPenilaian | null;
  tahapAktif: string;
  activeTab: string;
  rawStatus?: string;
  statusText?: string;
  onClick: () => void;
}

// Helper untuk status config
const getStatusConfig = (
  hasil: HasilPenilaian | null,
  tahapAktif: string,
  activeTab: string
) => {
  if (tahapAktif === activeTab) {
    return {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-600',
      label: '⏳ SEDANG PROSES',
    };
  }

  const isLolos =
    hasil?.status === 'LOLOS' ||
    hasil?.status === 'LOLOS FINAL' ||
    hasil?.status === 'MASUK KATEGORI' ||
    hasil?.status === 'SELESAI' ||
    hasil?.status === 'SELESAI WAWANCARA';

  const isWaiting = hasil?.status === 'MENUNGGU';

  if (isLolos) {
    return {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-600',
      label: hasil?.status || '',
    };
  }

  if (isWaiting) {
    return {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-600',
      label: hasil?.status || '',
    };
  }

  return {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-600',
    label: hasil?.status || '',
  };
};

export default function HasilPenilaianCard({
  hasil,
  tahapAktif,
  activeTab,
  rawStatus,
  statusText,
  onClick,
}: HasilPenilaianCardProps) {
  // Jika ada hasil dari API
  if (hasil) {
    const config = getStatusConfig(hasil, tahapAktif, activeTab);

    return (
      <div
        className={`p-4 rounded-lg shadow-sm border text-right min-w-[200px] cursor-pointer hover:shadow-md transition-shadow ${config.bg}`}
        onClick={onClick}
      >
        <p className="text-sm font-medium text-gray-500">
          Hasil Penilaian:
        </p>

        <p className={`text-2xl font-bold mt-1 ${config.text}`}>
          {config.label}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Klik untuk detail
        </p>
      </div>
    );
  }

  // Fallback ke status dari timeline
  if (rawStatus) {
    const statusConfig = {
      completed: {
        text: 'text-green-600',
        label: 'SELESAI',
      },
      active: {
        text: 'text-yellow-600',
        label: 'MENUNGGU',
      },
      pending: {
        text: 'text-gray-500',
        label: 'MENUNGGU',
      },
    };

    const config =
      statusConfig[
        rawStatus as keyof typeof statusConfig
      ] || statusConfig.pending;

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-right min-w-[200px]">
        <p className="text-sm font-medium text-gray-500">
          Hasil Penilaian:
        </p>

        <p className={`text-2xl font-bold mt-1 ${config.text}`}>
          {config.label}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {statusText}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 text-right min-w-[200px] animate-pulse">
        <p className="text-sm font-medium text-gray-500">Hasil Penilaian:</p>
        <p className="text-2xl font-bold mt-1 text-gray-400">
            Memuat...
        </p>
        <p className="text-xs text-gray-300 mt-1">
            Sedang mengambil data
        </p>
    </div>
);
}
