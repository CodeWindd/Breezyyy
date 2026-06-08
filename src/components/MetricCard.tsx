import React from "react";
import { motion } from "motion/react";

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  iconSrc: string;
  colorClass: string;
}

export default function MetricCard({ id, title, value, subtitle, iconSrc, colorClass }: MetricCardProps) {
  return (
    <motion.div
      id={id}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Decorative ambient color spot */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl ${colorClass}`} />

      <div className="flex-1 relative z-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <div className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">
          {value}
        </div>
        {subtitle && (
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
            {subtitle}
          </span>
        )}
      </div>

      <div className="relative z-10 flex-shrink-0 bg-slate-50/50 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
        <img
          src={iconSrc}
          alt={title}
          className="w-12 h-12 select-none pointer-events-none drop-shadow-sm"
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  );
}
