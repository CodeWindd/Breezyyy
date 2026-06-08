import React, { useState } from "react";
import { DailyForecast } from "../types";
import { Calendar, ChevronDown, ChevronUp, Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DailyForecastCardProps {
  dailyData: DailyForecast[];
  isCelsius: boolean;
}

export default function DailyForecastCard({ dailyData, isCelsius }: DailyForecastCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const convertTemp = (f: number) => {
    if (isCelsius) {
      return Math.round(((f - 32) * 5) / 9);
    }
    return f;
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!dailyData || dailyData.length === 0) {
    return (
      <div id="daily-forecast-empty" className="bg-white/80 rounded-[32px] p-8 text-center text-slate-400 font-sans border border-white">
        No daily forecast available.
      </div>
    );
  }

  // Calculate global min and max temperatures across the 10 days
  const allMaxs = dailyData.map((d) => d.tempMax);
  const allMins = dailyData.map((d) => d.tempMin);
  const absoluteMax = Math.max(...allMaxs);
  const absoluteMin = Math.min(...allMins);
  const absoluteRange = absoluteMax - absoluteMin || 1;

  return (
    <div id="daily-forecast-module" className="bg-white/80 rounded-[32px] p-6 shadow-xl shadow-slate-200/40 border border-white flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
        <div className="bg-[#3b82f6]/10 text-[#3b82f6] p-2 rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">10-Day Forecast</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Extended weather accounts</p>
        </div>
      </div>

      <div id="daily-forecast-list" className="flex-1 flex flex-col gap-1.5 overflow-hidden">
        {dailyData.map((day, index) => {
          const isExpanded = expandedIndex === index;
          const high = convertTemp(day.tempMax);
          const low = convertTemp(day.tempMin);

          // Calculate comparative bar offsets
          const leftPercent = ((day.tempMin - absoluteMin) / absoluteRange) * 100;
          const widthPercent = ((day.tempMax - day.tempMin) / absoluteRange) * 100;

          // Format date beautifully
          const dateObj = new Date(day.date + "T12:00:00");
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const weekdayStr = dateObj.toLocaleDateString("en-US", { weekday: "short" });

          return (
            <div
              id={`daily-forecast-row-${index}`}
              key={index}
              className={`rounded-2xl transition-all duration-200 border ${
                isExpanded
                  ? "border-[#3b82f6] bg-blue-50/50 shadow-xs"
                  : "border-transparent hover:border-slate-100 hover:bg-slate-50/50"
              }`}
            >
              {/* Row Header trigger */}
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="w-full px-3.5 py-3 flex items-center justify-between text-left outline-none cursor-pointer group"
              >
                {/* Day / Date column */}
                <div className="w-20 flex-shrink-0">
                  <div className={`text-sm tracking-tight font-bold ${index === 0 ? "text-slate-800 font-extrabold" : "text-slate-600 font-medium"}`}>
                    {index === 0 ? "Today" : index === 1 ? "Tomorrow" : day.dayName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {formattedDate}
                  </div>
                </div>

                {/* Icon column */}
                <div className="flex-1 flex items-center justify-center pr-2">
                  <img
                    src={day.icon}
                    alt={day.shortForecast}
                    className="w-8 h-8 select-none pointer-events-none drop-shadow-xs group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    title={day.shortForecast}
                  />
                </div>

                {/* Comparative thermal bar on larger sidebar widths, or plain High/Low */}
                <div className="flex items-center gap-2 text-right">
                  <span className="text-sm font-extrabold text-slate-700">
                    {high}°
                  </span>
                  <span className="text-xs font-semibold text-slate-350">
                    {low}°
                  </span>
                  
                  {/* Small Chevron indicator */}
                  <div className="text-slate-400 ml-1.5 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#3b82f6]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 group-hover:text-slate-600" />
                    )}
                  </div>
                </div>
              </button>

              {/* Collapsed Detailed Text Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-3.5 pb-4 pt-1 border-t border-slate-100 flex flex-col gap-3">
                      {/* Day description */}
                      {day.detailedForecastDay && (
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-amber-50 text-amber-500 p-1 rounded-lg mt-0.5 flex-shrink-0">
                            <Sun className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wide block mb-0.5">
                              Daytime Forecast
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">
                              {day.detailedForecastDay}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Night description */}
                      {day.detailedForecastNight && (
                        <div className="flex gap-2.5 items-start">
                          <div className="bg-indigo-50 text-indigo-500 p-1 rounded-lg mt-0.5 flex-shrink-0">
                            <Moon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wide block mb-0.5">
                              Nighttime Forecast
                            </span>
                            <p className="text-xs text-slate-650 leading-relaxed font-sans">
                              {day.detailedForecastNight}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Mini notice */}
                      <div className="text-[9px] text-slate-400 font-medium font-mono leading-relaxed bg-white/50 rounded-lg p-2 border border-slate-100/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#3b82f6] flex-shrink-0" />
                        <span>Conversational reports.</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
