import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Calendar, Briefcase, MapPin, Edit3, Plus, Trash2, X } from 'lucide-react';
import { Person } from '@/types/family';
import { calculateAge, formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
    isOpen: boolean;
    selectedPerson: Person | null;
    onClose: () => void;
    onEdit: (person: Person) => void;
    onDelete: (id: string) => void;
    onAddRelation: (type: 'child' | 'spouse' | 'sibling') => void;
    onSelectPerson: (id: string) => void;
    people: Person[];
}

export const Sidebar: React.FC<SidebarProps> = ({
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
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    className="fixed right-4 top-4 bottom-4 w-96 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 flex flex-col z-40 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4 pr-10">
                            <div className="relative">
                                <div className={`w-20 h-20 rounded-2xl overflow-hidden ring-4 shadow-md ${selectedPerson.gender === 'male' ? 'ring-blue-100' :
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
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                {selectedPerson.spouseId && (
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                        <Heart className="w-4 h-4 text-white fill-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-gray-900 truncate">
                                    {selectedPerson.firstName} {selectedPerson.lastName}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {calculateAge(selectedPerson.birthDate, selectedPerson.deathDate)} tahun
                                    {selectedPerson.deathDate && ' (Almarhum)'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-6">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onEdit(selectedPerson)}
                                className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 border-blue-100"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onAddRelation('child')}
                                className="flex-1 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 border-green-100"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Anak
                            </Button>
                            {!selectedPerson.spouseId && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onAddRelation('spouse')}
                                    className="flex-1 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border-rose-100"
                                >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Pasangan
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onDelete(selectedPerson.id)}
                                className="px-3 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border-red-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Dates */}
                        <div className="bg-gray-50/50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Peristiwa Hidup
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lahir</span>
                                    <span className="font-medium text-gray-900">{formatDate(selectedPerson.birthDate)}</span>
                                </div>
                                {selectedPerson.deathDate && (
                                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                                        <span className="text-gray-500">Wafat</span>
                                        <span className="font-medium text-gray-900">{formatDate(selectedPerson.deathDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional */}
                        {(selectedPerson.occupation || selectedPerson.location) && (
                            <div className="bg-gray-50/50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Tentang
                                </h3>
                                <div className="space-y-3">
                                    {selectedPerson.occupation && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-700">{selectedPerson.occupation}</span>
                                        </div>
                                    )}
                                    {selectedPerson.location && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 text-violet-500">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-700">{selectedPerson.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        {selectedPerson.bio && (
                            <div className="bg-gray-50/50 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Biografi</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedPerson.bio}</p>
                            </div>
                        )}

                        {/* Family Relations */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-500" />
                                Hubungan Keluarga
                            </h3>

                            <div className="space-y-4">
                                {/* Parents */}
                                {selectedPerson.parentIds.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Orang Tua</h4>
                                        <div className="grid gap-2">
                                            {selectedPerson.parentIds.map(parentId => {
                                                const parent = people.find(p => p.id === parentId);
                                                if (!parent) return null;
                                                return (
                                                    <button
                                                        key={parentId}
                                                        onClick={() => onSelectPerson(parentId)}
                                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 hover:shadow-sm group text-left w-full"
                                                    >
                                                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all">
                                                            {parent.photo ? (
                                                                <img src={parent.photo} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${parent.gender === 'male' ? 'bg-blue-100 text-blue-600' :
                                                                    parent.gender === 'female' ? 'bg-rose-100 text-rose-600' :
                                                                        'bg-violet-100 text-violet-600'
                                                                    }`}>
                                                                    <User className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{parent.firstName} {parent.lastName}</div>
                                                            <div className="text-xs text-gray-500 truncate">{parent.occupation || 'Orang Tua'}</div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Spouse */}
                                {selectedPerson.spouseId && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pasangan</h4>
                                        {(() => {
                                            const spouse = people.find(p => p.id === selectedPerson.spouseId);
                                            if (!spouse) return null;
                                            return (
                                                <button
                                                    onClick={() => onSelectPerson(spouse.id)}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 hover:shadow-sm group text-left w-full"
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all">
                                                        {spouse.photo ? (
                                                            <img src={spouse.photo} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center ${spouse.gender === 'male' ? 'bg-blue-100 text-blue-600' :
                                                                spouse.gender === 'female' ? 'bg-rose-100 text-rose-600' :
                                                                    'bg-violet-100 text-violet-600'
                                                                }`}>
                                                                <User className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">{spouse.firstName} {spouse.lastName}</div>
                                                        <div className="text-xs text-gray-500 truncate">{spouse.occupation || 'Pasangan'}</div>
                                                    </div>
                                                </button>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Add Spouse Button */}
                                {!selectedPerson.spouseId && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pasangan</h4>
                                        <button
                                            onClick={() => onAddRelation('spouse')}
                                            className="flex items-center gap-3 p-2 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-left w-full group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 group-hover:text-rose-500 group-hover:bg-rose-100 transition-all">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-rose-500 group-hover:text-rose-600">Tambah Pasangan</div>
                                                <div className="text-xs text-gray-400">Tambahkan suami atau istri</div>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* Children */}
                                {selectedPerson.childrenIds.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Anak ({selectedPerson.childrenIds.length})
                                        </h4>
                                        <div className="grid gap-2">
                                            {selectedPerson.childrenIds.map(childId => {
                                                const child = people.find(p => p.id === childId);
                                                if (!child) return null;
                                                return (
                                                    <button
                                                        key={childId}
                                                        onClick={() => onSelectPerson(childId)}
                                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 hover:shadow-sm group text-left w-full"
                                                    >
                                                        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all">
                                                            {child.photo ? (
                                                                <img src={child.photo} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center ${child.gender === 'male' ? 'bg-blue-100 text-blue-600' :
                                                                    child.gender === 'female' ? 'bg-rose-100 text-rose-600' :
                                                                        'bg-violet-100 text-violet-600'
                                                                    }`}>
                                                                    <User className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{child.firstName} {child.lastName}</div>
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {calculateAge(child.birthDate)} tahun
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
