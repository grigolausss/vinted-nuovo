import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Archive } from 'lucide-react';
import { GeneraTab } from './components/GeneraTab';
import { ArchivioTab } from './components/ArchivioTab';
import { GeneratedListing } from './logic';

function App() {
  const [activeTab, setActiveTab] = useState<'genera' | 'archivio'>('genera');
  const [archive, setArchive] = useState<GeneratedListing[]>([]);

  // Caricamento iniziale da LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('vinted_copilot_archive');
    if (saved) {
      setArchive(JSON.parse(saved));
    }
  }, []);

  // Salvataggio su LocalStorage ad ogni modifica
  useEffect(() => {
    localStorage.setItem('vinted_copilot_archive', JSON.stringify(archive));
  }, [archive]);

  // Scorciatoie Mac
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('genera');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('archivio');
            break;
          case 'k':
            e.preventDefault();
            setActiveTab('archivio');
            // Il focus sulla search bar è gestito via autofocus o ref se necessario
            break;
          case 'n':
            e.preventDefault();
            setActiveTab('genera');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleArchive = (listing: GeneratedListing) => {
    setArchive([listing, ...archive]);
  };

  const updateListing = (id: string, updates: Partial<GeneratedListing>) => {
    setArchive(archive.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteListing = (id: string) => {
    setArchive(archive.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto px-6 pt-8 gap-8">
      {/* Header & Tabs */}
      <header className="flex justify-between items-center bg-white/50 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-sm">
        <div className="flex items-center gap-4 pl-4">
          <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center text-white">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Vinted Copilot</h1>
            <p className="text-[10px] text-apple-gray font-medium tracking-wide uppercase mt-1">macOS edition</p>
          </div>
        </div>

        <nav className="flex gap-2">
          <button
            onClick={() => setActiveTab('genera')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
              activeTab === 'genera' ? 'bg-white shadow-apple text-apple-blue' : 'text-apple-gray hover:text-apple-dark-gray'
            }`}
          >
            <SparklesIcon size={18} />
            <span className="text-sm font-semibold">Genera</span>
            <span className="text-[10px] ml-1 bg-apple-gray/10 px-1.5 py-0.5 rounded border border-black/5 opacity-50">⌘1</span>
          </button>
          <button
            onClick={() => setActiveTab('archivio')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
              activeTab === 'archivio' ? 'bg-white shadow-apple text-apple-blue' : 'text-apple-gray hover:text-apple-dark-gray'
            }`}
          >
            <Archive size={18} />
            <span className="text-sm font-semibold">Archivio</span>
            <span className="text-[10px] ml-1 bg-apple-gray/10 px-1.5 py-0.5 rounded border border-black/5 opacity-50">⌘2</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'genera' ? (
            <motion.div
              key="genera"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <GeneraTab onArchive={handleArchive} />
            </motion.div>
          ) : (
            <motion.div
              key="archivio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <ArchivioTab
                archive={archive}
                onUpdate={updateListing}
                onDelete={deleteListing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sparkles icon local component for better control
const SparklesIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L14.5 9L21 11.5L14.5 14L12 20L9.5 14L3 11.5L9.5 9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default App;
