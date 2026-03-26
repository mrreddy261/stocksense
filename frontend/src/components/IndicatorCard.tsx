"use client";

import { motion } from "framer-motion";

export function IndicatorCard({ 
  title, 
  value, 
  subtitle,
  delay = 0,
  icon
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  delay?: number;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden glass-card glass-card-hover p-5 group transition-all duration-300"
    >
      <div className="absolute -top-3 -right-3 bg-white/[0.03] p-5 rounded-full opacity-50 group-hover:bg-indigo-500/[0.08] transition-colors duration-500">
        <div className="w-8 h-8 text-white/30 group-hover:text-indigo-400/50 transition-colors">
            {icon}
        </div>
      </div>
      <h3 className="text-[10px] font-bold text-zinc-600 mb-3 tracking-[0.12em] uppercase relative z-10">{title}</h3>
      <div className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:scale-[1.01] origin-left transition-transform relative z-10 font-[family-name:var(--font-mono)]">{value}</div>
      {subtitle && (
        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold mt-2 relative z-10 border ${
            subtitle.includes('Overbought') ? 'text-red-400 bg-red-500/[0.08] border-red-500/15' :
            subtitle.includes('Oversold') ? 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/15' : 'text-zinc-500 bg-white/[0.03] border-white/[0.06]'
        }`}>
          {subtitle}
        </span>
      )}
    </motion.div>
  );
}
