import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';
import { Person } from '@/types/family';
import { initialFamilyData } from '@/data/familyData';
import { calculateLayout } from '@/utils/layoutUtils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import * as api from '@/services/api';

// Components
import { ConnectionLines } from '@/components/tree/ConnectionLines';
import { PersonNode } from '@/components/tree/PersonNode';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { TopBar } from '@/components/layout/TopBar';
import { ZoomControls } from '@/components/layout/ZoomControls';
import { StatisticsModal } from '@/components/ui/StatisticsModal';
import { PersonForm } from '@/components/PersonForm';
import { Modal } from '@/components/ui/Modal';
import { Users, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GuideButton } from '@/components/ui/GuideButton';
import { GuideModal } from '@/components/guide/GuideModal';
import { LogButton } from '@/components/ui/LogButton';
import { LogModal } from '@/components/ui/LogModal';
import { WelcomeModal } from '@/components/ui/WelcomeModal';

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.75);
  const [translate, setTranslate] = useState({ x: 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // UI State
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [searchQuery, setSearchQuery] = useState('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isNewPerson, setIsNewPerson] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [addingSpouseForId, setAddingSpouseForId] = useState<string | null>(null);

  const treeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data from database or fallback to local
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        try {
          const dbPeople = await api.fetchPeople();
          if (dbPeople.length === 0) {
            // Database is empty — seed with initial data
            await api.seedDatabase(initialFamilyData);
            const seeded = await api.fetchPeople();
            setPeople(seeded);
          } else {
            setPeople(dbPeople);
          }
        } catch (err) {
          console.error('Database error, falling back to local data:', err);
          setDbError('Database tidak terhubung. Menggunakan data lokal.');
          setPeople(initialFamilyData);
        }
      } else {
        // No Supabase configured — use local data
        setPeople(initialFamilyData);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Calculate positions
  const positions = useMemo(() => calculateLayout(people), [people]);

  // Auto-center on Bombang (first generation) when data loads
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (people.length > 0 && positions.size > 0 && containerRef.current && !hasCenteredRef.current) {
      // Try to center on Bombang (id: '5') first, fallback to root nodes
      const focusPerson = positions.get('5');

      let centerX: number, centerY: number;

      if (focusPerson) {
        // Center on Bombang and spouse if exists
        const bombang = people.find(p => p.id === '5');
        if (bombang?.spouseId) {
          const spousePos = positions.get(bombang.spouseId);
          if (spousePos) {
            centerX = (focusPerson.x + spousePos.x) / 2;
            centerY = (focusPerson.y + spousePos.y) / 2;
          } else {
            centerX = focusPerson.x;
            centerY = focusPerson.y;
          }
        } else {
          centerX = focusPerson.x;
          centerY = focusPerson.y;
        }
      } else {
        // Fallback: center on all root nodes
        const roots = people.filter(p =>
          p.parentIds.length === 0 ||
          p.parentIds.every(pid => !people.find(x => x.id === pid))
        );
        let sumX = 0, sumY = 0, count = 0;
        roots.forEach(root => {
          const pos = positions.get(root.id);
          if (pos) { sumX += pos.x; sumY += pos.y; count++; }
        });
        centerX = count > 0 ? sumX / count : 0;
        centerY = count > 0 ? sumY / count : 0;
      }

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      setTranslate({
        x: containerWidth / 2 - centerX * scale,
        y: containerHeight / 3 - centerY * scale
      });

      hasCenteredRef.current = true;
    }
  }, [people, positions, scale]);

  // Derived state
  const selectedPerson = useMemo(() =>
    people.find(p => p.id === selectedPersonId) || null
    , [people, selectedPersonId]);

  // Handlers
  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.3));
  const handleReset = () => {
    setScale(0.75);
    setTranslate({ x: 0, y: 100 });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleCenterOnPerson = (personId: string) => {
    const pos = positions.get(personId);
    if (pos && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      setTranslate({
        x: containerWidth / 2 - pos.x * scale,
        y: containerHeight / 3 - pos.y * scale
      });
      setSelectedPersonId(personId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking on the background (tree-canvas or container)
    // We check if the target has certain classes or is the container
    if ((e.target as HTMLElement).closest('.clickable-node')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch handlers for mobile drag & pinch-to-zoom
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDistRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.clickable-node')) return;

    if (e.touches.length === 1) {
      // Single finger — drag
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
      // Two fingers — pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && lastTouchRef.current) {
      // Single finger — drag
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchRef.current.x;
      const dy = touch.clientY - lastTouchRef.current.y;
      setTranslate(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      // Two fingers — pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / lastPinchDistRef.current;
      setScale(s => Math.max(0.3, Math.min(3, s * ratio)));
      lastPinchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastTouchRef.current = null;
    lastPinchDistRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.max(0.3, Math.min(3, s * delta)));
  };

  const handleAddPerson = (type: 'child' | 'spouse' | 'sibling', parentId?: string) => {
    const newPerson: Person = {
      id: Date.now().toString(),
      firstName: 'New',
      lastName: 'Person',
      birthDate: new Date().toISOString().split('T')[0],
      gender: 'other',
      photo: '',
      bio: '',
      occupation: '',
      location: '',
      parentIds: [],
      childrenIds: [],
    };

    if (type === 'child' && selectedPersonId) {
      newPerson.parentIds = [selectedPersonId];
      // Check if selected person has spouse, if so add them as parent too
      const currentPerson = people.find(p => p.id === selectedPersonId);
      if (currentPerson?.spouseId) {
        newPerson.parentIds.push(currentPerson.spouseId);
      }
    } else if (type === 'spouse' && selectedPersonId) {
      // Set opposite gender as default
      const currentPerson = people.find(p => p.id === selectedPersonId);
      newPerson.gender = currentPerson?.gender === 'male' ? 'female' : 'male';
      newPerson.firstName = '';
      newPerson.lastName = currentPerson?.lastName || '';
      setAddingSpouseForId(selectedPersonId);
    } else if (type === 'sibling' && parentId) {
      newPerson.parentIds = [parentId];
    }

    setEditingPerson(newPerson);
    setIsNewPerson(true);
    setShowPersonModal(true);
  };

  const handleSavePerson = async (person: Person) => {
    try {
      if (isNewPerson) {
        // Persist to database
        if (isSupabaseConfigured) {
          const created = await api.createPerson(person);
          person = created;
        }

        setPeople(prev => {
          let updated = [...prev, person];

          // Update parent references
          person.parentIds.forEach(parentId => {
            const parentIndex = updated.findIndex(p => p.id === parentId);
            if (parentIndex !== -1 && !updated[parentIndex].childrenIds.includes(person.id)) {
              updated[parentIndex] = {
                ...updated[parentIndex],
                childrenIds: [...updated[parentIndex].childrenIds, person.id]
              };
            }
          });

          // Link as spouse if adding spouse
          if (addingSpouseForId) {
            const spouseIndex = updated.findIndex(p => p.id === addingSpouseForId);
            if (spouseIndex !== -1) {
              updated[spouseIndex] = {
                ...updated[spouseIndex],
                spouseId: person.id
              };
            }
            // Set the new person's spouseId too
            const newPersonIndex = updated.findIndex(p => p.id === person.id);
            if (newPersonIndex !== -1) {
              updated[newPersonIndex] = {
                ...updated[newPersonIndex],
                spouseId: addingSpouseForId
              };
              person = updated[newPersonIndex];
            }

            // Update both in database
            if (isSupabaseConfigured) {
              api.updatePerson(updated[spouseIndex]).catch(console.error);
              api.updatePerson(updated[newPersonIndex]).catch(console.error);
            }
          }

          return updated;
        });
      } else {
        // Update in database
        if (isSupabaseConfigured) {
          await api.updatePerson(person);
        }
        setPeople(prev => prev.map(p => p.id === person.id ? person : p));
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    }

    setShowPersonModal(false);
    setEditingPerson(null);
    setIsNewPerson(false);
    setAddingSpouseForId(null);
    setSelectedPersonId(person.id);
  };

  const handleDeletePerson = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus orang ini?')) {
      try {
        if (isSupabaseConfigured) {
          await api.deletePerson(id);
        }
        setPeople(prev => {
          return prev
            .filter(p => p.id !== id)
            .map(p => ({
              ...p,
              childrenIds: p.childrenIds.filter(cid => cid !== id),
              parentIds: p.parentIds.filter(pid => pid !== id),
              spouseId: p.spouseId === id ? undefined : p.spouseId
            }));
        });
        setSelectedPersonId(null);
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Gagal menghapus. Silakan coba lagi.');
      }
    }
  };

  const handleExport = async () => {
    if (treeRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(treeRef.current, {
          backgroundColor: '#f8fafc',
          pixelRatio: 2,
        });
        const link = document.createElement('a');
        link.download = `family-tree-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
        alert('Failed to export image');
      }
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(people, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `family-tree-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            setPeople(imported);
            setSelectedPersonId(null);
          }
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Memuat data keluarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col">
      {/* Database Error Banner */}
      {dbError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 text-center">
          ⚠️ {dbError}
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">

        <TopBar
          onSearch={setSearchQuery}
          onSelectPerson={handleCenterOnPerson}
          onToggleStats={() => setShowStats(!showStats)}
          onExportPNG={handleExport}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          people={people}
          searchQuery={searchQuery}
        />

        <ZoomControls
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* Tree Canvas */}
        <div
          ref={containerRef}
          className={`w-full h-full cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              transform: `translate(${translate.x % 40}px, ${translate.y % 40}px)`
            }}
          />
          <div
            ref={treeRef}
            className="tree-canvas origin-top-left touch-none"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              width: '100%',
              height: '100%',
            }}
          >
            {/* Connection Lines */}
            <ConnectionLines
              positions={positions}
              selectedPersonId={selectedPersonId}
              connectedNodes={
                selectedPersonId
                  ? new Set([
                    selectedPersonId,
                    ...(people.find(p => p.id === selectedPersonId)?.parentIds || []),
                    ...(people.find(p => p.id === selectedPersonId)?.childrenIds || []),
                    ...(people.find(p => p.id === selectedPersonId)?.spouseId ? [people.find(p => p.id === selectedPersonId)!.spouseId!] : [])
                  ])
                  : new Set()
              }
            />

            {/* Person Nodes */}
            {Array.from(positions.entries()).map(([id, position]) => (
              <div key={id} className="clickable-node">
                <PersonNode
                  position={position}
                  isSelected={selectedPersonId === id}
                  onSelect={() => setSelectedPersonId(id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {people.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center pointer-events-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Family Members</h2>
              <p className="text-gray-500 mb-4">Start building your family tree by adding the first person</p>
              <Button onClick={() => handleAddPerson('child')}>
                <Plus className="w-5 h-5 mr-2" />
                Add First Person
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Views */}
      {isDesktop ? (
        <Sidebar
          isOpen={!!selectedPerson}
          selectedPerson={selectedPerson}
          onClose={() => setSelectedPersonId(null)}
          onEdit={(p) => {
            setEditingPerson(p);
            setIsNewPerson(false);
            setShowPersonModal(true);
          }}
          onDelete={handleDeletePerson}
          onAddRelation={handleAddPerson}
          onSelectPerson={handleCenterOnPerson}
          people={people}
        />
      ) : (
        <BottomSheet
          isOpen={!!selectedPersonId}
          selectedPerson={selectedPerson}
          onClose={() => setSelectedPersonId(null)}
          onEdit={(p) => {
            setEditingPerson(p);
            setIsNewPerson(false);
            setShowPersonModal(true);
          }}
          onDelete={handleDeletePerson}
          onAddRelation={handleAddPerson}
          onSelectPerson={handleCenterOnPerson}
          people={people}
        />
      )}

      {/* Modals */}
      <StatisticsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        people={people}
      />

      {/* Guide Button & Modal */}
      <GuideButton onClick={() => setIsGuideOpen(true)} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Activity Log Button & Modal */}
      <LogButton onClick={() => setIsLogOpen(true)} />
      <LogModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />

      {/* Welcome Modal */}
      <WelcomeModal />

      <Modal
        isOpen={showPersonModal}
        onClose={() => setShowPersonModal(false)}
        title={isNewPerson ? 'Tambah Anggota Baru' : 'Edit Data'}
      >
        <PersonForm
          person={editingPerson}
          onSave={handleSavePerson}
          onCancel={() => setShowPersonModal(false)}
        />
      </Modal>
    </div>
  );
}
