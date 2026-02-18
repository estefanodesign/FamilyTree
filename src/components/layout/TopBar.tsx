import React, { useState } from 'react';
import { Search, Download, Share2, Upload, User } from 'lucide-react';
import { Person } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/dateUtils';

interface TopBarProps {
    onSearch: (query: string) => void;
    onSelectPerson: (id: string) => void;
    onToggleStats: () => void;
    onExportPNG: () => void;
    onExportJSON: () => void;
    onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
    people: Person[];
    searchQuery: string;
}

export const TopBar: React.FC<TopBarProps> = ({
    onSearch,
    onSelectPerson,
    onToggleStats,
    onExportPNG,
    onExportJSON,
    onImportJSON,
    people,
    searchQuery
}) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredPeople = React.useMemo(() => {
        if (!searchQuery) return [];
        return people.filter(p =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [people, searchQuery]);

    return (
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-3 pointer-events-none">
            {/* Title Header */}
            <div className="pointer-events-auto flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-6 py-2.5">
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap">
                        🌳 Rumpun Keluarga Cimbu Kanan
                    </h1>
                </div>
            </div>

            {/* Controls Row */}
            <div className="pointer-events-auto flex items-center gap-2 w-full max-w-4xl mx-auto justify-between">

                {/* Search Bar */}
                <div className="relative group">
                    <div className={`
            flex items-center bg-white/90 backdrop-blur-md shadow-lg rounded-2xl transition-all duration-300
            ${isSearchFocused ? 'ring-2 ring-blue-500 w-80' : 'w-64'}
          `}>
                        <Search className="ml-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => onSearch(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            placeholder="Cari anggota keluarga..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2.5 px-3 rounded-2xl"
                        />
                    </div>

                    {/* Dropdown Results */}
                    {searchQuery && filteredPeople.length > 0 && isSearchFocused && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto border border-gray-100">
                            {filteredPeople.map(person => (
                                <button
                                    key={person.id}
                                    onClick={() => {
                                        onSearch('');
                                        onSelectPerson(person.id);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    {person.photo ? (
                                        <img src={person.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">{person.firstName} {person.lastName}</div>
                                        <div className="text-xs text-gray-500">{formatDate(person.birthDate)}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={onToggleStats}
                        className="bg-white/90 backdrop-blur shadow-lg border-0 hover:bg-white"
                    >
                        Statistik
                    </Button>

                    <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-1 flex items-center">
                        <button onClick={onExportPNG} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Ekspor PNG">
                            <Download className="w-4 h-4 text-gray-700" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <button onClick={onExportJSON} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Ekspor JSON">
                            <Share2 className="w-4 h-4 text-gray-700" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Impor JSON">
                            <Upload className="w-4 h-4 text-gray-700" />
                            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
