"use client";

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-[#0c0c10]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] px-4 py-3 min-w-[180px]">
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.12em] mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => {
        const name = entry.name === 'Close' ? 'Price' : entry.name === 'MA50' ? 'MA50' : entry.name === 'MA200' ? 'MA200' : entry.name;
        return (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-zinc-400 font-medium">{name}</span>
            </div>
            <span className="text-xs text-white font-bold font-[family-name:var(--font-mono)]">₹{Number(entry.value).toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function StockChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return (
    <div className="p-8 text-center text-zinc-600 glass-card w-full text-sm font-medium">
      No data available to chart.
    </div>
  );

  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      dateFormatted: new Date(d.Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }))
  }, [data])

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25}/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMA50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.08}/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="#3f3f46" 
            fontSize={11}
            fontFamily="var(--font-inter)"
            tickLine={false}
            axisLine={false}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            stroke="#3f3f46" 
            fontSize={11}
            fontFamily="var(--font-mono)"
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: '#71717a', paddingBottom: '8px' }}
          />
          <Area 
            type="monotone" 
            dataKey="Close" 
            name="Price"
            stroke="#6366f1" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorClose)" 
            activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
          />
          {data[0]?.MA50 !== undefined && (
             <Area 
              type="monotone" 
              dataKey="MA50" 
              name="MA50"
              stroke="#f59e0b" 
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorMA50)"
              dot={false}
            />
          )}
          {data[0]?.MA200 !== undefined && (
             <Line 
              type="monotone" 
              dataKey="MA200" 
              name="MA200"
              stroke="#ef4444" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
