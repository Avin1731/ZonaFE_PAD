"use client";

import { useState } from 'react';
import UnderConstructionModal from './UnderConstructionModal';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // State untuk mengontrol modal mana yang aktif
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const openModal = (type: 'admin' | 'developer') => {
    if (type === 'admin') {
      setModalState({
        isOpen: true,
        title: 'Bantuan Admin',
        message: 'Fitur Bantuan Admin saat ini sedang dalam pengembangan. Silakan hubungi admin melalui jalur konvensional untuk sementara waktu.'
      });
    } else {
      setModalState({
        isOpen: true,
        title: 'Kontak Developer',
        message: 'Informasi Kontak Developer sedang disiapkan. Terima kasih atas pengertian Anda.'
      });
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <footer className="w-full bg-slate-50 border-t border-gray-200 mt-auto">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <span className="font-semibold text-gray-800">SIPELITA</span>
              <span className="hidden md:inline text-gray-400">•</span>
              <span>Sistem Informasi Penilaian Nirwasita Tantra</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Ubah Link jadi Button agar tidak redirect */}
              <button 
                onClick={() => openModal('admin')}
                className="hover:text-[#00A86B] transition-colors focus:outline-none"
              >
                Bantuan
              </button>
              
              <button 
                onClick={() => openModal('developer')}
                className="hover:text-[#00A86B] transition-colors focus:outline-none"
              >
                Kontak Developer
              </button>
              
              <span className="text-gray-400">|</span>
              <span>&copy; {currentYear} KLHK</span>
            </div>
            
          </div>
        </div>
      </footer>

      {/* Komponen Modal dipasang di sini */}
      <UnderConstructionModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
      />
    </>
  );
}