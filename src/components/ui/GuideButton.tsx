import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface GuideButtonProps {
    onClick: () => void;
}

export const GuideButton: React.FC<GuideButtonProps> = ({ onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-lg transition-colors border border-indigo-500/20"
            title="Panduan Penggunaan"
        >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Panduan</span>
        </motion.button>
    );
};
