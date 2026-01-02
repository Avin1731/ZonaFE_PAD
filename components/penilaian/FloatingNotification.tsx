'use client';

import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

type NotificationType = 'info' | 'warning' | 'success' | 'error';

interface FloatingNotificationProps {
    show: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: NotificationType;
}

const configMap = {
    info: { bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
    warning: { bg: 'bg-yellow-50 border-yellow-300', text: 'text-yellow-800', icon: AlertTriangle, iconColor: 'text-yellow-500' },
    success: { bg: 'bg-green-50 border-green-300', text: 'text-green-800', icon: CheckCircle, iconColor: 'text-green-500' },
    error: { bg: 'bg-red-50 border-red-300', text: 'text-red-800', icon: XCircle, iconColor: 'text-red-500' },
};

export default function FloatingNotification({ 
    show, 
    onClose,
    title,
    message,
    type = 'info'
}: FloatingNotificationProps) {
    if (!show) return null;

    const config = configMap[type];
    const IconComponent = config.icon;

    return (
        <div className=" inset-0 z-10 flex items-center justify-center bg-white/95 rounded-lg ">
            <div className={`relative w-full max-w-lg mx-4 p-6 rounded-xl shadow-2xl border-2 ${config.bg}`}>
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className={`flex justify-center mb-4 ${config.iconColor}`}>
                    <IconComponent className="w-16 h-16" />
                </div>
                
                <h3 className={`text-xl font-bold text-center mb-2 ${config.text}`}>
                    {title}
                </h3>
                
                <p className={`text-center ${config.text} opacity-90`}>
                    {message}
                </p>
                
                {/* Action Button */}
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}
