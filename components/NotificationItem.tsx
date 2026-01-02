'use client';

import { Bell, Megaphone } from 'lucide-react';

interface NotificationItemProps {
  type: 'announcement' | 'notification';
  message: string;
}

export default function NotificationItem({
  type,
  message,
}: NotificationItemProps) {
  const Icon = type === 'announcement' ? Megaphone : Bell;
  const bgColor = type === 'announcement' ? 'bg-green-100' : 'bg-yellow-100';
  const textColor = type === 'announcement' ? 'text-green-800' : 'text-yellow-800';
  const iconColor = type === 'announcement' ? 'text-green-600' : 'text-yellow-600';

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg ${bgColor}`}>
      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <h4 className={`font-medium ${textColor}`}>{type === 'announcement' ? 'Pengumuman' : 'Notifikasi'}</h4>
        <p className="text-xs text-gray-600 mt-1">{message}</p>
      </div>
    </div>
  );
}