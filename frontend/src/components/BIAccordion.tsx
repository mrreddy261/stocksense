"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface BIAccordionProps {
  title: string;
  icon: string;
  items: string[];
  impactText: string;
  borderColorClass: string;
  iconColorClass: string;
}

export function BIAccordion({ title, icon, items, impactText, borderColorClass, iconColorClass }: BIAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white/[0.02] rounded-xl border border-white/[0.04] transition-all duration-200 ${isOpen ? borderColorClass.replace('hover:', '') : borderColorClass} mb-2`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-4 flex items-center justify-between focus:outline-none group"
      >
        <h4 className="flex items-center gap-3 text-white font-semibold text-sm">
          <span className="text-lg">{icon}</span> {title}
          <span className="text-[10px] text-zinc-600 font-bold bg-white/[0.04] px-2 py-0.5 rounded-md">{items.length}</span>
        </h4>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <ul className="flex flex-col gap-2.5 mb-4">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 leading-relaxed flex items-start gap-3 font-medium">
                    <span className={`${iconColorClass} mt-1.5 opacity-60 text-xs`}>●</span> {item}
                  </li>
                ))}
              </ul>
              {impactText && (
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 font-medium">
                  💡 <span className="text-zinc-500">Impact:</span> {impactText}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
