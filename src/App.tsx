import React, { useState, useEffect } from "react";
import { WeatherPayload, WeatherAlert } from "./types";
import { clientFetchWeather } from "./lib/clientWeather";
import SearchBox from "./components/SearchBox";
import HourlyTrendChart from "./components/HourlyTrendChart";
import DailyForecastCard from "./components/DailyForecastCard";
import {
  Wind,
  RefreshCw,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  BellOff,
  X,
  CheckCircle,
  Download,
  CloudLightning,
  CloudRain,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PRESET_ALERT_TEMPLATES = [
  {
    event: "Tornado Warning",
    severity: "Extreme",
    urgency: "Immediate",
    headline: "PREVENTATIVE LIFELINE ACTION: NWS TORNADO WARNING ISSUED",
    description: "The NWS Storm Prediction Center (SPC) has detected high boundary rotation and a confirmed or highly probable tornado on dual-polarization meteorology radar.",
    instruction: "TAKE COVER IMMEDIATELY! Move to an interior room on the lowest level of a sturdy building (such as a basement or storm cellar). Shield your body. Avoid windows.",
    areaDesc: "Severe Convective Boundary Layer",
    senderName: "NWS Storm Prediction Center (Norman, OK)",
  },
  {
    event: "Tornado Watch",
    severity: "Severe",
    urgency: "Immediate",
    headline: "NWS SPC OUTLOOK: TORNADO WATCH FORMING",
    description: "Environmental thermodynamic indices are highly supportive of intense supercell thunderstorms capable of producing destructive wind shear, large hail, and tornadoes.",
    instruction: "Monitor meteorological radar feeds closely. Formulate an evacuation route to safety and keep primary communications devices fully charged.",
    areaDesc: "Multi-county convective watch zone",
    senderName: "NWS Storm Prediction Center (Norman, OK)",
  },
  {
    event: "Severe Thunderstorm Warning",
    severity: "Severe",
    urgency: "Immediate",
    headline: "LOCAL IMPACT WARNING: SEVERE THUNDERSTORM DETECTED",
    description: "Radar analysis indicates wind velocities exceeding 68 knots (approx 78 mph) along a fast-moving bow echo, with half-dollar size hail stones expected.",
    instruction: "Seek indoor shelter immediately. Stay clear of utility lines and elevated outer walls. Secure any lightweight outdoor equipment.",
    areaDesc: "Convective gust-front trajectory grid",
    senderName: "NOAA NWS local radar unit",
  },
  {
    event: "Severe Thunderstorm Watch",
    severity: "Moderate",
    urgency: "Expected",
    headline: "NWS REGIONAL WATCH OUTLOOK: SEVERE THUNDERSTORMS POTENTIAL",
    description: "Convective microclimates with rapid warm-air lofting are expected to trigger highly organized severe thunderstorm clusters over the next several hours.",
    instruction: "Confirm battery levels on local alert electronics and secure loose materials around facilities.",
    areaDesc: "Regional tri-state weather grid",
    senderName: "NWS Storm Prediction Center (Norman, OK)",
  },
  {
    event: "Flash Flood Warning",
    severity: "Extreme",
    urgency: "Immediate",
    headline: "HYDROLOGICAL EMERGENCY: FLASH FLOOD WARNING ISSUED",
    description: "A rapid convective cell has unloaded heavy precipitation averaging 2.45 inches per hour onto fully saturated clay soils, inducing quick-rising sheet flows.",
    instruction: "TURN AROUND, DON'T DROWN! Never drive or wade through water-logged streets or culverts. Seek immediate higher elevation.",
    areaDesc: "Low-lying basins, concrete roadways, and creek systems",
    senderName: "NOAA NWS Hydrological Division",
  },
  {
    event: "Flash Flood Watch",
    severity: "Severe",
    urgency: "Expected",
    headline: "FLOOD ADVISORY FEED: POTENTIAL FLASH FLOOD CONSTRAINTS",
    description: "Deep moisture plumes and low atmospheric tracking speeds indicate imminent potential for excessive rain runoff in local geographic sectors.",
    instruction: "Prepare to clear flood-vulnerable areas, and avoid low bridges or subterranean level structures.",
    areaDesc: "Urban transport arteries and mountain channels",
    senderName: "NOAA NWS Hydrological Division",
  },
  {
    event: "Blizzard Warning",
    severity: "Extreme",
    urgency: "Immediate",
    headline: "EXTREME WINTER EMERGENCY: BLIZZARD WARNING ACTIVE",
    description: "Sustained winds or frequent gusts of 35 mph or greater paired with significant falling or blowing snow will reduce visibility to under 1/4 mile for over 3 hours.",
    instruction: "DO NOT TRAVEL! Visually blinding and life-threatening whiteout conditions are real. If stranded, stay inside your vehicle to conserve heat.",
    areaDesc: "High mountain passes and flat transport routes",
    senderName: "NWS Winter Storm Advisory Team",
  },
  {
    event: "Winter Storm Warning",
    severity: "Severe",
    urgency: "Immediate",
    headline: "METEOROLOGICAL WINTER WARNING: INTENSE FREEZING SYSTEM",
    description: "Deep cyclonic moisture is translating to heavy localized snow accumulations between 8 and 14 inches, drastically reducing surface friction.",
    instruction: "Avoid non-essential transit. Keep an emergency thermal blanket, flares, and food rations in your vehicle's storage compartment.",
    areaDesc: "Regional mountain slopes and metro grids",
    senderName: "NWS Winter Storm Advisory Team",
  },
  {
    event: "Ice Storm Warning",
    severity: "Extreme",
    urgency: "Immediate",
    headline: "STRUCTURAL HAZARD THREAT: ICE STORM WARNING ISSUED",
    description: "Cold surface air trapped beneath warm lofts has produced freezing rain resulting in over 0.25 inches of structural ice glazing.",
    instruction: "Expect widespread grid power outages due to downed tree limbs and snapped utility poles. Avoid all driving due to black ice hazards.",
    areaDesc: "Regional electrical grid and power lines sectors",
    senderName: "NOAA NWS Northeast Blizzard Division",
  },
  {
    event: "High Wind Warning",
    severity: "Severe",
    urgency: "Immediate",
    headline: "DANGEROUS ATMOSPHERIC WINDS: HIGH WIND WARNING ACTIVE",
    description: "A deep pressure gradient is generating structural wind-load velocities of 40 to 60 mph, with potential for damage to rooftops and fences.",
    instruction: "Avoid wooded areas to protect from falling branches. Anchor loose decking items and park vehicles away from large trees.",
    areaDesc: "Open coastal boundaries and exposed fields",
    senderName: "NWS Surface Front Analysis Unit",
  },
  {
    event: "Red Flag Warning",
    severity: "Severe",
    urgency: "Immediate",
    headline: "CRITICAL FIRE DANGER: WILDLAND RED FLAG WARNING",
    description: "The combination of relative humidity levels under 15% and wind gusts exceeding 25 mph creates high-friction wildfire combustion risks.",
    instruction: "Avoid all outdoor combustion, campfires, or hot-tool operations. Safely dispose of dry organic materials.",
    areaDesc: "Forest fields, brush zones, and rural lines",
    senderName: "NWS Forestry & Climate Response",
  },
  {
    event: "Excessive Heat Warning",
    severity: "Extreme",
    urgency: "Expected",
    headline: "HEALTH SECURITY EMERGENCY: EXCESSIVE HEAT WARNING ISSUED",
    description: "A persistent high-pressure heat dome will drive afternoon heat indices up to a dangerous 114°F (approx 45°C) with negligible nighttime cooling.",
    instruction: "Stay inside air-conditioned rooms. Drink abundant fluids, limit strenuous outdoor exposure, and check on elderly neighbors.",
    areaDesc: "Suburban concrete centers and city layouts",
    senderName: "NWS Meteorological Heat Index Advisory",
  },
  {
    event: "Hurricane Warning",
    severity: "Extreme",
    urgency: "Immediate",
    headline: "COASTAL EMERGENCY: HURRICANE WARNING DEPLOYED",
    description: "A category-scale tropical cyclonic structure is making landfall, with sustained catastrophic winds exceeding 115 mph and storm surges of 8 to 12 feet.",
    instruction: "EVACUATE IMMEDIATELY if ordered to do so. Complete all structural storm preparation and stock fresh potable water.",
    areaDesc: "Low coastal zones, marinas, and residential structures",
    senderName: "NOAA National Hurricane Center (Miami, FL)",
  },
  {
    event: "Special Marine Warning",
    severity: "Moderate",
    urgency: "Immediate",
    headline: "OFFSHORE HAZARD REPORT: SPECIAL MARINE WARNING",
    description: "Coastal Doppler sensors highlight a fast-propagating marine microburst capable of producing steep water waves and water-spout rotation.",
    instruction: "Boaters and vessel operators should find shelter in a protected harbor immediately. Secure loose deck hardware.",
    areaDesc: "Coastal waters and outer harbors",
    senderName: "NWS Marine Meteorological Division",
  },
  {
    event: "Lightning Strike Warning",
    severity: "Severe",
    urgency: "Immediate",
    headline: "ELECTROSTATIC DISCHARGE ALERT: IMMEDIATE THREAT",
    description: "Localized atmospheric lightning discharge frequencies exceed 45 strokes per minute, striking near populated residential structures.",
    instruction: "When thunder roars, go indoors! Disconnect delicate desktop electronic equipment and avoid contact with plumbing water pipes.",
    areaDesc: "Local electric grid quadrant",
    senderName: "Breezy Lightning Detection Network",
  },
  {
    event: "Heavy Rain Advisory",
    severity: "Minor",
    urgency: "Expected",
    headline: "HYDROLOGICAL COMFORT ADVISORY: HEAVY RAIN EXPECTED",
    description: "Sustained sub-severe shower clusters will deposit 0.75 inches of pool rain. Expect minor roadway ponding and reduced vehicle visual visibility.",
    instruction: "Maintain safe driving braking distances. Carry rain accessories and umbrellas if walking outdoors.",
    areaDesc: "Urban transport grid",
    senderName: "NWS Hydrological Response Team",
  }
];

export default function App() {
  const [lat, setLat] = useState(() => {
    try {
      const saved = localStorage.getItem("breezy_saved_lat");
      const parsed = saved ? parseFloat(saved) : 47.6062;
      return isNaN(parsed) ? 47.6062 : parsed;
    } catch {
      return 47.6062;
    }
  });
  const [lon, setLon] = useState(() => {
    try {
      const saved = localStorage.getItem("breezy_saved_lon");
      const parsed = saved ? parseFloat(saved) : -122.3321;
      return isNaN(parsed) ? -122.3321 : parsed;
    } catch {
      return -122.3321;
    }
  });
  const [locationName, setLocationName] = useState(() => {
    try {
      const saved = localStorage.getItem("breezy_saved_name");
      return (saved && saved !== "International / Fallback Location") ? saved : "Seattle, WA";
    } catch {
      return "Seattle, WA";
    }
  });
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCelsius, setIsCelsius] = useState(false);
  const [time, setTime] = useState(new Date());

  // Severe Alert states
  const [simulatedAlerts, setSimulatedAlerts] = useState<WeatherAlert[]>([]);
  const [activeToast, setActiveToast] = useState<WeatherAlert | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<"default" | "granted" | "denied">("default");
  const [notifiedAlertIds, setNotifiedAlertIds] = useState<Set<string>>(new Set());

  // Search & filter states for NWS / SPC suites
  const [alertFilterQuery, setAlertFilterQuery] = useState("");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<"All" | "Extreme" | "Severe" | "Moderate" | "Minor">("All");
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<"All" | "NWS" | "SPC">("All");

  // Dynamic ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync native notification status safely with full virtualization inside iframes
  useEffect(() => {
    try {
      const insideIframe = typeof window !== "undefined" && window.self !== window.top;
      if (!insideIframe && typeof window !== "undefined" && "Notification" in window) {
        setNotificationStatus(Notification.permission);
      } else {
        // Start as default, allowing user to explicitly click "Request Permission"
        setNotificationStatus("default");
      }
    } catch (e) {
      console.warn("Could not read Notification permission inside iframe sandbox:", e);
      setNotificationStatus("default");
    }
  }, []);

  // Fetch unified weather payload from our server endpoint
  const fetchWeather = async (latitude: number, longitude: number, name?: string) => {
    setIsLoading(true);
    setError("");
    try {
      if (name && name !== "International / Fallback Location") {
        setLocationName(name);
      }
      let data: WeatherPayload;
      try {
        const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to retrieve forecast data from weather services.");
        }
        data = await res.json();
      } catch (apiErr) {
        console.warn("Express weather endpoint failed, using direct client-side fallback", apiErr);
        data = await clientFetchWeather(latitude, longitude, name || locationName);
      }
      setWeather(data);
      if (data.location.name && data.location.name !== "International / Fallback Location" && (!name || name === "My Current Location")) {
        setLocationName(data.location.name);
        try {
          localStorage.setItem("breezy_saved_lat", String(latitude));
          localStorage.setItem("breezy_saved_lon", String(longitude));
          localStorage.setItem("breezy_saved_name", data.location.name);
        } catch {}
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while fetching the weather forecast.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger when coordinates change
  useEffect(() => {
    // Clear simulated alerts on relocation to keep dashboard accurate
    setSimulatedAlerts([]);
    setActiveToast(null);
    fetchWeather(lat, lon, locationName);
  }, [lat, lon]);

  // Handle automatic dispatch of notifications when backend payload returns active real storm warnings
  useEffect(() => {
    if (weather && weather.alerts && weather.alerts.length > 0) {
      const freshAlert = weather.alerts.find(a => !notifiedAlertIds.has(a.id));
      if (freshAlert) {
        setNotifiedAlertIds(prev => {
          const next = new Set(prev);
          next.add(freshAlert.id);
          return next;
        });
        triggerNotification(freshAlert);
      }
    }
  }, [weather]);

  const handleLocationSelect = (newLat: number, newLon: number, name: string) => {
    if (isNaN(newLat) || isNaN(newLon)) return;
    setLat(newLat);
    setLon(newLon);
    const sanitizedName = name === "International / Fallback Location" ? "My Current Location" : name;
    setLocationName(sanitizedName);
    try {
      localStorage.setItem("breezy_saved_lat", String(newLat));
      localStorage.setItem("breezy_saved_lon", String(newLon));
      localStorage.setItem("breezy_saved_name", sanitizedName);
    } catch (e) {
      console.warn("Could not auto-save location to localStorage:", e);
    }
  };

  const handleRefresh = () => {
    fetchWeather(lat, lon, locationName);
  };

  // Convert Fahrenheit helper
  const convertTemp = (f: number) => {
    if (isCelsius) {
      return Math.round(((f - 32) * 5) / 9);
    }
    return f;
  };

  // Browser system push notifications requester with virtual iframe sandboxing
  const requestPermission = async () => {
    const insideIframe = typeof window !== "undefined" && window.self !== window.top;
    
    if (insideIframe) {
      setNotificationStatus("granted");
      return;
    }

    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission);
        if (permission === "granted") {
          try {
            new Notification("Breezy Severe Alerts Primed", {
              body: "You will now receive high-friction warnings and lightning reports on your device screen!",
              icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-day.svg",
            });
          } catch (e) {
            console.warn("Unable to create new Notification inside this context:", e);
          }
        }
      } else {
        setNotificationStatus("granted");
      }
    } catch (err) {
      console.warn("Notification permission API blocked inside this sandbox browser context:", err);
      setNotificationStatus("granted"); // Fall back to working virtual modes
    }
  };

  // Core notifier dispatcher
  const triggerNotification = (alert: WeatherAlert) => {
    // 1. Dispatch custom fluid interactive in-app Toast
    setActiveToast(alert);
    setTimeout(() => {
      setActiveToast((prev) => (prev?.id === alert.id ? null : prev));
    }, 9000);

    // 2. Dispatch real OS background notification if permitted and NOT inside an iframe sandbox
    const insideIframe = typeof window !== "undefined" && window.self !== window.top;
    if (
      !insideIframe &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      notificationStatus === "granted"
    ) {
      try {
        const iconUrl = alert.event.toLowerCase().includes("lightning")
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-day-rain.svg"
          : alert.event.toLowerCase().includes("rain") || alert.event.toLowerCase().includes("flood")
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg"
          : alert.event.toLowerCase().includes("tornado")
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/tornado.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/gales.svg";

        new Notification(`BREEZY WARNING: ${alert.event}`, {
          body: `${alert.headline || alert.description}\nSeverity: ${alert.severity}`,
          icon: iconUrl,
          tag: alert.id,
          requireInteraction: alert.severity === "Extreme" || alert.severity === "Severe",
        });
      } catch (err) {
        console.warn("Native push warning trigger failed:", err);
      }
    }
  };

  // Simulator orchestrator
  const simulateAlert = (templateIndex: number) => {
    const template = PRESET_ALERT_TEMPLATES[templateIndex];
    const newAlert: WeatherAlert = {
      id: "sim-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      event: template.event,
      severity: template.severity,
      urgency: template.urgency,
      headline: template.headline,
      description: template.description,
      instruction: template.instruction,
      areaDesc: template.areaDesc,
      senderName: template.senderName,
      effective: new Date().toISOString(),
      ends: new Date(Date.now() + 7200000).toISOString(), // 2 hours
    };

    setSimulatedAlerts((prev) => [newAlert, ...prev]);
    triggerNotification(newAlert);
  };

  const clearSimulatedAlerts = () => {
    setSimulatedAlerts([]);
    setActiveToast(null);
  };

  // Merge simulated warnings with live real NWS warnings
  const allAlerts = [...simulatedAlerts, ...(weather?.alerts || [])];

  // Filter templates list based on search filters
  const filteredTemplates = PRESET_ALERT_TEMPLATES.map((item, idx) => ({
    ...item,
    originalIdx: idx,
  })).filter((item) => {
    const matchesSearch =
      item.event.toLowerCase().includes(alertFilterQuery.toLowerCase()) ||
      item.headline.toLowerCase().includes(alertFilterQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(alertFilterQuery.toLowerCase());
    const matchesSeverity =
      selectedSeverityFilter === "All" || item.severity === selectedSeverityFilter;
    const isSpc =
      item.event.toLowerCase().includes("watch") ||
      item.senderName.toLowerCase().includes("spc") ||
      item.senderName.toLowerCase().includes("prediction");
    const matchesAgency =
      selectedAgencyFilter === "All" ||
      (selectedAgencyFilter === "SPC" && isSpc) ||
      (selectedAgencyFilter === "NWS" && !isSpc);
    return matchesSearch && matchesSeverity && matchesAgency;
  });

  // Dynamic soft gradient overlays based on conditions
  const getAmbientHighlight = () => {
    if (allAlerts.some((a) => a.severity === "Extreme")) {
      return "from-rose-500/10 via-rose-500/0 text-red-500 text-opacity-10 pointer-events-none";
    }
    if (!weather) return "from-slate-100/40 via-blue-100/5 to-transparent";
    const desc = weather.current.shortForecast.toLowerCase();
    
    if (desc.includes("thunderstorm") || desc.includes("severe")) {
      return "from-slate-300/30 via-slate-400/5 to-transparent";
    }
    if (desc.includes("rain") || desc.includes("shower") || desc.includes("drizzle") || desc.includes("sleet")) {
      return "from-[#3b82f6]/10 via-slate-100/5 to-transparent";
    }
    if (desc.includes("snow") || desc.includes("blizzard") || desc.includes("flurries")) {
      return "from-sky-100/30 via-slate-100/5 to-transparent";
    }
    if (desc.includes("cloud") || desc.includes("overcast") || desc.includes("fog") || desc.includes("mist")) {
      return "from-slate-200/30 via-slate-300/5 to-transparent";
    }
    return "from-amber-100/30 via-amber-50/5 to-transparent";
  };

  const ambientHighlight = getAmbientHighlight();

  // Clock dynamic strings
  const formattedDateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: weather?.location?.timezone || undefined,
  });
  const formattedTimeStr = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: weather?.location?.timezone || undefined,
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 transition-all duration-700 ease-in-out font-sans pb-24 antialiased relative overflow-hidden">
      
      {/* Soft ambient natural lighting focus spot at the top center */}
      <div className={`absolute top-0 inset-x-0 h-[380px] bg-linear-to-b ${ambientHighlight} pointer-events-none transition-all duration-1000`} />

      {/* Brand Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 mb-6 font-sans">
        <div className="flex items-center gap-3">
          <div className="bg-[#3b82f6] p-2.5 rounded-2xl flex items-center justify-center shadow-lg shadow-[#3b82f6]/25">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              Breezy
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block -mt-1 font-mono">
              Natural Tones & PWA
            </span>
          </div>
        </div>

        {/* Current location displaying with alert count badge if active */}
        {weather && (
          <div className="flex items-center gap-3 bg-white/80 border border-white rounded-2xl px-4 py-2 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#3b82f6] animate-bounce" />
            <span className="text-xs font-bold text-slate-700">{locationName}</span>
            {allAlerts.length > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>
        )}

        {/* Live Date, Time ticking clock, Units and Refresh triggers */}
        <div className="flex items-center justify-between md:justify-end gap-6">
          <div className="text-left md:text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formattedDateStr}</p>
            <p className="text-lg font-black text-slate-700 font-mono mt-0.5">{formattedTimeStr}</p>
          </div>
          
          <div className="flex items-center gap-2 font-sans">
            {/* Fahrenheit and Celsius selector toggles */}
            <div className="flex items-center rounded-xl bg-white/80 p-0.5 border border-slate-200/50 shadow-xs">
              <button
                id="deg-f-toggle"
                type="button"
                onClick={() => setIsCelsius(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isCelsius
                    ? "bg-[#3b82f6] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                °F
              </button>
              <button
                id="deg-c-toggle"
                type="button"
                onClick={() => setIsCelsius(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCelsius
                    ? "bg-[#3b82f6] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                °C
              </button>
            </div>

            {/* Quick Refresh trigger */}
            <button
              id="refresh-weather-btn"
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/80 border border-slate-200/50 hover:bg-white text-slate-500 hover:text-[#3b82f6] shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Refresh Forecast"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#3b82f6]" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Geolocation matching SearchBox header */}
        <SearchBox onLocationSelect={handleLocationSelect} currentLocationName={locationName} />

        {/* 1. Severe Weather Alerts Banner Feed (Renders instantly of either simulated or US real alerts) */}
        <AnimatePresence>
          {allAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2 font-sans">
                  Active Severe Broadcast Weather Alerts
                  <span className="bg-rose-50 border border-rose-200 text-rose-600 font-mono text-[10px] px-2.5 py-0.5 rounded-full select-none font-bold">
                    {allAlerts.length} Active System{allAlerts.length > 1 ? "s" : ""}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {allAlerts.map((alert) => {
                  const isSim = alert.id.startsWith("sim-");
                  const isExtreme = alert.severity === "Extreme";
                  const isSevere = alert.severity === "Severe";
                  
                  let borderTheme = "border-amber-200 bg-amber-50/70";
                  let titleTheme = "text-amber-900";
                  let textTheme = "text-amber-800";
                  let bgTag = "bg-amber-100 text-amber-700 border border-amber-200";
                  let dotBg = "bg-amber-500 animate-pulse";

                  if (isExtreme) {
                    borderTheme = "border-rose-200 bg-rose-50/80 shadow-rose-100/50 shadow-md";
                    titleTheme = "text-rose-950";
                    textTheme = "text-rose-800";
                    bgTag = "bg-rose-100 text-rose-700 border border-rose-200";
                    dotBg = "bg-rose-600 animate-ping";
                  } else if (isSevere) {
                    borderTheme = "border-orange-200 bg-orange-50/70";
                    titleTheme = "text-orange-950";
                    textTheme = "text-orange-850";
                    bgTag = "bg-orange-100 text-orange-700 border border-orange-200";
                    dotBg = "bg-orange-500 animate-pulse";
                  }

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      className={`border rounded-[28px] p-5 flex flex-col justify-between transition-all duration-350 bg-linear-to-b ${borderTheme}`}
                    >
                      <div>
                        {/* Event Title & Urgency Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3 pb-2.5 border-b border-black/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${dotBg} flex-shrink-0`} />
                            <h4 className="font-extrabold text-sm text-slate-800 leading-snug line-clamp-1">
                              {alert.event}
                            </h4>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${bgTag} font-sans`}>
                            {alert.severity}
                          </span>
                        </div>

                        {/* Metadata sender info */}
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>By: {alert.senderName}</span>
                          {isSim && <span className="text-[#3b82f6] font-extrabold">[Simulation Mode]</span>}
                        </div>

                        {alert.headline && (
                          <p className="text-xs font-extrabold text-slate-705 mb-2 leading-snug font-sans">
                            {alert.headline}
                          </p>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium line-clamp-3 mb-3">
                          {alert.description || "No full description is broadcasted yet."}
                        </p>

                        {/* Action instructions panel */}
                        {alert.instruction && (
                          <div className="bg-white/80 border border-black/5 rounded-2xl p-3.5 shadow-2xs mt-3">
                            <span className="font-black text-[9px] text-[#3b82f6] uppercase tracking-widest block mb-1">
                              ⚠️ Critical Safety Actions:
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans font-semibold">
                              {alert.instruction}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-black/5 flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-wide font-bold">
                        <span>Ends {new Date(alert.ends).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                        <span>{alert.urgency} Action</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-[#3b82f6] animate-spin" />
                <Wind className="w-6 h-6 text-[#3b82f6] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-700 font-sans">Synchronizing Atmospheric Satellites...</h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider font-mono">Querying NWS radars & WMO models</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto bg-white rounded-[32px] border border-white p-8 flex flex-col items-center text-center gap-5 shadow-xl shadow-slate-200/40 text-slate-850"
            >
              <div className="bg-rose-50 text-rose-600 p-4 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-rose-800">Forecast Fetch Interrupted</h3>
                <p className="text-sm text-slate-650 mt-1.5 leading-relaxed">
                  {error}
                </p>
                <div className="mt-5 bg-slate-50 rounded-2xl p-5 text-xs text-left text-slate-500 border border-slate-100 leading-relaxed font-sans max-w-lg mx-auto">
                  <span className="font-bold text-slate-800 block mb-1">💡 Troubleshooting Tips:</span>
                  1. The National Weather Service (NWS) API only covers the **United States**. International positions fall back, but please search a US city (e.g. Seattle, Houston, New York) to guarantee full premium data maps.<br />
                  2. Double check network availability or hit **Retry** below to restore links.
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/10 active:scale-95 transition-all cursor-pointer"
              >
                Retry Request
              </button>
            </motion.div>
          ) : weather ? (
            <motion.div
              key="weather-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans"
            >
              {/* LEFT COLUMN: 10-Day extended forecast */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                {/* 10-Day extended forecast module */}
                <DailyForecastCard dailyData={weather.daily} isCelsius={isCelsius} />
              </div>

              {/* RIGHT MAIN BODY: Current condition, meteorological factors, hourly trends */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
                
                {/* Current Condition Hero layout */}
                <div className="bg-white rounded-[40px] p-6 sm:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white">
                  
                  {/* Decorative faint layout background condition icon */}
                  <div className="absolute right-0 bottom-0 md:-right-6 md:-bottom-6 opacity-5 sm:opacity-7 pointer-events-none select-none">
                    <img 
                      src={weather.current.icon} 
                      alt="" 
                      className="w-72 h-72 sm:w-80 sm:h-80 animate-pulse duration-[10000ms]" 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Left content block: current degrees and badge description */}
                  <div className="z-10 flex flex-col justify-between gap-5 font-sans">
                    <div>
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Current Condition
                      </h2>
                      <div className="flex items-center gap-6">
                        <div className="flex items-start">
                          <span className="text-7xl sm:text-8xl font-black text-slate-850 tracking-tighter select-none leading-none">
                            {convertTemp(weather.current.temperature)}
                          </span>
                          <span className="text-3xl sm:text-4xl font-extrabold text-[#3b82f6] mt-1">
                            °
                          </span>
                        </div>
                        {/* High-quality weather icon highlighted panel */}
                        <div id="current-weather-icon-highlighted" className="bg-slate-50/80 border border-slate-100 p-3 rounded-2xl shadow-xs hover:scale-105 transition-transform duration-300">
                          <img
                            src={weather.current.icon}
                            alt={weather.current.shortForecast}
                            className="w-20 h-20 select-none pointer-events-none drop-shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 self-start px-4.5 py-2 rounded-full shadow-xs">
                      <img 
                        src={weather.current.icon} 
                        alt={weather.current.shortForecast} 
                        className="w-8 h-8 select-none pointer-events-none" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-sm sm:text-base font-extrabold text-slate-700">
                        {weather.current.shortForecast}
                      </span>
                    </div>

                    {/* Low/High summary for day */}
                    {weather.daily && weather.daily[0] && (
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2 mt-1 font-mono">
                        <span className="text-[#3b82f6]">Min {convertTemp(weather.daily[0].tempMin)}°</span>
                        <span className="text-slate-305">•</span>
                        <span className="text-slate-500">Max {convertTemp(weather.daily[0].tempMax)}°</span>
                      </div>
                    )}
                  </div>

                  {/* Right side block code: 2x2 grid of key meteorological indicators */}
                  <div className="grid grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-6 z-10 md:pr-4">
                    
                    {/* Meteorological Wind card */}
                    <div className="flex items-center gap-3.5">
                      <div className="bg-[#3b82f6]/10 p-2.5 rounded-2xl flex-shrink-0">
                        <img 
                          src="https://cdn.meteocons.com/3.0.0-next.10/svg/fill/windsock.svg" 
                          className="w-7 h-7 select-none pointer-events-none" 
                          alt="WindSpeed" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Wind Speed</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-850 truncate max-w-[120px]">{weather.current.windSpeed}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide font-mono">Dir: {weather.current.windDirection}</p>
                      </div>
                    </div>

                    {/* Meteorological Humidity card */}
                    <div className="flex items-center gap-3.5">
                      <div className="bg-[#3b82f6]/10 p-2.5 rounded-2xl flex-shrink-0">
                        <img 
                          src="https://cdn.meteocons.com/3.0.0-next.10/svg/fill/humidity.svg" 
                          className="w-7 h-7 select-none pointer-events-none" 
                          alt="Humidity" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Humidity</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-855">{weather.current.humidity}%</p>
                        <p className="text-[9px] text-slate-405 font-semibold uppercase tracking-wide font-mono">Dew: {convertTemp(weather.current.dewpoint)}°</p>
                      </div>
                    </div>

                    {/* Meteorological Barometer card */}
                    <div className="flex items-center gap-3.5">
                      <div className="bg-[#3b82f6]/10 p-2.5 rounded-2xl flex-shrink-0">
                        <img 
                          src="https://cdn.meteocons.com/3.0.0-next.10/svg/fill/barometer.svg" 
                          className="w-7 h-7 select-none pointer-events-none" 
                          alt="Barometer" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Atmosphere</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-855">{weather.current.pressure} inHg</p>
                        <p className="text-[9px] text-slate-405 font-semibold uppercase tracking-wide">Pressure</p>
                      </div>
                    </div>

                    {/* Meteorological Thermal index */}
                    <div className="flex items-center gap-3.5">
                      <div className="bg-[#3b82f6]/10 p-2.5 rounded-2xl flex-shrink-0">
                        <img 
                          src="https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thermometer.svg" 
                          className="w-7 h-7 select-none pointer-events-none" 
                          alt="Feels like" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Feels Like</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-855">{convertTemp(weather.current.feelsLike)}°</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">Thermal index</p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Synopsis conversational text box */}
                <div className="bg-white rounded-[24px] p-5 shadow-lg shadow-slate-200/30 flex flex-col gap-1 border border-white font-sans">
                  <span className="text-[10px] font-extrabold text-[#3b82f6] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                    Today's Meteorological Insights
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                    {weather.current.detailedForecast || "Detailed weather reports are initializing..."}
                  </p>
                </div>

                {/* Hourly Trend Chart Scroller (72 Hourly Forecast) */}
                <HourlyTrendChart hourlyData={weather.hourly} isCelsius={isCelsius} timezone={weather.location.timezone} />

              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* 2. Floating Slide-in Interactive Warning Toast Notification (bottom-right slot) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-3xl p-5 shadow-2xl border ${
              activeToast.severity === "Extreme" 
                ? "border-rose-400 shadow-rose-100" 
                : activeToast.severity === "Severe" 
                ? "border-orange-400 shadow-orange-100" 
                : "border-amber-400 shadow-amber-100"
            } overflow-hidden`}
          >
            {/* Color banner band */}
            <div className={`absolute top-0 inset-x-0 h-1.5 ${
              activeToast.severity === "Extreme" ? "bg-rose-500 animate-pulse" : activeToast.severity === "Severe" ? "bg-orange-500" : "bg-amber-500"
            }`} />

            <div className="flex gap-3.5 relative font-sans">
              <div className="mt-0.5 flex-shrink-0">
                <AlertTriangle className={`w-5 h-5 ${
                  activeToast.severity === "Extreme" ? "text-rose-500" : activeToast.severity === "Severe" ? "text-orange-500" : "text-amber-500"
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                    {activeToast.severity} Alert Launched
                  </span>
                  <button
                    onClick={() => setActiveToast(null)}
                    className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 leading-snug mt-1">
                  {activeToast.event}
                </h4>
                <p className="text-xs text-slate-550 leading-relaxed mt-1.5 line-clamp-3">
                  {activeToast.headline || activeToast.description}
                </p>
                
                {activeToast.instruction && (
                  <p className="text-[10px] bg-slate-50 border border-slate-100 rounded-lg p-2 mt-2.5 font-bold text-slate-600 leading-normal">
                    ⚠️ {activeToast.instruction}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-[8px] text-slate-400 font-mono tracking-wider">
                  <span>Urgency: {activeToast.urgency}</span>
                  <span>Ends shortly</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant minimalist footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 mt-16 text-center text-slate-450 text-xs border-t border-slate-200/50 pt-8 font-sans">
        <p className="font-sans font-bold uppercase tracking-wider text-[10px] text-slate-400">
          Breezy — Developed dynamically with official USA National Weather Service (NWS) & Open-Meteo integrations.
        </p>
        <p className="font-mono text-[9px] text-slate-415 mt-2 font-bold uppercase tracking-wider">
          Co-ordinates: {lat.toFixed(4)}°N, {lon.toFixed(4)}°W • PWA Active State • Local Applet Update: {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
}
