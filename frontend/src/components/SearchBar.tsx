"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  activeTab: 'stocks' | 'fno' | 'mf';
}

export function SearchBar({ activeTab }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'stocks': return "Search stocks (e.g., RELIANCE, TCS)";
      case 'fno': return "Search F&O stocks (e.g., NIFTY, BANKNIFTY)";
      case 'mf': return "Search mutual funds (e.g., SBI Bluechip Fund)";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchData = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      setShowDropdown(true);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.data) {
          setResults(data.data);
        }
      } catch (err) {
        console.error("Failed to search", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setShowDropdown(false);
    setQuery('');
    router.push(`/results/${symbol}`);
  };

  return (
    <div className="relative w-full max-w-lg z-50" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) setShowDropdown(true); }}
          placeholder={getPlaceholder()}
          className="w-full bg-[#131316] text-white border border-white/10 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm placeholder-zinc-500 shadow-inner"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 w-full bg-[#131316] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 max-h-64 overflow-y-auto"
          >
            {results.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelect(item.symbol)}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">{item.symbol}</span>
                  <span className="text-zinc-400 text-xs truncate max-w-[200px] md:max-w-xs">{item.shortname}</span>
                </div>
                {item.exchDisp && (
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">
                    {item.exchDisp}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
