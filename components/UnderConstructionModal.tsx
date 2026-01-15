"use client";

import React from 'react';

interface UnderConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function UnderConstructionModal({ isOpen, onClose, title, message }: UnderConstructionModalProps) {
  if (!isOpen) return null;

  return (
    // Overlay dengan Glass Effect
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header dengan Icon */}
        <div className="bg-yellow-50 p-6 flex flex-col items-center justify-center border-b border-yellow-100">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}