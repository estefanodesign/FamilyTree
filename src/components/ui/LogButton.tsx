import React from 'react';
import { History } from 'lucide-react';

interface LogButtonProps {
    onClick: () => void;
}

export const LogButton: React.FC<LogButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed left-6 bottom-6 flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all z-40 border border-gray-200 group"
            aria-label="Riwayat Perubahan"
        >
            <div className="p-1 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                <History className="w-5 h-5 text-gray-600" />
            </div>
            <span className="font-medium pr-1">Riwayat</span>
        </button>
    );
};
