// src/components/ProfileCard.tsx
import React from 'react';
// import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export interface Detail {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}

interface ProfileCardProps {
  title: string;
  details: Detail[];
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode; // Badge status akun
  greeting?: string; // Greeting teks
  avatarInitial?: string; // Inisial avatar
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  title, 
  details, 
  actions, 
  statusBadge,
  greeting,
  avatarInitial 
}) => {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header Profil */}
      {greeting && (
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#00A86B] text-white rounded-full flex items-center justify-center font-bold text-xl">
            {avatarInitial || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{greeting}</h2>
            <p className="text-sm text-gray-500">Selamat datang di profil Anda.</p>
          </div>
        </div>
      )}

      {/* Container Card Utama */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        
        {/* Header Card */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {statusBadge && (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              {statusBadge}
            </div>
          )}
        </div>

        {/* Grid Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {details.map((detail, index) => (
            <div key={index} className="flex items-start gap-3">
              <detail.icon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">{detail.label}</p>
                <p className="text-base font-semibold text-gray-800 mt-0.5 break-words">
                  {detail.value ?? 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="pt-4 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;