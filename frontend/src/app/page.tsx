"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Search, Clock, ArrowRight, Flame, Loader2, BarChart3, Wallet, Layers, Zap, Eye, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ASSET_DATABASE = [
  { name: "Reliance Industries", symbol: "RELIANCE", type: "stock" },
  { name: "Tata Consultancy Services", symbol: "TCS", type: "stock" },
  { name: "HDFC Bank Limited", symbol: "HDFCBANK", type: "stock" },
  { name: "Infosys Limited", symbol: "INFY", type: "stock" },
  { name: "State Bank of India", symbol: "SBIN", type: "stock" },
  { name: "ICICI Bank", symbol: "ICICIBANK", type: "stock" },
  { name: "Zomato Limited", symbol: "ZOMATO", type: "stock" },
  
  { name: "NIFTY 50", symbol: "^NSEI", type: "fo" },
  { name: "BANKNIFTY", symbol: "^NSEBANK", type: "fo" },
  { name: "FINNIFTY", symbol: "CNXFIN", type: "fo" },
  
  { name: "SBI Bluechip Fund Direct Growth", symbol: "119598", slug: "sbi-bluechip-fund", type: "mf" },
  { name: "HDFC Mid-Cap Opportunities Fund", symbol: "118989", slug: "hdfc-mid-cap", type: "mf" },
  { name: "Nippon India Silver ETF", symbol: "149758", slug: "nippon-india-silver-etf-base", type: "mf" },
  { name: "Nippon India Silver ETF FoF Direct Growth", symbol: "149760", slug: "nippon-india-silver-etf-fof", type: "mf" },
  { name: "Parag Parikh Flexi Cap Fund", symbol: "122639", slug: "parag-parikh-flexi-cap", type: "mf" }
];

const MARKET_TICKER_DATA = [
  { name: "NIFTY 50", value: "23,516.45", change: "+1.24%", positive: true },
  { name: "SENSEX", value: "77,342.80", change: "+0.98%", positive: true },
  { name: "BANKNIFTY", value: "50,187.35", change: "-0.32%", positive: false },
  { name: "RELIANCE", value: "₹1,272.50", change: "+2.1%", positive: true },
  { name: "TCS", value: "₹3,485.20", change: "-0.5%", positive: false },
  { name: "HDFCBANK", value: "₹1,678.90", change: "+0.8%", positive: true },
  { name: "INFY", value: "₹1,542.30", change: "+1.6%", positive: true },
  { name: "GOLD", value: "₹92,450", change: "+0.4%", positive: true },
];

const FEATURES = [
  { icon: BarChart3, title: "Stocks", desc: "Real-time AI quant signals with MA crossover, RSI momentum and business intelligence", color: "from-indigo-500 to-blue-600", border: "border-indigo-500/20", glow: "group-hover:shadow-[0_0_60px_rgba(99,102,241,0.15)]" },
  { icon: Layers, title: "Futures & Options", desc: "Put-Call ratio analysis, open interest mapping, and strike-level support/resistance zones", color: "from-amber-500 to-orange-600", border: "border-amber-500/20", glow: "group-hover:shadow-[0_0_60px_rgba(245,158,11,0.15)]" },
  { icon: Wallet, title: "Mutual Funds", desc: "Historical NAV intelligence with annualized return tracking and risk assessment", color: "from-emerald-500 to-teal-600", border: "border-emerald-500/20", glow: "group-hover:shadow-[0_0_60px_rgba(16,185,129,0.15)]" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try { 
          const parsed = JSON.parse(stored);
          const cleaned = parsed.map((item: any) => {
              if (item.symbol === '146522' || item.symbol === '149758') {
                 return { ...item, symbol: '149760', name: 'Nippon India Silver ETF FoF Direct Growth' };
              }
              return item;
          });
          setRecentSearches(cleaned); 
          localStorage.setItem('recentSearches', JSON.stringify(cleaned));
      } catch (e) {}
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Keyboard shortcut: Cmd/Ctrl + K to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
      if (e.key === 'Escape') {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const normalize = (str: string) => str.toLowerCase().replace(/-/g, ' ').trim();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearchingAPI(false);
      setSelectedIndex(-1);
      return;
    }

    const searchEngine = async () => {
        const terms = normalize(query).split(' ').filter(Boolean);
        const localMatches = ASSET_DATABASE.filter(asset => {
            const searchString = normalize(`${asset.name} ${asset.symbol}`);
            return terms.every(term => searchString.includes(term));
        });

        if (localMatches.length > 0) {
            setResults(localMatches);
            setIsSearchingAPI(false);
            setSelectedIndex(-1);
            return;
        }

        setIsSearchingAPI(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            if (data.data && data.data.length > 0) {
                const apiResults = data.data.map((item: any) => {
                    let inferredType = 'stock';
                    if (item.quoteType === 'INDEX') inferredType = 'fo';
                    if (item.quoteType === 'MUTUALFUND') inferredType = 'mf';
                    
                    return {
                        name: item.shortname || item.symbol,
                        symbol: item.symbol,
                        type: inferredType
                    };
                });
                setResults(apiResults);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error("API Search failed", err);
            setResults([]);
        } finally {
            setIsSearchingAPI(false);
            setSelectedIndex(-1);
        }
    };

    const debounceTimer = setTimeout(() => {
        searchEngine();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const saveRecentSearch = (item: any) => {
    const updated = [item, ...recentSearches.filter(i => i.name !== item.name)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSelect = useCallback((item: any) => {
    setShowDropdown(false);
    setQuery("");
    saveRecentSearch(item);

    if (item.type === 'stock') {
      router.push(`/results/${item.symbol}`);
    } else if (item.type === 'fo') {
      router.push(`/fo/${item.symbol}`);
    } else if (item.type === 'mf') {
      router.push(`/mutual-fund/${item.symbol}`);
    }
  }, [recentSearches, router]);

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'stock': return <BarChart3 className="w-4 h-4" />;
      case 'fo': return <Layers className="w-4 h-4" />;
      case 'mf': return <Wallet className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'stock': return "Stock";
      case 'fo': return "F&O / Index";
      case 'mf': return "Mutual Fund";
      default: return "Asset";
    }
  };

  const getAccentColor = (type: string) => {
    switch (type) {
      case 'stock': return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      case 'fo': return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case 'mf': return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-zinc-400 bg-white/5 border-white/10";
    }
  };

  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    try {
      const escaped = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) => 
            part.toLowerCase() === highlight.toLowerCase() ? <span key={i} className="text-indigo-400 font-black">{part}</span> : <span key={i}>{part}</span>
          )}
        </span>
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-[#050507]">
      
      {/* ─── ANIMATED BACKGROUND ORBS ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[150px] animate-float" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/[0.05] blur-[130px] animate-float-delay" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-emerald-600/[0.04] blur-[160px] animate-float-slow" />
        <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[100px] animate-float-delay" />
      </div>

      {/* ─── LIVE MARKET TICKER RIBBON ─── */}
      <div className="w-full bg-[#08080a]/80 backdrop-blur-xl border-b border-white/[0.04] py-2.5 overflow-hidden relative z-20">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARKET_TICKER_DATA, ...MARKET_TICKER_DATA].map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-3 px-6 border-r border-white/[0.04] last:border-0">
              <span className="text-xs font-bold text-zinc-500 tracking-wider">{item.name}</span>
              <span className="text-xs font-bold text-white font-[family-name:var(--font-mono)]">{item.value}</span>
              <span className={`text-[11px] font-bold font-[family-name:var(--font-mono)] ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="z-10 w-full max-w-6xl px-4 sm:px-6 flex flex-col items-center pt-16 sm:pt-24 md:pt-32">
        
        {/* ─── HERO SECTION ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mb-14 md:mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 mb-8 glow-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 tracking-wider uppercase">AI-Powered Intelligence Engine</span>
          </motion.div>
          
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter text-center leading-[0.9]">
            <span className="text-gradient-hero">Stock</span>
            <span className="text-gradient-hero">Sense</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-zinc-500 text-center text-base sm:text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-2">
            Institutional-grade market intelligence for the modern investor.
          </p>
          <p className="text-zinc-600 text-center text-sm font-medium">
            Track Stocks, F&O, and Mutual Funds — all in one place.
          </p>
        </motion.div>

        {/* ─── SEARCH BAR ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-2xl relative z-50 mb-20 md:mb-28"
          ref={dropdownRef}
        >
          {/* Glow ring */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-emerald-500/30 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none" style={{ opacity: showDropdown ? 0.5 : 0 }} />
          
          <div className={`relative flex flex-col glass-card ${showDropdown ? 'rounded-t-2xl rounded-b-none border-b-0' : 'rounded-2xl'} transition-all duration-300`}>
            
            {/* Input row */}
            <div className="flex items-center w-full">
                <div className="pl-5 md:pl-6 text-zinc-500 flex items-center justify-center">
                    {isSearchingAPI ? <Loader2 className="w-5 h-5 md:w-5 md:h-5 animate-spin text-indigo-400" /> : <Search className="w-5 h-5 md:w-5 md:h-5" />}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                      setQuery(e.target.value);
                      setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyboardNav}
                  placeholder="Search stocks, F&O, mutual funds..."
                  className="w-full bg-transparent py-4 md:py-5 px-4 text-base md:text-lg placeholder:text-zinc-600 focus:outline-none text-white font-medium"
                />
                <div className="pr-4 md:pr-5 flex items-center gap-2 hide-mobile">
                  <kbd className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-zinc-500 font-[family-name:var(--font-mono)]">⌘K</kbd>
                </div>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full glass-card rounded-t-none rounded-b-2xl border-t border-white/[0.04] overflow-hidden flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.9)] z-40"
                >
                    <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto w-full">
                        
                        {query.trim().length > 0 ? (
                            results.length > 0 ? (
                                <div className="flex flex-col py-2">
                                    {results.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => handleSelect(item)}
                                            className={`px-5 md:px-6 py-3.5 cursor-pointer flex items-center justify-between transition-all duration-150 group/item ${selectedIndex === idx ? 'bg-indigo-500/10' : 'hover:bg-white/[0.04]'}`}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className={`p-2 rounded-lg border ${getAccentColor(item.type)} transition-colors`}>
                                                  {getIcon(item.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white text-sm md:text-[15px] leading-tight mb-0.5">
                                                        {renderHighlightedText(item.name, query)}
                                                    </span>
                                                    <span className="text-zinc-500 text-[11px] md:text-xs font-medium uppercase tracking-wider">{getLabel(item.type)} • {item.symbol}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-zinc-700 group-hover/item:text-zinc-400 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            ) : !isSearchingAPI && (
                                <div className="p-8 text-center flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                      <Search className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    <span className="text-zinc-500 font-medium text-sm mb-1">No results found</span>
                                    <span className="text-zinc-600 text-xs">Try a different search term</span>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col">
                                
                                {recentSearches.length > 0 && (
                                  <>
                                    <div className="px-5 pt-4 pb-2">
                                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> Recent
                                      </span>
                                    </div>
                                    <div className="flex flex-col mb-2">
                                        {recentSearches.map((item, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => handleSelect(item)}
                                                className="px-5 py-2.5 hover:bg-white/[0.03] cursor-pointer flex items-center gap-3 transition-colors"
                                            >
                                                <div className={`p-1.5 rounded-md border ${getAccentColor(item.type)} opacity-60`}>
                                                  {getIcon(item.type)}
                                                </div>
                                                <span className="text-zinc-400 font-medium text-sm">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                  </>
                                )}

                                <div className="border-t border-white/[0.04] px-5 py-4">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-1.5 mb-3">
                                    <Flame className="w-3 h-3 text-orange-500/60" /> Popular
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                      {ASSET_DATABASE.filter(a => a.type === 'stock').slice(0, 5).map((item, idx) => (
                                          <div 
                                              key={idx}
                                              onClick={() => handleSelect(item)}
                                              className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-white text-xs font-medium rounded-lg cursor-pointer transition-all border border-white/[0.06] hover:border-white/[0.12]"
                                          >
                                              {item.symbol}
                                          </div>
                                      ))}
                                  </div>
                                </div>

                                <div className="border-t border-white/[0.04] px-5 py-4">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-1.5 mb-3">
                                    <TrendingUp className="w-3 h-3 text-emerald-500/60" /> Trending
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                      {['NIFTY 50', 'BANKNIFTY', 'FINNIFTY'].map((t, idx) => (
                                          <div 
                                              key={idx}
                                              onClick={() => handleSelect({ name: t, symbol: t === 'NIFTY 50' ? '^NSEI' : t === 'BANKNIFTY' ? '^NSEBANK' : 'CNXFIN', type: 'fo' })}
                                              className="px-3 py-1.5 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] text-emerald-400/80 hover:text-emerald-400 text-xs font-medium rounded-lg cursor-pointer flex items-center gap-1.5 transition-all border border-emerald-500/[0.1] hover:border-emerald-500/[0.2]"
                                          >
                                              <TrendingUp className="w-3 h-3" /> {t}
                                          </div>
                                      ))}
                                  </div>
                                </div>

                            </div>
                        )}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── FEATURE CARDS ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-16 md:mb-24"
        >
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className={`group glass-card glass-card-hover p-6 md:p-7 cursor-pointer transition-all duration-500 ${feature.glow}`}
              onClick={() => {
                if (idx === 0) inputRef.current?.focus();
                else if (idx === 1) router.push('/fo/^NSEI');
                else router.push('/mutual-fund/119598');
              }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
              <div className="flex items-center gap-1.5 mt-5 text-indigo-400/60 group-hover:text-indigo-400 transition-colors text-xs font-semibold">
                Explore <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── QUICK ACCESS GRID ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-full mb-16 md:mb-24"
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" /> Quick Access
            </h2>
            <button 
              onClick={() => router.push('/screener')}
              className="btn-ghost px-4 py-2 text-xs font-bold flex items-center gap-1.5 tracking-wide"
            >
              <Eye className="w-3.5 h-3.5" /> AI Screener <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ASSET_DATABASE.filter(a => a.type === 'stock').slice(0, 5).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + idx * 0.05 }}
                onClick={() => handleSelect(item)}
                className="glass-card glass-card-hover p-4 cursor-pointer group transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold text-sm tracking-tight">{item.symbol}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400/60 group-hover:bg-emerald-400 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                </div>
                <span className="text-zinc-600 text-xs font-medium leading-tight line-clamp-1">{item.name}</span>
                <div className="flex items-center gap-1 mt-3 text-emerald-400/50 group-hover:text-emerald-400 transition-colors">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">View</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── FOOTER ─── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="w-full border-t border-white/[0.04] py-8 flex flex-col md:flex-row items-center justify-between gap-4 px-1 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center ring-1 ring-indigo-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-zinc-600 text-xs font-semibold tracking-wider">StockSense v2.0</span>
          </div>
          <p className="text-zinc-700 text-[11px] font-medium text-center">
            Not financial advice. For educational and informational purposes only.
          </p>
          <span className="text-zinc-700 text-[11px] font-medium">Built with Next.js & AI</span>
        </motion.footer>
      </div>
    </main>
  );
}
