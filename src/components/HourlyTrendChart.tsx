import React, { useRef } from "react";
import { HourlyForecast } from "../types";
import { ChevronLeft, ChevronRight, Umbrella, Wind, Clock } from "lucide-react";
import { motion } from "motion/react";

interface HourlyTrendChartProps {
  hourlyData: HourlyForecast[];
  isCelsius: boolean;
  timezone?: string;
}

export default function HourlyTrendChart({ hourlyData, isCelsius, timezone }: HourlyTrendChartProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const convertTemp = (f: number) => {
    if (isCelsius) {
      return Math.round(((f - 32) * 5) / 9);
    }
    return f;
  };

  const getWeekday = (timeStr: string) => {
    try {
      const datePart = timeStr.split("T")[0];
      const [year, month, day] = datePart.split("-").map(Number);
      const d = new Date(year, month - 1, day, 12, 0, 0);
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } catch {
      return "";
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div id="hourly-trend-empty" className="bg-white/80 rounded-[32px] p-8 text-center text-slate-400 font-sans border border-white">
        No hourly data available
      </div>
    );
  }

  // Calculate temperature min and max helper to draw beautiful relative scale offsets
  const temps = hourlyData.map((h) => h.temperature);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div id="hourly-forecast-module" className="bg-white/80 rounded-[32px] p-6 shadow-xl shadow-slate-200/40 relative border border-white">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-[#3b82f6]/10 text-[#3b82f6] p-2.5 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-455 uppercase tracking-widest leading-tight">Hourly Forecast</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">72-Hour Trends & Conditions</p>
          </div>
        </div>

        {/* Scroll Control Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            id="scroll-hourly-left-btn"
            type="button"
            onClick={() => scroll("left")}
            className="p-2 rounded-xl border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white active:scale-95 transition-all shadow-xs"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="scroll-hourly-right-btn"
            type="button"
            onClick={() => scroll("right")}
            className="p-2 rounded-xl border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800 bg-white/80 hover:bg-white active:scale-95 transition-all shadow-xs"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hourly Strips Scroll Panel */}
      <div
        id="hourly-strips-scroll-container"
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-thin select-none snap-x"
        style={{ scrollSnapType: "x proximity" }}
      >
        {hourlyData.map((item, index) => {
          const displayTemp = convertTemp(item.temperature);
          // Calculate relative percentage height for visual pills (keeps elements bounded nicely)
          const relativeHeightPercent = 20 + ((item.temperature - minTemp) / tempRange) * 55;

          return (
            <motion.div
              id={`hourly-item-card-${index}`}
              key={index}
              className="flex-shrink-0 w-[96px] bg-slate-50/40 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-between gap-3 snap-start transition-all relative group"
            >
              {/* Timing */}
              <div className="text-center w-full">
                <span className="text-xs font-bold text-slate-800 block truncate leading-none">
                  {item.hourFormatted}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                  {getWeekday(item.time)}
                </span>
              </div>

              {/* Icon */}
              <img
                src={item.icon}
                alt={item.shortForecast}
                className="w-12 h-12 select-none pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
                title={item.shortForecast}
              />

              {/* Rain Probability Indicator */}
              <div className="flex items-center gap-0.5 justify-center h-4">
                {item.precipitationProbability > 0 ? (
                  <div className="flex items-center gap-0.5 bg-blue-50/50 px-1.5 py-0.5 rounded-md">
                    <Umbrella className="w-2.5 h-2.5 text-[#3b82f6]" />
                    <span className="text-[9px] font-extrabold text-[#3b82f6]">
                      {item.precipitationProbability}%
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-300">-</span>
                )}
              </div>

              {/* Visual Temperature Pillar */}
              <div className="w-full h-8 flex items-end justify-center px-2">
                <div
                  className="w-1.5 rounded-full bg-linear-to-t from-[#3b82f6] to-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ height: `${relativeHeightPercent}%` }}
                />
              </div>

              {/* Temp degrees */}
              <div className="text-center w-full">
                <span className="text-sm font-extrabold text-slate-800 tracking-tight block">
                  {displayTemp}°
                </span>
                <span className="text-[9px] text-slate-400 font-bold max-w-full truncate block mt-0.5" title={item.shortForecast}>
                  {item.shortForecast}
                </span>
              </div>

              {/* Wind mini details */}
              <div className="flex items-center gap-0.5 text-slate-400 text-[9px] font-semibold mt-0.5 opacity-85">
                <Wind className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="truncate max-w-[50px]">{item.windSpeed.replace(" mph", "")}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
