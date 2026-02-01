import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, CheckCircle, AlertCircle, TrendingDown, RefreshCcw } from 'lucide-react';
import { GeneratedListing } from '../logic';

interface ArchivioTabProps {
  archive: GeneratedListing[];
  onUpdate: (id: string, updates: Partial<GeneratedListing>) => void;
  onDelete: (id: string) => void;
}

export const ArchivioTab: React.FC<ArchivioTabProps> = ({ archive, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'Tutti' | 'Non venduti' | 'Venduti' | 'Da ribassare'>('Tutti');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.metaKey && e.key === 'd' && archive.length > 0) {
        // Segna come venduto il primo articolo non venduto visibile
        const firstUnsold = filteredArchive.find(i => i.status === 'Non venduto');
        if (firstUnsold) {
          e.preventDefault();
          onUpdate(firstUnsold.id, { status: 'Venduto' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [archive, filteredArchive, onUpdate]);

  const filteredArchive = useMemo(() => {
    return archive.filter(item => {
      const matchesSearch = item.seoTitles[0].toLowerCase().includes(search.toLowerCase());
      if (filter === 'Tutti') return matchesSearch;
      if (filter === 'Non venduti') return matchesSearch && item.status === 'Non venduto';
      if (filter === 'Venduti') return matchesSearch && item.status === 'Venduto';
      if (filter === 'Da ribassare') return matchesSearch && item.status === 'Non venduto' && item.daysElapsed >= 4;
      return matchesSearch;
    });
  }, [archive, search, filter]);

  const getFollowUpSuggestion = (item: GeneratedListing) => {
    if (item.status === 'Venduto') return null;

    if (item.daysElapsed >= 15) {
      return {
        icon: <AlertCircle size={14} className="text-red-500" />,
        text: "Decisione necessaria: ribasso pesante o pausa.",
        action: "Cambia strategia"
      };
    }
    if (item.daysElapsed >= 10) {
      return {
        icon: <RefreshCcw size={14} className="text-apple-blue" />,
        text: "Giorno 10: Suggerito relist con ribasso -10%.",
        action: "Relist"
      };
    }
    if (item.daysElapsed >= 4) {
      return {
        icon: <TrendingDown size={14} className="text-amber-500" />,
        text: "Giorno 4: Suggerito ribasso lieve (-5%).",
        action: "Ribassa"
      };
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-160px)]">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-gray group-focus-within:text-apple-blue transition-colors" size={18} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cerca tra i tuoi articoli..."
            className="apple-input pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-black/5 px-1.5 py-0.5 rounded border border-black/5 opacity-50 font-bold">⌘K</div>
        </div>

        <div className="flex gap-2 p-1 bg-apple-gray/10 rounded-xl">
          {(['Tutti', 'Non venduti', 'Venduti', 'Da ribassare'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? 'bg-white shadow-sm text-apple-blue' : 'text-apple-gray hover:text-apple-dark-gray'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {filteredArchive.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-apple-gray/50 gap-4">
            <Archive size={48} className="opacity-20" />
            <p className="text-sm">Nessun articolo trovato nell'archivio</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            <AnimatePresence mode="popLayout">
              {filteredArchive.map((item) => {
                const suggestion = getFollowUpSuggestion(item);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="apple-card p-5 flex flex-col gap-4 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-apple-gray uppercase tracking-wider">
                          {new Date(item.createdAt).toLocaleDateString('it-IT')} • Giorno {item.daysElapsed}
                        </span>
                        <h3 className="font-bold text-sm line-clamp-1">{item.seoTitles[0]}</h3>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.status === 'Venduto' ? 'bg-green-100 text-green-600' : 'bg-apple-blue/10 text-apple-blue'
                      }`}>
                        {item.status}
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-apple-blue">€{item.price.final}</span>
                        <span className="text-[10px] text-apple-gray">{item.categories[0].path.split('→').pop()}</span>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        {item.status !== 'Venduto' && (
                          <button
                            onClick={() => onUpdate(item.id, { status: 'Venduto' })}
                            className="p-2 hover:bg-green-50 text-green-600 rounded-full transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {suggestion && (
                      <div className="mt-2 p-3 bg-apple-light-gray rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {suggestion.icon}
                          <p className="text-[11px] font-medium leading-tight">{suggestion.text}</p>
                        </div>
                        <button className="text-[10px] font-bold text-apple-blue hover:underline text-left">
                          {suggestion.action} →
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const Archive = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);
