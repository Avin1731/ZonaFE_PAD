'use client';

import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

interface FancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'warning' | 'danger';
  theme?: 'cyberpunk' | 'anime' | 'dark' | 'glass';
  showButtons?: boolean;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function FancyModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'warning',
  theme = 'glass',
  showButtons = true,
  onConfirm,
  confirmLabel = 'Ya',
  cancelLabel = 'Kembali',
}: FancyModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // === ICONS ===
  const iconMap = {
    success: <FaCheckCircle className="text-green-400 drop-shadow-neonGreen text-6xl mb-4" />,
    warning: <FaExclamationTriangle className="text-yellow-400 drop-shadow-neonYellow text-6xl mb-4" />,
    danger: <FaTrash className="text-red-400 drop-shadow-neonRed text-6xl mb-4" />,
  };

  // === THEME WRAPPER ===
  const themeStyles = {
    cyberpunk: `
      bg-black border border-pink-500 shadow-[0_0_20px_#ff00ff]
      animate-popCyber
      text-pink-300
    `,
    anime: `
      bg-white/95 backdrop-blur-lg 
      shadow-[0_0_40px_rgba(0,180,255,0.5)]
      border border-cyan-300
      animate-popAnime
      text-gray-700
    `,
    dark: `
      bg-[#111] border border-gray-700
      shadow-[0_0_25px_#000]
      animate-popDark
      text-gray-200
    `,
    glass: `
      bg-white/10 backdrop-blur-xl
      border border-white/20 
      shadow-[0_8px_40px_rgba(255,255,255,0.1)]
      animate-popGlass
      text-white
    `,
  }[theme];

  // === BUTTON STYLE ===
  const buttonStyle = `
    px-5 py-2 rounded-md font-medium transition-all duration-200
  `;

  const primaryBtn = {
    cyberpunk: `${buttonStyle} bg-pink-600 text-white hover:bg-pink-500 shadow-[0_0_10px_#ff00ff]`,
    anime: `${buttonStyle} bg-cyan-500 text-white hover:bg-cyan-400`,
    dark: `${buttonStyle} bg-green-600 text-white hover:bg-green-500`,
    glass: `${buttonStyle} bg-white/20 backdrop-blur-md border border-white text-white hover:bg-white/30`,
  }[theme];

  const secondaryBtn = {
    cyberpunk: `${buttonStyle} border border-pink-400 text-pink-300 hover:bg-pink-500/20`,
    anime: `${buttonStyle} border border-cyan-300 text-cyan-600 hover:bg-cyan-100`,
    dark: `${buttonStyle} border border-gray-600 text-gray-300 hover:bg-gray-800`,
    glass: `${buttonStyle} border border-white/40 text-white hover:bg-white/10`,
  }[theme];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn p-4">
      
      <div className={`max-w-md w-full p-6 rounded-2xl ${themeStyles}`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl hover:scale-110 transition"
        >
          ×
        </button>

        <div className="flex flex-col items-center text-center">
          {iconMap[variant]}
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="mb-6 opacity-80">{message}</p>
        </div>

        {showButtons && (
          <div className="flex justify-center gap-3">
            <button onClick={onClose} className={secondaryBtn}>{cancelLabel}</button>
            <button onClick={onConfirm} className={primaryBtn}>{confirmLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
