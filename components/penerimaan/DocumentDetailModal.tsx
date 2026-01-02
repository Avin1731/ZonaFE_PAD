import React from 'react';

// Interface diperbaiki: Hapus 'any', gunakan tipe spesifik
interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  regionName: string;
  data: {
    namaDaerah?: string;
    jenisDLH?: string;
    jenisDokumen?: string;
    tanggalUpload?: string;
    namaFile?: string;
    ukuranFile?: string;
    formatFile?: string;
    status?: string;
    // Hapus [key: string]: any agar tidak error linting
  };
  onAccept: () => void;
  onReject: () => void;
}

export default function DocumentDetailModal({
  isOpen,
  onClose,
  documentType,
  regionName,
  data,
  onAccept,
  onReject
}: DocumentDetailModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Detail Dokumen: {regionName}</h3>
        
        <div className="space-y-2 mb-6 text-sm">
          <p><strong>Tipe:</strong> {documentType}</p>
          <p><strong>Jenis DLH:</strong> {data?.jenisDLH || '-'}</p>
          <p><strong>File:</strong> {data?.namaFile || '-'}</p>
          <p><strong>Status:</strong> {data?.status || '-'}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Tutup
          </button>
          <button 
            onClick={onReject}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Tolak
          </button>
          <button 
            onClick={onAccept}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Terima
          </button>
        </div>
      </div>
    </div>
  );
}