import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Briefcase, Edit3, Plus, Trash2, X } from 'lucide-react';
import { Person } from '@/types/family';
import { calculateAge, formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/Button';

interface BottomSheetProps {
    isOpen: boolean;
    selectedPerson: Person | null;
    onClose: () => void;
    onEdit: (person: Person) => void;
    onDelete: (id: string) => void;
    onAddRelation: (type: 'child' | 'spouse' | 'sibling' | 'parent') => void;
    onSelectPerson: (id: string) => void;
    people: Person[];
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    selectedPerson,
    onClose,
    onEdit,
    onDelete,
    onAddRelation,
    onSelectPerson,
    people
}) => {
    return (
        <AnimatePresence>
            {isOpen && selectedPerson && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 lg:hidden max-h-[85vh] flex flex-col"
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        <div className="p-5 border-b border-gray-100 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`w-16 h-16 rounded-2xl overflow-hidden ring-2 ${selectedPerson.gender === 'male' ? 'ring-blue-100' :
                                        selectedPerson.gender === 'female' ? 'ring-rose-100' : 'ring-violet-100'
                                        }`}>
                                        {selectedPerson.photo ? (
                                            <img
                                                src={selectedPerson.photo}
                                                alt={`${selectedPerson.firstName} ${selectedPerson.lastName}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${selectedPerson.gender === 'male' ? 'bg-blue-100 text-blue-600' :
                                                selectedPerson.gender === 'female' ? 'bg-rose-100 text-rose-600' :
                                                    'bg-violet-100 text-violet-600'
                                                }`}>
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {selectedPerson.firstName} {selectedPerson.lastName}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {calculateAge(selectedPerson.birthDate, selectedPerson.deathDate)} tahun
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-5">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onEdit(selectedPerson)}
                                    className="flex-1 text-blue-600 bg-blue-50"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onAddRelation('child')}
                                    className="flex-1 text-green-600 bg-green-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Anak
                                </Button>
                                {!selectedPerson.spouseId && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => onAddRelation('spouse')}
                                        className="flex-1 text-rose-600 bg-rose-50"
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        Pasangan
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onDelete(selectedPerson.id)}
                                    className="w-10 px-0 text-red-600 bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-5 space-y-6 pb-10">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="text-xs text-gray-500 mb-1">Tanggal Lahir</div>
                                    <div className="font-medium text-sm">{formatDate(selectedPerson.birthDate)}</div>
                                </div>
                                {selectedPerson.deathDate && (
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="text-xs text-gray-500 mb-1">Tanggal Wafat</div>
                                        <div className="font-medium text-sm">{formatDate(selectedPerson.deathDate)}</div>
                                    </div>
                                )}
                                {selectedPerson.occupation && (
                                    <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                                        <div className="text-xs text-gray-500 mb-1">Pekerjaan</div>
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <Briefcase className="w-3 h-3" />
                                            {selectedPerson.occupation}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Family List */}
                            <div className="space-y-6">
                                <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Keluarga</h3>

                                {/* Spouse */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pasangan</h4>
                                    {selectedPerson.spouseId ? (() => {
                                        const spouse = people.find(x => x.id === selectedPerson.spouseId);
                                        if (!spouse) return null;
                                        return (
                                            <div key={spouse.id} className="flex items-center gap-3" onClick={() => onSelectPerson(spouse.id)}>
                                                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                                                    {spouse.photo ? <img src={spouse.photo} className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full text-gray-400" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{spouse.firstName} {spouse.lastName}</div>
                                                    <div className="text-xs text-gray-500">Pasangan</div>
                                                </div>
                                            </div>
                                        );
                                    })() : (
                                        <button
                                            onClick={() => onAddRelation('spouse')}
                                            className="flex items-center gap-3 w-full text-left"
                                        >
                                            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-400">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-rose-500">Tambah Pasangan</div>
                                                <div className="text-xs text-gray-400">Tambahkan suami atau istri</div>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Parents */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Orang Tua</h4>
                                    <div className="grid gap-3">
                                        {selectedPerson.parentIds.map(parentId => {
                                            const p = people.find(x => x.id === parentId);
                                            if (!p) return null;
                                            return (
                                                <div key={parentId} className="flex items-center gap-3" onClick={() => onSelectPerson(parentId)}>
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                                                        {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{p.firstName} {p.lastName}</div>
                                                        <div className="text-xs text-gray-500">Orang Tua</div>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Add Parent Button */}
                                        {selectedPerson.parentIds.length < 2 && (
                                            <button
                                                onClick={() => onAddRelation('parent')}
                                                className="flex items-center gap-3 w-full text-left"
                                            >
                                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-400">
                                                    <Plus className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-blue-500">Tambah Orang Tua</div>
                                                    <div className="text-xs text-gray-400">Tambahkan ayah atau ibu</div>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Siblings */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Saudara</h4>
                                    <div className="grid gap-3">
                                        {(() => {
                                            const siblingIds = people
                                                .filter(p => p.id !== selectedPerson.id && p.parentIds.some(pid => selectedPerson.parentIds.includes(pid)))
                                                .map(p => p.id);

                                            if (siblingIds.length === 0) {
                                                return <div className="text-xs text-gray-400 italic">Tidak ada data saudara</div>;
                                            }

                                            return siblingIds.map(sid => {
                                                const s = people.find(x => x.id === sid);
                                                if (!s) return null;
                                                return (
                                                    <div key={sid} className="flex items-center gap-3" onClick={() => onSelectPerson(sid)}>
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                                                            {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full text-gray-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium">{s.firstName} {s.lastName}</div>
                                                            <div className="text-xs text-gray-500">Saudara</div>
                                                        </div>
                                                    </div>
                                                )
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Children */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anak ({selectedPerson.childrenIds.length})</h4>
                                    <div className="grid gap-3">
                                        {selectedPerson.childrenIds.length === 0 && (
                                            <div className="text-xs text-gray-400 italic">Belum ada data anak</div>
                                        )}
                                        {selectedPerson.childrenIds.map(childId => {
                                            const c = people.find(x => x.id === childId);
                                            if (!c) return null;
                                            return (
                                                <div key={childId} className="flex items-center gap-3" onClick={() => onSelectPerson(childId)}>
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                                                        {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{c.firstName} {c.lastName}</div>
                                                        <div className="text-xs text-gray-500">Anak</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
