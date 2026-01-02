'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// --- TOAST NOTIFICATION SYSTEM ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-green-500 text-xl" />;
            case 'error': return <FaTimesCircle className="text-red-500 text-xl" />;
            case 'warning': return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
            case 'info': return <FaInfoCircle className="text-blue-500 text-xl" />;
        }
    };

    const getBgColor = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'info': return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[400px] animate-slide-in ${getBgColor(toast.type)}`}
                    >
                        {getIcon(toast.type)}
                        <span className="flex-1 text-sm text-gray-700">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                            <IoClose />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
