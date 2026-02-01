import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OutputCardProps {
  title: string;
  content: React.ReactNode;
  copyText?: string;
  footer?: React.ReactNode;
}

export const OutputCard: React.FC<OutputCardProps> = ({ title, content, copyText, footer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copyText) {
      navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="apple-card p-6 flex flex-col gap-4 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-semibold text-apple-gray uppercase tracking-wider">{title}</h3>
        {copyText && (
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-apple-light-gray rounded-full transition-colors group"
            title="Copia"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check size={16} className="text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy size={16} className="text-apple-blue" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>

      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>

      {footer && (
        <div className="mt-2 pt-4 border-t border-black/5">
          {footer}
        </div>
      )}

      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-2 right-6 text-[10px] font-medium text-green-500"
        >
          Copiato ✓
        </motion.div>
      )}
    </div>
  );
};
