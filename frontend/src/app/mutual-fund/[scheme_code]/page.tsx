"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Wallet, AlertCircle, ChevronRight, TrendingUp, Shield, BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function MutualFundPage() {
  const { scheme_code } = useParams() as { scheme_code: string };
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMF = async () => {
      try {
        const res = await fetch(`/api/mf/${scheme_code}`);
        const payload = await res.json();
        
        if (!res.ok || payload.error) {
          throw new Error(payload.error || "Scheme Code Invalid or Deprecated.");
        }

        setData(payload);
        setLoading(false);
      } catch (err: any) {
        console.error("MF Fetch Error:", err);
        setError(err.message || "Failed to analyze mutual fund history.");
        setLoading(false);
      }
    };
    
    fetchMF();
  }, [scheme_code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050507] text-white flex-col gap-6 px-4">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full"
          />
          <div className="absolute inset-0 rounded-full blur-xl bg-emerald-500/20" />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="text-emerald-400/80 font-semibold tracking-[0.15em] uppercase text-xs text-center"
        >
          Analyzing Fund Trajectory...
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">Intelligence Unavailable</h1>
          <p className="text-zinc-500 max-w-md text-center leading-relaxed text-sm">{error}</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="btn-ghost px-6 py-3 text-xs font-bold tracking-wider uppercase"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const riskColor = data.fundamentals.riskLevel === 'High' 
    ? 'text-red-400 bg-red-500/[0.08] border-red-500/15' 
    : data.fundamentals.riskLevel === 'Low' 
      ? 'text-indigo-400 bg-indigo-500/[0.08] border-indigo-500/15' 
      : 'text-amber-400 bg-amber-500/[0.08] border-amber-500/15';

  return (
    <main className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.05] blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.04] blur-[150px] animate-float-delay" />
      </div>

      {/* ─── STICKY NAV ─── */}
      <nav className="sticky top-0 z-50 bg-[#050507]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="btn-ghost px-3 py-2 text-xs font-bold flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="hidden md:flex items-center gap-2 text-zinc-600 text-xs">
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => router.push('/')}>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-semibold truncate max-w-[200px]">{data.name}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/[0.08] border border-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md">
            Fund Intelligence
          </span>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto relative z-10 px-4 md:px-8 pt-8 pb-8">
        
        {/* ─── HEADER ─── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4 leading-tight max-w-3xl">
              {data.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-[11px] font-semibold rounded-lg">{data.category}</span>
            <span className={`px-3 py-1.5 border text-[11px] font-semibold rounded-lg ${riskColor}`}>
              <Shield className="w-3 h-3 inline mr-1" />Risk: {data.fundamentals.riskLevel}
            </span>
            <span className="px-3 py-1.5 bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400 text-[11px] font-semibold rounded-lg font-[family-name:var(--font-mono)]">
              NAV: ₹{data.fundamentals.nav}
            </span>
            <span className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-[11px] font-semibold rounded-lg font-[family-name:var(--font-mono)]">
              Exp: {data.fundamentals.expenseRatio}%
            </span>
          </div>
        </motion.div>

        {/* ─── MAIN CARD ─── */}
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="glass-card p-5 md:p-8 mb-5">
          <h3 className="text-base font-bold text-white mb-6 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            Fund Performance
          </h3>

          {/* Returns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: '1Y Annualized', value: data.fundamentals.return1Y },
              { label: '3Y Annualized', value: data.fundamentals.return3Y },
              { label: '5Y Annualized', value: data.fundamentals.return5Y },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.04] text-center group hover:border-emerald-500/20 transition-colors">
                <span className="text-[10px] text-zinc-600 uppercase tracking-[0.12em] font-bold block mb-3">{item.label}</span>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className={`font-bold text-3xl md:text-4xl font-[family-name:var(--font-mono)] ${parseFloat(item.value) > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                >
                    {item.value}%
                </motion.div>
                {/* Mini bar */}
                <div className="w-full max-w-[120px] mx-auto h-1.5 bg-white/[0.04] rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(parseFloat(item.value)), 100)}%` }}
                    transition={{ duration: 1.2, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${parseFloat(item.value) > 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Risk Meter */}
          <div className="bg-white/[0.02] p-5 rounded-xl border border-white/[0.04] mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-zinc-600 uppercase tracking-[0.12em] font-bold flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Risk Assessment
              </span>
              <span className={`text-xs font-bold ${data.fundamentals.riskLevel === 'High' ? 'text-red-400' : data.fundamentals.riskLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {data.fundamentals.riskLevel}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden flex gap-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '33.3%' }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className={`h-full rounded-l-full ${data.fundamentals.riskLevel !== 'Low' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400 glow-pulse-green'}`}
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '33.3%' }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className={`h-full ${data.fundamentals.riskLevel === 'Moderate' ? 'bg-gradient-to-r from-amber-600 to-amber-400' : data.fundamentals.riskLevel === 'High' ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-white/[0.06]'}`}
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '33.3%' }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className={`h-full rounded-r-full ${data.fundamentals.riskLevel === 'High' ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-white/[0.06]'}`}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-zinc-600 font-semibold">Low</span>
              <span className="text-[9px] text-zinc-600 font-semibold">Moderate</span>
              <span className="text-[9px] text-zinc-600 font-semibold">High</span>
            </div>
          </div>
        </motion.div>

        {/* ─── RECOMMENDATION ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card bg-gradient-to-r from-emerald-900/15 to-transparent border-emerald-500/10 p-6"
        >
          <h4 className="text-emerald-400/70 font-bold mb-3 uppercase text-[10px] tracking-[0.12em] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Fund Recommendation
          </h4>
          <p className="text-white text-base md:text-lg leading-relaxed font-medium">
              {data.fundamentals.riskLevel === 'High' 
                  ? `This actively managed fund subjects investors to elevated volatility correlated to its high historical returns. Optimal exclusively for aggressive portfolios prioritizing capital appreciation.` 
                  : `This fundamentally sound strategy dictates predictable, smoothed volatility. Favorable as a defensive anchor for traditional long-term holding strategies.`}
          </p>
        </motion.div>

      </div>
    </main>
  );
}
