import React from 'react';
import { motion } from 'framer-motion';
import { User, Heart } from 'lucide-react';
import { Person, NodePosition } from '@/types/family';
import { calculateAge } from '@/utils/dateUtils';

// Constants need to be shared or passed in. 
// For now, I'll redefine them or import if I had a constants file.
// Ideally, these should be in a config file.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;

interface PersonNodeProps {
    position: NodePosition;
    isSelected: boolean;
    onSelect: () => void;
}

export const PersonNode: React.FC<PersonNodeProps> = ({ position, isSelected, onSelect }) => {
    const { person, x, y } = position;
    const age = calculateAge(person.birthDate, person.deathDate);
    const isDeceased = !!person.deathDate;
    const hasChildren = person.childrenIds.length > 0;
    const hasParents = person.parentIds.length > 0;

    const genderColors = {
        male: {
            bg: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200',
            ring: 'ring-blue-300',
            accent: 'from-blue-400 to-indigo-500',
            icon: 'bg-blue-100 text-blue-600',
            dot: 'bg-blue-500'
        },
        female: {
            bg: 'from-rose-50 to-pink-50',
            border: 'border-rose-200',
            ring: 'ring-rose-300',
            accent: 'from-rose-400 to-pink-500',
            icon: 'bg-rose-100 text-rose-600',
            dot: 'bg-rose-500'
        },
        other: {
            bg: 'from-violet-50 to-purple-50',
            border: 'border-violet-200',
            ring: 'ring-violet-300',
            accent: 'from-violet-400 to-purple-500',
            icon: 'bg-violet-100 text-violet-600',
            dot: 'bg-violet-500'
        }
    };

    const colors = genderColors[person.gender];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: position.level * 0.08 }}
            className={`absolute cursor-pointer transition-all duration-200 ${isSelected ? 'z-50' : 'z-10 hover:z-40'
                }`}
            style={{
                left: x - NODE_WIDTH / 2,
                top: y - NODE_HEIGHT / 2,
                width: NODE_WIDTH,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {/* Connection dots */}
            {/* Top dot - for parent connection */}
            {hasParents && (
                <div
                    className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white shadow-sm`}
                    style={{ top: '-6px' }}
                />
            )}
            {/* Bottom dot - for children connections */}
            {hasChildren && (
                <div
                    className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white shadow-sm`}
                    style={{ bottom: '-6px' }}
                />
            )}
            {/* Side dot - for spouse connection (only on the right side of the left spouse) */}
            {person.spouseId && (
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pink-400 ring-2 ring-white shadow-sm z-10"
                    style={{ right: '-6px' }}
                />
            )}

            <div className={`
        rounded-xl overflow-hidden shadow-md transition-all duration-200 border-2
        ${isSelected
                    ? `ring-4 ${colors.ring} shadow-2xl scale-105 border-transparent`
                    : `hover:shadow-xl hover:scale-[1.02] border-transparent hover:border-opacity-50`
                }
        bg-gradient-to-br ${colors.bg}
      `}>
                <div className="p-3">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className={`
                w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-md
                ${isDeceased ? 'grayscale opacity-80' : ''}
              `}>
                                {person.photo ? (
                                    <img
                                        src={person.photo}
                                        alt={`${person.firstName} ${person.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${colors.icon}`}>
                                        <User className="w-7 h-7" />
                                    </div>
                                )}
                            </div>
                            {/* Status indicators */}
                            {isDeceased && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-[6px] text-white font-bold">†</span>
                                </div>
                            )}
                            {person.spouseId && !isDeceased && (
                                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <Heart className="w-2 h-2 text-white fill-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">
                                {person.firstName}
                            </h3>
                            <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">
                                {person.lastName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-gray-500">
                                    {new Date(person.birthDate).getFullYear()}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">
                                    {isDeceased ? `${age} yrs` : `Age ${age}`}
                                </span>
                            </div>
                            {person.occupation && (
                                <div className="text-xs text-gray-400 truncate mt-0.5">
                                    {person.occupation}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom accent bar */}
                <div className={`
          h-1.5 w-full bg-gradient-to-r ${colors.accent}
        `} />
            </div>
        </motion.div>
    );
};
