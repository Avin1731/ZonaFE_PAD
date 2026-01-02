'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'danger';
  showCancelButton?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  
  /** Dijalankan setelah animasi exit selesai */
  onExitComplete?: () => void; // <-- TAMBAHKAN INI
}

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
};

const variantConfig = {
  success: {
    iconColor: 'text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  warning: {
    iconColor: 'text-yellow-500',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  danger: {
    iconColor: 'text-red-600',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
};

export default function UniversalModal({
  isOpen,
  onClose,
  title,
  message,
  variant,
  showCancelButton = true,
  confirmLabel = "Ya",
  cancelLabel = "Batal",
  onConfirm,
  onExitComplete, // <-- AMBIL INI
}: UniversalModalProps) {
  const IconComponent = iconMap[variant];
  const config = variantConfig[variant];
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence onExitComplete={onExitComplete}> {/* <-- GUNAKAN DI SINI */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <IconComponent className={`w-14 h-14 ${config.iconColor}`} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
                {title}
              </h2>
              <p className="text-center text-gray-600 mb-6 leading-relaxed">
                {message}
              </p>
            </motion.div>
            
            <motion.div 
              className="flex gap-3 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {showCancelButton && (
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium flex-1 max-w-32"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                ref={confirmButtonRef}
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${config.buttonColor} ${
                  showCancelButton 
                    ? 'flex-1 max-w-32' 
                    : 'min-w-24' 
                }`}
              >
                {confirmLabel}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}