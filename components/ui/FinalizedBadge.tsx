'use client';

import { FaLock } from 'react-icons/fa';

// --- FINALIZED BADGE ---
export function FinalizedBadge() {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <FaLock className="text-green-600" />
            <span className="text-sm font-medium text-green-700">Data Sudah Difinalisasi</span>
        </div>
    );
}
