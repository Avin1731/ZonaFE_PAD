// app/(dashboard)/pusdatin-dashboard/pengaturan-deadline/components/StatusBadge.tsx
export default function StatusBadge({ status }: { status: string }) {
  const bgColor = status === 'Aktif' ? 'bg-green-100' : 'bg-yellow-100';
  const textColor = status === 'Aktif' ? 'text-green-800' : 'text-yellow-800';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}