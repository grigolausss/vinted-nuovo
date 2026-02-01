import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { OutputCard } from './OutputCard';
import {
  generateSeoTitles,
  generateDescription,
  suggestCategories,
  suggestPrice,
  honestyChecker,
  enrichData,
  ListingInput,
  GeneratedListing
} from '../logic';

interface GeneraTabProps {
  onArchive: (listing: GeneratedListing) => void;
}

export const GeneraTab: React.FC<GeneraTabProps> = ({ onArchive }) => {
  const [input, setInput] = useState<ListingInput>({
    title: '',
    description: '',
    useEmoji: false,
  });
  const [output, setOutput] = useState<GeneratedListing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter') {
        handleGenerate();
      }
      if (e.metaKey && e.key === 'Backspace') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, isGenerating]); // handleGenerate depends on these

  const handleGenerate = () => {
    if (!input.title || isGenerating) return;

    setIsGenerating(true);
    setOutput(null);
    setWarning(null);

    // Simulazione di processamento per feedback utente
    setTimeout(() => {
      setWarning(honestyChecker(input));

      const enrichment = enrichData(input.title, input.description);
      const seoTitles = generateSeoTitles(input.title, input.description);
      const optimizedDescription = generateDescription(input, enrichment);
      const categories = suggestCategories(input.title);
      const price = suggestPrice(input.title);

      setOutput({
        id: Math.random().toString(36).substring(2, 9),
        originalTitle: input.title,
        seoTitles,
        optimizedDescription,
        categories,
        price,
        createdAt: new Date().toISOString(),
        status: 'Non venduto',
        daysElapsed: 0,
        enrichedData: enrichment || undefined
      });
      setIsGenerating(false);
    }, 1200);
  };

  const handleClear = () => {
    setInput({ title: '', description: '', useEmoji: false });
    setOutput(null);
    setWarning(null);
    titleInputRef.current?.focus();
  };

  const handleProceed = () => {
    if (output) {
      onArchive(output);
      handleClear();
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-160px)] overflow-hidden">
      {/* Colonna Sinistra: Input */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Nuovo Articolo</h2>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-apple-gray">Titolo grezzo</label>
            <input
              ref={titleInputRef}
              type="text"
              className="apple-input"
              placeholder="Cosa stai vendendo?"
              value={input.title}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-apple-gray">Descrizione grezza</label>
            <textarea
              className="apple-input min-h-[200px] resize-none"
              placeholder="Inserisci dettagli, misure, difetti..."
              value={input.description}
              onChange={(e) => setInput({ ...input, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between p-4 apple-card">
            <span className="text-sm font-medium">Emoji in descrizione</span>
            <button
              onClick={() => setInput({ ...input, useEmoji: !input.useEmoji })}
              className={`w-12 h-6 rounded-full transition-colors relative ${input.useEmoji ? 'bg-apple-blue' : 'bg-apple-gray/30'}`}
            >
              <motion.div
                animate={{ x: input.useEmoji ? 24 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleGenerate}
              disabled={!input.title || isGenerating}
              className="apple-button-primary flex-1 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {isGenerating ? 'Generazione...' : 'Genera'}
            </button>
            <button
              onClick={handleClear}
              className="apple-button-secondary flex items-center gap-2"
            >
              <Trash2 size={18} />
              Svuota
            </button>
          </div>

          {warning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm"
            >
              {warning}
            </motion.div>
          )}

          {output?.enrichedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-apple-blue/5 border border-apple-blue/20 rounded-xl text-apple-blue text-xs flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                Arricchimento Intelligente
              </div>
              <p>Per questo oggetto ({output.enrichedData.itemName}) ho aggiunto le seguenti info trovate in rete: <b>{output.enrichedData.addedInfo.join(", ")}</b>. Sono corrette?</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Colonna Destra: Output */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-apple-blue/10 border-t-apple-blue rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-apple-blue" size={24} />
              </div>
              <p className="text-sm font-medium text-apple-blue animate-pulse">Analisi e generazione in corso...</p>
            </motion.div>
          ) : !output ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-apple-gray/50 gap-4"
            >
              <div className="p-8 border-2 border-dashed border-black/5 rounded-3xl">
                <Sparkles size={48} />
              </div>
              <p className="text-sm">I tuoi output appariranno qui</p>
            </motion.div>
          ) : (
            <motion.div
              key="output"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6 pb-20"
            >
              <OutputCard
                title="Card 1 — Titolo Vinted"
                copyText={output.seoTitles[0]}
                content={
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-apple-blue/5 rounded-lg border border-apple-blue/10">
                      <p className="font-semibold text-apple-blue">{output.seoTitles[0]}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] uppercase font-bold text-apple-gray">Varianti</p>
                      {output.seoTitles.slice(1).map((t: string, i: number) => (
                        <p key={i} className="text-xs text-apple-gray p-2 hover:bg-black/5 rounded cursor-pointer transition-colors" onClick={() => {
                          const newTitles = [...output.seoTitles];
                          const selected = newTitles.splice(i + 1, 1)[0];
                          if (selected) {
                            newTitles.unshift(selected);
                            setOutput({ ...output, seoTitles: newTitles });
                          }
                        }}>
                          {t}
                        </p>
                      ))}
                    </div>
                  </div>
                }
              />

              <OutputCard
                title="Card 2 — Descrizione"
                copyText={output.optimizedDescription}
                content={output.optimizedDescription}
              />

              <OutputCard
                title="Card 3 — Categoria"
                copyText={output.categories[0].path}
                content={
                  <div className="flex flex-col gap-4">
                    {output.categories.map((cat: any, i: number) => (
                      <div key={i} className={`p-3 rounded-xl border ${i === 0 ? 'bg-apple-blue/5 border-apple-blue/20' : 'bg-black/5 border-transparent'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-apple-gray">{i === 0 ? 'Migliore corrispondenza' : `Opzione #${i + 1}`}</span>
                          <span className="text-xs font-black text-apple-blue">{cat.confidence}%</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{cat.path}</p>
                        <p className="text-[10px] text-apple-gray italic">{cat.reason}</p>
                      </div>
                    ))}
                  </div>
                }
              />

              <OutputCard
                title="Card 4 — Prezzo Consigliato"
                copyText={output.price.final.toString()}
                content={
                  <div className="flex flex-col gap-4">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-apple-blue">€{output.price.final}</span>
                      <span className="text-sm text-apple-gray pb-1">Range: €{output.price.range[0]} - €{output.price.range[1]}</span>
                    </div>
                    <p className="text-sm">{output.price.reason}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${output.price.confidence === 'alta' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-apple-gray">Confidenza {output.price.confidence}</span>
                    </div>
                  </div>
                }
              />

              <button
                onClick={handleProceed}
                className="fixed bottom-10 right-10 apple-button-primary shadow-2xl flex items-center gap-2 pr-4 pl-8 py-4"
              >
                Procedi con nuovo articolo
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
