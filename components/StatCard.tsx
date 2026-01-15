import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  type?: 'admin' | 'pusdatin' | 'neutral' | 'default' | 'custom'; // Tambah 'custom'
  icon?: React.ReactNode;
  tag?: string;
  className?: string;
  // Custom props (opsional, dipakai jika type='custom')
  customBg?: string;
  customBorder?: string;
  customTitleColor?: string;
  customValueColor?: string;
  customIconBg?: string;
  customIconColor?: string;
}

export default function StatCard({
  title,
  value,
  type = 'default',
  icon,
  tag,
  className = '',
  customBg,
  customBorder,
  customTitleColor,
  customValueColor,
  customIconBg,
  customIconColor,
}: StatCardProps) {
  
  // Preset Styles
  const styles = {
    admin: {
      border: 'border-l-red-500',
      bg: 'bg-white',
      titleColor: 'text-gray-500',
      valueColor: 'text-gray-800',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      tagBg: 'bg-red-50',
      tagColor: 'text-red-600',
    },
    pusdatin: {
      border: 'border-l-green-500',
      bg: 'bg-white',
      titleColor: 'text-gray-500',
      valueColor: 'text-gray-800',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      tagBg: 'bg-green-50',
      tagColor: 'text-green-600',
    },
    neutral: { 
      border: 'border-l-slate-500',
      bg: 'bg-white',
      titleColor: 'text-gray-500',
      valueColor: 'text-gray-800',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      tagBg: 'bg-slate-100',
      tagColor: 'text-slate-600',
    },
    default: {
      border: 'border-l-blue-500',
      bg: 'bg-white',
      titleColor: 'text-gray-500',
      valueColor: 'text-gray-800',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      tagBg: 'bg-blue-50',
      tagColor: 'text-blue-500',
    },
    // Fallback object untuk custom (gunakan props atau default abu-abu)
    custom: {
      border: customBorder || 'border-l-gray-300',
      bg: customBg || 'bg-white',
      titleColor: customTitleColor || 'text-gray-500',
      valueColor: customValueColor || 'text-gray-800',
      iconBg: customIconBg || 'bg-gray-100',
      iconColor: customIconColor || 'text-gray-600',
      tagBg: 'bg-gray-100',
      tagColor: 'text-gray-600',
    }
  };

  const currentStyle = styles[type] || styles.default;

  return (
    <div
      className={`
        rounded-xl p-6 shadow-sm border border-gray-100
        border-l-4 ${currentStyle.border} ${currentStyle.bg}
        flex items-center justify-between
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      <div>
        <p className={`text-sm font-medium mb-1 ${currentStyle.titleColor}`}>{title}</p>
        <h3 className={`text-3xl font-bold ${currentStyle.valueColor}`}>{value}</h3>
        
        {tag && (
          <span className={`
            mt-2 inline-block text-xs font-medium px-2 py-1 rounded
            ${currentStyle.tagBg} ${currentStyle.tagColor}
          `}>
            {tag}
          </span>
        )}
      </div>

      {icon && (
        <div className={`p-3 rounded-full ${currentStyle.iconBg} ${currentStyle.iconColor}`}>
          {icon}
        </div>
      )}
    </div>
  );
}