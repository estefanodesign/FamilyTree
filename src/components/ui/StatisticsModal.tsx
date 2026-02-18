import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Person } from '@/types/family';

interface StatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    people: Person[];
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, people }) => {
    const stats = React.useMemo(() => {
        const total = people.length;
        const males = people.filter(p => p.gender === 'male').length;
        const females = people.filter(p => p.gender === 'female').length;
        const others = people.filter(p => p.gender === 'other').length;
        const living = people.filter(p => !p.deathDate).length;
        const deceased = people.filter(p => p.deathDate).length;
        const withChildren = people.filter(p => p.childrenIds.length > 0).length;
        const married = people.filter(p => p.spouseId).length;

        return { total, males, females, others, living, deceased, withChildren, married };
    }, [people]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="fixed top-20 right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 min-w-[300px] border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Statistik Keluarga</h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                <div className="text-xs text-blue-600/70">Total Anggota</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-green-600">{stats.living}</div>
                                <div className="text-xs text-green-600/70">Masih Hidup</div>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-indigo-600">{stats.males}</div>
                                <div className="text-xs text-indigo-600/70">Laki-laki</div>
                            </div>
                            <div className="bg-rose-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-rose-600">{stats.females}</div>
                                <div className="text-xs text-rose-600/70">Perempuan</div>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-amber-600">{stats.withChildren}</div>
                                <div className="text-xs text-amber-600/70">Orang Tua</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-purple-600">{stats.married}</div>
                                <div className="text-xs text-purple-600/70">Menikah</div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
