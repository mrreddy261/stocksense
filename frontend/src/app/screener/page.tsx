"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertCircle, Eye, ArrowUpRight, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function ScreenerPage() {
  const router = useRouter();
  const [buys, setBuys] = useState<any[]>([]);
  const [sells, setSells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/screener')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setBuys(d.buys);
        setSells(d.sells);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || "Failed to locate the market screener.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050507] text-white flex-col gap-6 p-4">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-[3px] border-indigo-500/10 border-t-indigo-500 rounded-full"
          />
          <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/20" />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="text-indigo-400/80 font-semibold tracking-[0.15em] uppercase text-xs text-center"
        >
          Compiling Market Intelligence...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050507] text-white flex-col gap-8 px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">Screener Unavailable</h1>
          <p className="text-zinc-500 max-w-md text-center leading-relaxed text-sm">{error}</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="btn-ghost px-6 py-3 text-xs font-bold tracking-wider uppercase"
        >
          Return to Terminal
        </button>
      </div>
    );
  }

  const StockCard = ({ stock, type, index }: { stock: any, type: 'BUY' | 'SELL', index: number }) => {
    const isBuy = type === 'BUY';
    const accentColor = isBuy ? 'text-emerald-400' : 'text-red-400';
    const progressColor = isBuy ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-red-600 to-red-400';
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
        onClick={() => router.push(`/results/${stock.ticker}`)}
        className="group glass-card glass-card-hover p-5 cursor-pointer flex flex-col gap-4"
      >
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-gradient-primary transition-colors">{stock.ticker}</h3>
            <span className={`flex items-center gap-1 text-xs font-bold tracking-wider uppercase ${accentColor}`}>
                {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {stock.signal}
            </span>
        </div>
        <div className="flex justify-between items-end">
            <div>
                <span className="block text-[10px] text-zinc-600 font-bold uppercase tracking-[0.1em] mb-1">Price</span>
                <span className="text-base font-bold text-white font-[family-name:var(--font-mono)]">₹{stock.price.toFixed(2)}</span>
            </div>
            <div className="text-right">
                <span className="block text-[10px] text-zinc-600 font-bold uppercase tracking-[0.1em] mb-1">Conviction</span>
                <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-zinc-300">{stock.confidence.toFixed(1)}%</span>
                <div className="w-20 h-1.5 mt-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stock.confidence}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.04 }}
                      className={`h-full rounded-full ${progressColor}`} 
                    />
                </div>
            </div>
        </div>
        <div className="flex items-center gap-1 text-zinc-600 group-hover:text-indigo-400 transition-colors text-[10px] font-semibold mt-1">
          View Details <ArrowUpRight className="w-3 h-3" />
        </div>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.06] blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.04] blur-[120px] animate-float-delay" />
      </div>

      {/* ─── STICKY NAV ─── */}
      <nav className="sticky top-0 z-50 bg-[#050507]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="btn-ghost px-3 py-2 text-xs font-bold flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="hidden md:flex items-center gap-2 text-zinc-600 text-xs">
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => router.push('/')}>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-semibold">AI Screener</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-indigo-500/[0.08] border border-indigo-500/15 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Live
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 pt-8 pb-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3 mb-2">
            <Eye className="w-7 h-7 md:w-8 md:h-8 text-indigo-400" />
            AI Market Screener
          </h1>
          <p className="text-zinc-500 text-sm font-medium max-w-lg">Tracking the top actionable intelligence moves in the market.</p>
        </motion.div>

        {/* Screener Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Buys */}
            <div>
                <h2 className="text-base font-bold mb-5 flex items-center gap-2.5 text-emerald-400 tracking-tight">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    Top Buying Opportunities
                    <span className="text-[10px] text-zinc-600 font-bold bg-white/[0.04] px-2 py-0.5 rounded-md">{buys.length}</span>
                </h2>
                {buys.length === 0 ? (
                    <div className="glass-card p-8 text-center text-zinc-600 text-sm">No high-conviction buys found.</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {buys.map((st, i) => (
                            <StockCard key={st.ticker} stock={st} type="BUY" index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* Sells */}
            <div>
                <h2 className="text-base font-bold mb-5 flex items-center gap-2.5 text-red-400 tracking-tight">
                    <div className="p-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    Danger / Sell Zones
                    <span className="text-[10px] text-zinc-600 font-bold bg-white/[0.04] px-2 py-0.5 rounded-md">{sells.length}</span>
                </h2>
                {sells.length === 0 ? (
                    <div className="glass-card p-8 text-center text-zinc-600 text-sm">No major sell signals detected.</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {sells.map((st, i) => (
                            <StockCard key={st.ticker} stock={st} type="SELL" index={i} />
                        ))}
                    </div>
                )}
            </div>

        </div>
      </div>
    </main>
  );
}
