import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Compass } from "lucide-react";
import { GeocodeLocation } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { clientFetchGeocode } from "../lib/clientWeather";

interface SearchBoxProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  currentLocationName: string;
}

const QUICK_CITIES = [
  { name: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321 },
  { name: "New York", state: "NY", lat: 40.7128, lon: -74.0060 },
  { name: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194 },
  { name: "Miami", state: "FL", lat: 25.7617, lon: -80.1918 },
  { name: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
];

export default function SearchBox({ onLocationSelect, currentLocationName }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Geocoding Search with a slight debounce inside the effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        let data: GeocodeLocation[] = [];
        try {
          const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error("Local API endpoint returned error code, falling back");
          }
        } catch (apiErr) {
          console.warn("Express geocoding endpoint failed, using direct client-side fallback", apiErr);
          data = await clientFetchGeocode(query);
        }
        setResults(data);
        setIsOpen(true);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to find any matching locations");
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelectResult = (loc: GeocodeLocation) => {
    const displayName = `${loc.name}, ${loc.admin1 || loc.country}`;
    onLocationSelect(loc.latitude, loc.longitude, displayName);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleUseGPS = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const fetchIPFallback = async () => {
      // 1. Try ipapi.co
      try {
        console.log("Attempting ipapi.co fallback...");
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            const locName = data.city && data.region_code
              ? `${data.city}, ${data.region_code}`
              : data.city || "My Current Location";
            onLocationSelect(data.latitude, data.longitude, locName);
            setIsLoading(false);
            return true;
          }
        }
      } catch (err) {
        console.warn("ipapi.co fallback failed:", err);
      }

      // 2. Try ipinfo.io
      try {
        console.log("Attempting ipinfo.io fallback...");
        const response = await fetch("https://ipinfo.io/json");
        if (response.ok) {
          const data = await response.json();
          if (data.loc) {
            const [latStr, lonStr] = data.loc.split(",");
            const latitude = parseFloat(latStr);
            const longitude = parseFloat(lonStr);
            if (!isNaN(latitude) && !isNaN(longitude)) {
              const locName = data.city && data.region
                ? `${data.city}, ${data.region}`
                : data.city || "My Current Location";
              onLocationSelect(latitude, longitude, locName);
              setIsLoading(false);
              return true;
            }
          }
        }
      } catch (err) {
        console.warn("ipinfo.io fallback failed:", err);
      }

      return false;
    };

    if (!navigator.geolocation) {
      const success = await fetchIPFallback();
      if (!success) {
        setErrorMessage("Location services are not available. Please search manually.");
        setIsLoading(false);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect(latitude, longitude, "My Current Location");
        setIsLoading(false);
      },
      async (error) => {
        console.warn("Native GPS failed or blocked. Trying IP geolocation...", error);
        const success = await fetchIPFallback();
        if (!success) {
          setErrorMessage(`Unable to acquire GPS location (${error.message || "denied/blocked"}). Please search manually.`);
          setIsLoading(false);
        }
      },
      { enableHighAccuracy: false, timeout: 4000 }
    );
  };

  return (
    <div id="search-box-container" className="w-full max-w-2xl mx-auto mb-6" ref={containerRef}>
      {/* Input Row */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" id="search-icon-svg" />
          </span>

          <input
            id="weather-search-input"
            type="text"
            className="w-full bg-white/80 focus:bg-white text-slate-800 placeholder-slate-400 pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200/60 shadow-xs focus:shadow-md focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100 transition-all outline-none font-sans text-[15px]"
            placeholder="Search for US cities, zip codes, or international locations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />

          {query && (
            <button
              id="clear-search-btn"
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          id="use-gps-btn"
          type="button"
          onClick={handleUseGPS}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-200/65 bg-white/80 hover:bg-white text-slate-600 hover:text-[#3b82f6] shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 transition-all font-sans font-bold text-xs h-[50px] cursor-pointer"
          title="Use GPS Geolocation"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#3b82f6]" />
          ) : (
            <Compass className="w-5 h-5" />
          )}
          <span className="hidden sm:inline uppercase tracking-wider">GPS</span>
        </button>
      </div>

      {/* Suggestion Dropdown Overlay */}
      <div className="relative">
        <AnimatePresence>
          {isOpen && (results.length > 0 || isLoading || errorMessage) && (
            <motion.div
              id="search-suggestions-dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-80 overflow-y-auto"
            >
              {isLoading && results.length === 0 && (
                <div className="p-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#3b82f6]" />
                  <span>Searching locations...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 text-rose-500 text-sm font-medium border-b border-slate-50">
                  {errorMessage}
                </div>
              )}

              {!isLoading && results.length === 0 && query.trim().length >= 2 && (
                <div className="p-4 text-slate-500 text-sm">
                  No matching locations found for "{query}"
                </div>
              )}

              {results.map((loc) => {
                return (
                  <button
                    id={`search-result-item-${loc.id}`}
                    key={loc.id}
                    type="button"
                    className="w-full px-5 py-3.5 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-b-0 group cursor-pointer"
                    onClick={() => handleSelectResult(loc)}
                  >
                    <div className="bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#3b82f6] p-2 rounded-xl transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-800 font-bold text-sm group-hover:text-[#3b82f6] transition-colors">
                        {loc.name}
                        <span className="text-xs text-slate-400 font-normal ml-1.5 uppercase font-mono">
                          {loc.country_code?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {loc.admin1 || loc.country}
                        {loc.postcodes && loc.postcodes.length > 0 && ` • ZIP: ${loc.postcodes[0]}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Access City Pille board */}
      <div id="quick-cities-pillboard" className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Quick Cities:</span>
        {QUICK_CITIES.map((c) => {
          const isActive = currentLocationName.includes(c.name);
          return (
            <button
              id={`quick-city-btn-${c.name}`}
              key={c.name}
              type="button"
              onClick={() => onLocationSelect(c.lat, c.lon, `${c.name}, ${c.state}`)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-xs"
                  : "bg-white/80 text-slate-600 border-slate-200/60 hover:border-slate-300 hover:bg-white hover:text-slate-900"
              }`}
            >
              {c.name}, {c.state}
            </button>
          );
        })}
      </div>
    </div>
  );
}
