'use client';

import { FaExclamationTriangle, FaInfoCircle, FaSpinner } from 'react-icons/fa';

// --- CONFIRMATION MODAL ---
export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ConfirmModal({ 
    isOpen, 
    title, 
    message, 
    confirmText = 'Ya, Lanjutkan', 
    cancelText = 'Batal', 
    type = 'warning', 
    onConfirm, 
    onCancel, 
    isLoading 
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger': return { icon: <FaExclamationTriangle className="text-red-500 text-3xl" />, btnColor: 'bg-red-600 hover:bg-red-700' };
            case 'warning': return { icon: <FaExclamationTriangle className="text-yellow-500 text-3xl" />, btnColor: 'bg-yellow-600 hover:bg-yellow-700' };
            case 'info': return { icon: <FaInfoCircle className="text-blue-500 text-3xl" />, btnColor: 'bg-blue-600 hover:bg-blue-700' };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-gray-100 rounded-full">
                            {styles.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${styles.btnColor}`}
                        >
                            {isLoading && <FaSpinner className="animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
