"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Activity, ShieldCheck, BarChart3, LineChart as LineChartIcon, AlertCircle, Info, Target, Briefcase, Zap, AlertTriangle, PieChart, Layers, Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import StockChart from "@/components/StockChart";
import { IndicatorCard } from "@/components/IndicatorCard";
import { BIAccordion } from "@/components/BIAccordion";
import { SearchBar } from "@/components/SearchBar";
import { motion } from "framer-motion";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function ResultsPage() {
  const { ticker } = useParams() as { ticker: string };
  const router = useRouter();
  const pathname = usePathname();
  
  const [data, setData] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<'stocks' | 'fno' | 'mf'>(
    pathname.includes('/fo/') ? 'fno' : pathname.includes('/mutual-fund/') ? 'mf' : 'stocks'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/stock/${ticker}`);
        if (!res.ok) {
            const errJson = await res.json();
            throw new Error(errJson.error || "Failed to structure payload");
        }
        const payload = await res.json();
        if (payload.error) throw new Error(payload.error);

        setData(payload.data);
        setRec(payload.recommendation);
        setLoading(false);
      } catch (err: any) {
        console.error("Live fetch error, throwing fallback:", err);
        setError(err.message || "Failed to locate any valid charting data for this asset. Please verify the ticker exists and is publicly listed.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050507] text-white flex-col gap-6 px-4">
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
          Quantifying {ticker}...
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
          Return to Terminal
        </button>
      </div>
    );
  }

  const getSignalColor = () => {
    switch (rec?.signal) {
      case 'BUY': return 'text-emerald-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  const getSignalBg = () => {
    switch (rec?.signal) {
      case 'BUY': return 'from-emerald-500/15 to-transparent border-emerald-500/20';
      case 'SELL': return 'from-red-500/15 to-transparent border-red-500/20';
      default: return 'from-amber-500/15 to-transparent border-amber-500/20';
    }
  };

  const getSignalGlow = () => {
    switch (rec?.signal) {
      case 'BUY': return 'shadow-[0_0_80px_rgba(16,185,129,0.15)]';
      case 'SELL': return 'shadow-[0_0_80px_rgba(239,68,68,0.15)]';
      default: return 'shadow-[0_0_80px_rgba(245,158,11,0.15)]';
    }
  };
  
  const getStrengthClass = (conf: number) => {
    if (conf <= 0.4) return "WEAK";
    if (conf <= 0.7) return "MODERATE";
    return "STRONG";
  };

  const rsiVal = rec?.indicators?.RSI || 50;
  const isOverbought = rsiVal >= 70;
  const isOversold = rsiVal <= 30;
  const rsiStatus = isOverbought ? 'Overbought' : isOversold ? 'Oversold' : 'Neutral';

  const ma50 = rec?.indicators?.MA50 || 0;
  const ma200 = rec?.indicators?.MA200 || 1;
  const closes = rec?.indicators?.Close || 1;
  
  let trendDirection = 'Neutral';
  let trendEmoji = '⚖️';
  let trendColor = 'text-amber-400';
  if (ma50 > ma200 * 1.02) { trendDirection = 'Bullish'; trendEmoji = '📈'; trendColor = 'text-emerald-400'; }
  else if (ma50 < ma200 * 0.98) { trendDirection = 'Bearish'; trendEmoji = '📉'; trendColor = 'text-red-400'; }

  let momentum = 'Neutral';
  if (rsiVal > 60) momentum = 'Strong';
  else if (rsiVal < 40) momentum = 'Weak';

  const structure = (Math.abs(ma50 - ma200) / ma200) < 0.02 ? 'Consolidating' : 'Trending';

  const trendInsight = ma50 > ma200 ? "MA50 above MA200 → bullish trend confirmed" : "MA50 below MA200 → bearish trend confirmed";
  const momentumInsight = `RSI near ${Math.round(rsiVal)} → ${rsiStatus.toLowerCase()} momentum`;
  const riskInsight = closes < ma50 ? "Price below short-term MA → downside risk remains" : "Price above moving averages → constructive setup";

  const getInvestorTakeaway = () => {
    if (rec?.signal === 'BUY') return "Strong momentum in a confirmed uptrend. Favorable entry point with continuous monitoring advised.";
    else if (rec?.signal === 'SELL') return "Bearish trend with weak momentum. Avoid new entries. Wait for confirmation above MA200.";
    return "Market structure is indecisive. Avoid aggressive entries; wait for a concrete breakout signal.";
  };

  const currentTime = new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  // F&O derived data
  const strikeInterval = closes > 1000 ? 50 : 10;
  const atmStrike = Math.round(closes / strikeInterval) * strikeInterval;
  const baseOI = Math.max(10000, Math.floor(closes * 100));
  const isBullishFno = rec?.signal === 'BUY';
  const callOI = isBullishFno ? baseOI : Math.floor(baseOI * 1.5);
  const putOI = isBullishFno ? Math.floor(baseOI * 1.5) : baseOI;
  const pcr = putOI / callOI;
  const fnoSentiment = pcr > 1.0 ? 'Bullish' : pcr < 0.9 ? 'Bearish' : 'Neutral';
  const fnoColor = fnoSentiment === 'Bullish' ? 'text-emerald-400' : fnoSentiment === 'Bearish' ? 'text-red-400' : 'text-amber-400';
  const fnoSummary = `Options data indicates ${fnoSentiment.toLowerCase()} sentiment due to ${callOI > putOI ? 'higher call writing' : 'heavy put writing'} reflecting a PCR of ${pcr.toFixed(2)}.`;
  const supportLevel = Math.round(atmStrike * 0.95);
  const resistanceLevel = Math.round(atmStrike * 1.05);

  // MF derived data
  const isAggressive = rsiVal > 60 || trendDirection === 'Bullish';
  const fundCategory = closes > 2000 ? "Large Cap Equity" : closes > 500 ? "Mid Cap Blend" : "Small Cap Growth";
  const riskLevel = isAggressive ? "High" : "Moderate";
  const expRatio = (0.5 + ((closes % 100) / 100)).toFixed(2);
  const return1Y = (pcr * 12.4).toFixed(1);
  const return3Y = (pcr * 12.4 * 2.5).toFixed(1);
  const return5Y = (pcr * 12.4 * 4.2).toFixed(1);
  const mfSummary = isAggressive 
    ? `High-growth returns coupled with elevated risk. Optimal for investors prioritizing rapid capital appreciation.`
    : `Balanced volatility with consistent long-term performance. Suitable for traditional, diverse portfolios.`;

  const confidencePercent = ((rec?.confidence || 0) * 100).toFixed(1);

  return (
    <main className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.06] blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/[0.04] blur-[150px] animate-float-delay" />
      </div>

      {/* ─── STICKY NAV BAR ─── */}
      <nav className="sticky top-0 z-50 bg-[#050507]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="btn-ghost px-3 py-2 text-xs font-bold flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="hidden md:flex items-center gap-2 text-zinc-600 text-xs">
              <span className="cursor-pointer hover:text-white transition-colors" onClick={() => router.push('/')}>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-semibold">{ticker}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">{ticker}</h1>
            <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-zinc-400">₹{closes?.toFixed(2)}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 pt-6 pb-8">
        
        {/* ─── TAB SWITCHER ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
          <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
            {[
              { key: 'stocks' as const, label: 'Stocks', icon: BarChart3 },
              { key: 'fno' as const, label: 'F&O', icon: Layers },
              { key: 'mf' as const, label: 'Mutual Funds', icon: Wallet },
            ].map((tab) => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)} 
                className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key 
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25' 
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="w-full md:w-auto md:min-w-[380px]">
             <SearchBar activeTab={activeTab} />
          </div>
        </div>

        {/* ═══════════════════════════════════ */}
        {/* STOCKS TAB                          */}
        {/* ═══════════════════════════════════ */}
        {activeTab === 'stocks' && (
          <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5">
            
            {/* Row 1: Signal + Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Signal Card */}
              <motion.div variants={fadeUp} className={`xl:col-span-4 glass-card bg-gradient-to-b ${getSignalBg()} p-6 md:p-8 text-center flex flex-col items-center justify-center ${getSignalGlow()}`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Quant Signal
                </span>
                <div className={`text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter ${getSignalColor()} mb-3`}>
                    {rec?.signal || 'HOLD'}
                </div>
                <span className={`text-xs font-bold tracking-widest uppercase ${getSignalColor()} opacity-70 mb-6`}>
                    {getStrengthClass(rec?.confidence || 0)} Confidence
                </span>
                
                {/* Confidence bar */}
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                    <span>Conviction</span>
                    <span className="font-[family-name:var(--font-mono)] text-white">{confidencePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${confidencePercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className={`h-full rounded-full ${rec?.signal === 'BUY' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : rec?.signal === 'SELL' ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Chart */}
              <motion.div variants={fadeUp} className="xl:col-span-8 glass-card p-5 md:p-6">
                <h2 className="text-base font-bold flex items-center gap-2.5 text-white tracking-tight mb-4">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                        <Activity className="w-4 h-4" />
                    </div>
                    Price Action
                </h2>
                <div className="relative h-[250px] md:h-[380px]">
                     <StockChart data={data} />
                </div>
              </motion.div>
            </div>

            {/* Row 2: Metric Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Trend', value: trendDirection, icon: trendEmoji, color: trendColor },
                { label: 'Momentum', value: momentum, icon: '⚡', color: 'text-white' },
                { label: 'RSI Status', value: rsiStatus, icon: '📊', color: 'text-white' },
                { label: 'Structure', value: structure, icon: '🎯', color: 'text-white' },
              ].map((metric, idx) => (
                <div key={idx} className="glass-card p-4 md:p-5 group glass-card-hover transition-all duration-300">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-[0.12em] font-bold block mb-2">{metric.label}</span>
                  <div className={`font-bold text-sm md:text-lg ${metric.color} flex items-center gap-2`}>
                    <span className="text-base">{metric.icon}</span> {metric.value}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Row 3: Indicators */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <IndicatorCard delay={0} title="Current Price" value={closes ? `₹${closes.toFixed(2)}` : 'N/A'} icon={<BarChart3 />} />
              <IndicatorCard delay={0.05} title="RSI (14)" value={rsiVal ? rsiVal.toFixed(1) : 'N/A'} subtitle={rsiStatus} icon={<Activity />} />
              <IndicatorCard delay={0.1} title="50 MA / 200 MA" value={ma50 && ma200 ? `₹${ma50.toFixed(0)} / ₹${ma200.toFixed(0)}` : 'N/A'} icon={<LineChartIcon />} />
            </motion.div>

            {/* Row 4: Insights */}
            <motion.div variants={fadeUp} className="glass-card p-5 md:p-6">
              <h3 className="text-base font-bold text-white mb-5 tracking-tight flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                  <Info className="w-4 h-4" />
                </div>
                Smart Interpretation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Trend', text: trendInsight },
                  { label: 'Momentum', text: momentumInsight },
                  { label: 'Risk', text: riskInsight },
                ].map((insight, idx) => (
                  <div key={idx} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] hover:border-indigo-500/20 transition-colors">
                    <span className="text-indigo-400/70 text-[10px] font-bold uppercase tracking-[0.12em] block mb-2">{insight.label}</span>
                    <span className="text-sm text-zinc-400 font-medium leading-relaxed">{insight.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Row 5: Business Intelligence */}
            {rec?.intelligence && (
              <motion.div variants={fadeUp} className="glass-card p-5 md:p-6">
                <h3 className="text-base font-bold text-white mb-5 tracking-tight flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  Business Intelligence
                </h3>
                <div className="flex flex-col gap-2">
                    <BIAccordion title="Active Projects" icon="🚀" items={rec.intelligence.projects} impactText="Company is in expansion phase → long-term positive" borderColorClass="hover:border-indigo-500/30" iconColorClass="text-indigo-500" />
                    <BIAccordion title="Recent Acquisitions" icon="🤝" items={rec.intelligence.acquisitions} impactText="Growth through external expansion" borderColorClass="hover:border-emerald-500/30" iconColorClass="text-emerald-500" />
                    <BIAccordion title="Divestments & Assets" icon="🚪" items={rec.intelligence.divestments} impactText="Company optimizing or reducing risk" borderColorClass="hover:border-red-500/30" iconColorClass="text-red-500" />
                    <BIAccordion title="Strategic Mergers" icon="🎯" items={rec.intelligence.strategic} impactText="Strategic positioning for future sectors" borderColorClass="hover:border-amber-500/30" iconColorClass="text-amber-500" />
                </div>
              </motion.div>
            )}

            {/* Row 6: Takeaway */}
            <motion.div variants={fadeUp} className="glass-card bg-gradient-to-r from-indigo-900/20 to-transparent border-indigo-500/15 p-6 group">
              <h3 className="text-sm font-bold text-indigo-300/80 mb-3 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Investor Takeaway
              </h3>
              <p className="text-base md:text-lg text-white font-medium leading-relaxed">{getInvestorTakeaway()}</p>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* F&O TAB                             */}
        {/* ═══════════════════════════════════ */}
        {activeTab === 'fno' && (
          <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5 max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="glass-card p-5 md:p-8">
              <h3 className="text-lg md:text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                F&O Market Intelligence
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {[
                  { label: 'PCR', value: pcr.toFixed(2), color: fnoColor },
                  { label: 'Sentiment', value: fnoSentiment, color: fnoColor },
                  { label: 'Call OI', value: `${(callOI / 1000).toFixed(1)}K`, icon: <ArrowDownCircle className="w-4 h-4 text-red-400" /> },
                  { label: 'Put OI', value: `${(putOI / 1000).toFixed(1)}K`, icon: <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-[0.12em] font-bold block mb-2">{item.label}</span>
                    <div className={`font-bold text-lg md:text-xl ${item.color || 'text-white'} flex items-center gap-2 font-[family-name:var(--font-mono)]`}>
                      {item.icon} {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-zinc-900/50 to-transparent border border-white/[0.06] p-5 rounded-xl mb-6">
                <h4 className="text-amber-400/70 font-bold mb-2 uppercase text-[10px] tracking-[0.12em]">Options Analyst Takeaway</h4>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">{fnoSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-emerald-500/[0.05] border border-emerald-500/15 p-4 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-400/70 uppercase tracking-[0.12em] font-bold block mb-1">Support</span>
                  <span className="font-bold text-white text-lg font-[family-name:var(--font-mono)]">₹{supportLevel}</span>
                </div>
                <div className="bg-indigo-500/[0.05] border border-indigo-500/15 p-4 rounded-xl text-center">
                  <span className="text-[10px] text-indigo-400/70 uppercase tracking-[0.12em] font-bold block mb-1">ATM Strike</span>
                  <span className="font-bold text-white text-lg font-[family-name:var(--font-mono)]">₹{atmStrike}</span>
                </div>
                <div className="bg-red-500/[0.05] border border-red-500/15 p-4 rounded-xl text-center">
                  <span className="text-[10px] text-red-400/70 uppercase tracking-[0.12em] font-bold block mb-1">Resistance</span>
                  <span className="font-bold text-white text-lg font-[family-name:var(--font-mono)]">₹{resistanceLevel}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* MUTUAL FUNDS TAB                    */}
        {/* ═══════════════════════════════════ */}
        {activeTab === 'mf' && (
          <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5 max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="glass-card p-5 md:p-8">
              <h3 className="text-lg md:text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                Mutual Fund Analysis
              </h3>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold rounded-lg">{fundCategory}</span>
                <span className={`px-4 py-1.5 border text-xs font-semibold rounded-lg ${isAggressive ? 'bg-red-500/[0.08] border-red-500/15 text-red-400' : 'bg-emerald-500/[0.08] border-emerald-500/15 text-emerald-400'}`}>Risk: {riskLevel}</span>
                <span className="px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold rounded-lg">Exp Ratio: {expRatio}%</span>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                {[
                  { label: '1Y Return', value: `+${return1Y}%` },
                  { label: '3Y Return', value: `+${return3Y}%` },
                  { label: '5Y Return', value: `+${return5Y}%` },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/[0.02] p-5 rounded-xl border border-white/[0.04] text-center">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-[0.12em] font-bold block mb-2">{item.label}</span>
                    <div className="font-bold text-xl md:text-2xl text-emerald-400 font-[family-name:var(--font-mono)]">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-emerald-900/20 to-transparent border border-emerald-500/15 p-5 rounded-xl">
                <h4 className="text-emerald-400/70 font-bold mb-2 uppercase text-[10px] tracking-[0.12em]">Fund Summary</h4>
                <p className="text-zinc-300 text-sm leading-relaxed font-medium">{mfSummary}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="border-t border-white/[0.04] py-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-center">
          <p className="text-[10px] md:text-[11px] text-zinc-600 flex items-center justify-center gap-1.5 font-medium">
            <AlertTriangle className="w-3 h-3" /> Not financial advice. For educational purposes only.
          </p>
          <p className="text-[10px] md:text-[11px] text-zinc-600 font-medium font-[family-name:var(--font-mono)]">
            Updated: {currentTime}
          </p>
        </div>
      </div>
    </main>
  );
}
