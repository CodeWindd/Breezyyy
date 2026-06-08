import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Global user-agent header for NWS API calls
const USER_AGENT = "BreezyWeatherApp/1.0 (nehemiahporter992@gmail.com)";

function mapWmoToMeteocon(code: number, isDay: boolean): { icon: string; text: string } {
  // WMO weather interpretation codes (WW)
  switch (code) {
    case 0:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-day.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-night.svg",
        text: "Clear",
      };
    case 1:
    case 2:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night.svg",
        text: "Partly Cloudy",
      };
    case 3:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast.svg",
        text: "Overcast",
      };
    case 45:
    case 48:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/fog-day.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/fog-night.svg",
        text: "Foggy",
      };
    case 51:
    case 53:
    case 55:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-drizzle.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-drizzle.svg",
        text: "Drizzle",
      };
    case 56:
    case 57:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/sleet.svg",
        text: "Freezing Drizzle",
      };
    case 61:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-rain.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-rain.svg",
        text: "Light Rain",
      };
    case 63:
    case 65:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg",
        text: "Rain",
      };
    case 66:
    case 67:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/sleet.svg",
        text: "Freezing Rain",
      };
    case 71:
    case 73:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-snow.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-snow.svg",
        text: "Light Snow",
      };
    case 75:
    case 77:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/snow.svg",
        text: "Snow",
      };
    case 80:
    case 81:
    case 82:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg",
        text: "Rain Showers",
      };
    case 85:
    case 86:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/snow.svg",
        text: "Snow Showers",
      };
    case 95:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-day.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-night.svg",
        text: "Thunderstorms",
      };
    case 96:
    case 99:
      return {
        icon: isDay
          ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-day-rain.svg"
          : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-night-rain.svg",
        text: "Severe Thunderstorms",
      };
    default:
      return {
        icon: "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/cloudy.svg",
        text: "Cloudy",
      };
  }
}

function mapNwsForecastToMeteocon(shortForecast: string, isDaytime: boolean): string {
  const norm = shortForecast.toLowerCase();

  if (norm.includes("thunderstorm") || norm.includes("t-storm")) {
    if (norm.includes("rain") || norm.includes("shower")) {
      return isDaytime 
        ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-day-rain.svg"
        : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-night-rain.svg";
    }
    return isDaytime
      ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-day.svg"
      : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/thunderstorms-night.svg";
  }

  if (norm.includes("tornado")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/tornado.svg";
  }
  if (norm.includes("hurricane") || norm.includes("tropical storm")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/hurricane.svg";
  }

  if (norm.includes("showers") || norm.includes("rain") || norm.includes("precip")) {
    if (norm.includes("partly") || norm.includes("scattered") || norm.includes("chance")) {
      return isDaytime
        ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-rain.svg"
        : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-rain.svg";
    }
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/rain.svg";
  }

  if (norm.includes("drizzle")) {
    if (norm.includes("partly") || norm.includes("scattered") || norm.includes("chance")) {
      return isDaytime
        ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-drizzle.svg"
        : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-drizzle.svg";
    }
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/drizzle.svg";
  }

  if (norm.includes("sleet") || norm.includes("freezing rain")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/sleet.svg";
  }

  if (norm.includes("snow") || norm.includes("flurries") || norm.includes("blizzard")) {
    if (norm.includes("partly") || norm.includes("scattered") || norm.includes("chance")) {
      return isDaytime
        ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-snow.svg"
        : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-snow.svg";
    }
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/snow.svg";
  }

  if (norm.includes("hail")) {
    if (norm.includes("partly") || norm.includes("scattered") || norm.includes("chance")) {
      return isDaytime
        ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day-hail.svg"
        : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night-hail.svg";
    }
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/hail.svg";
  }

  if (norm.includes("fog")) {
    return isDaytime
      ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/fog-day.svg"
      : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/fog-night.svg";
  }

  if (norm.includes("haze")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/haze.svg";
  }
  if (norm.includes("smoke")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/smoke.svg";
  }
  if (norm.includes("dust") || norm.includes("sand")) {
    if (norm.includes("wind")) {
      return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/dust-wind.svg";
    }
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/dust.svg";
  }

  if (norm.includes("mostly sunny") || norm.includes("partly cloudy") || norm.includes("partly sunny") || norm.includes("mostly clear")) {
    return isDaytime
      ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-day.svg"
      : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/partly-cloudy-night.svg";
  }

  if (norm.includes("mostly cloudy")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/cloudy.svg";
  }

  if (norm.includes("overcast") || norm.includes("cloudy")) {
    return isDaytime 
      ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-day.svg"
      : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/overcast-night.svg";
  }

  if (norm.includes("wind") || norm.includes("breezy") || norm.includes("gusty")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/wind.svg";
  }

  if (norm.includes("mist") || norm.includes("damp")) {
    return "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/mist.svg";
  }

  return isDaytime
    ? "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-day.svg"
    : "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/clear-night.svg";
}

function parseLocalTimeWithOffset(localDateTimeStr: string, offsetSeconds: number): Date {
  const tempDate = new Date(localDateTimeStr + "Z");
  const utcMs = tempDate.getTime() - (offsetSeconds * 1000);
  return new Date(utcMs);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Geocoding Proxy
  app.get("/api/geocode", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
         return res.status(400).json({ error: "Missing 'q' query parameter" });
      }

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch geocoding data");
      }

      const data = await response.json();
      res.json(data.results || []);
    } catch (err: any) {
      console.error("Geocoding error:", err);
      res.status(500).json({ error: err.message || "Failed to search locations." });
    }
  });

  // Weather Unified Endpoint
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: "Missing latitude or longitude parameters" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      // 1. Fetch Open-Meteo in parallel (which is guaranteed to work globally and serves as full fallback)
      const openMeteoPromise = fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,dew_point_2m,is_day&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=10`
      ).then(r => r.ok ? r.json() : null).catch(() => null);

      // 2. Try fetching NWS API point properties
      let nwsData: any = null;
      let isUS = false;

      try {
        const nwsPointsResponse = await fetch(
          `https://api.weather.gov/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`,
          { headers: { "User-Agent": USER_AGENT } }
        );

        if (nwsPointsResponse.ok) {
          const pointsJson = await nwsPointsResponse.json();
          if (pointsJson.properties) {
            isUS = true;
            
            // Extract forecast URLs and location info
            const forecastUrl = pointsJson.properties.forecast;
            const forecastHourlyUrl = pointsJson.properties.forecastHourly;
            const relativeLocation = pointsJson.properties.relativeLocation?.properties;
            const city = relativeLocation?.city || "";
            const state = relativeLocation?.state || "";

            // Fetch forecast and hourly in parallel
            const [forecastRes, forecastHourlyRes] = await Promise.all([
              fetch(forecastUrl, { headers: { "User-Agent": USER_AGENT } }).then(r => r.ok ? r.json() : null).catch(() => null),
              fetch(forecastHourlyUrl, { headers: { "User-Agent": USER_AGENT } }).then(r => r.ok ? r.json() : null).catch(() => null),
            ]);

            if (forecastRes && forecastRes.properties) {
              nwsData = {
                city,
                state,
                forecast: forecastRes.properties.periods,
                forecastHourly: forecastHourlyRes?.properties?.periods || null
              };
            }
          }
        }
      } catch (nwsErr) {
        console.warn("NWS endpoint error, falling back completely to OpenMeteo:", nwsErr);
      }

      const openMeteoData = await openMeteoPromise;

      // Fetch active alerts from NWS for these coordinates
      let activeAlerts: any[] = [];
      try {
        const alertsResponse = await fetch(
          `https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`,
          { headers: { "User-Agent": USER_AGENT } }
        );
        if (alertsResponse.ok) {
          const alertsJson = await alertsResponse.json();
          if (alertsJson && alertsJson.features) {
            activeAlerts = alertsJson.features.map((f: any) => ({
              id: f.properties.id || String(Math.random()),
              event: f.properties.event || f.properties.headline || "Weather Alert",
              severity: f.properties.severity || "Unknown",
              urgency: f.properties.urgency || "Unknown",
              headline: f.properties.headline || "",
              description: f.properties.description || "",
              instruction: f.properties.instruction || "",
              areaDesc: f.properties.areaDesc || "",
              senderName: f.properties.senderName || "National Weather Service",
              effective: f.properties.effective || new Date().toISOString(),
              ends: f.properties.ends || new Date(Date.now() + 3600000).toISOString(),
            }));
          }
        }
      } catch (err) {
        console.warn("Could not fetch active alerts from NWS:", err);
      }

      if (!nwsData && !openMeteoData) {
        return res.status(502).json({ error: "Failed to connect to weather services." });
      }

      // Build unified schema
      // First, let's assemble current conditions
      let provider = "open-meteo";
      let locationName = "Unknown Location";
      let currentTemp = 0;
      let currentDesc = "";
      let currentDetailed = "";
      let currentHumidity = 0;
      let currentWind = "0 mph";
      let currentWindDir = "N";
      let currentDewpoint = 0;
      let currentPressure = 29.92;
      let currentIcon = "";
      let currentFeelsLike = 0;

      // Hourly items (up to 72)
      let hourlyUnified: any[] = [];
      // Daily items (exactly 10 days!)
      let dailyUnified: any[] = [];

      const targetTimeZone = openMeteoData?.timezone || "UTC";

      if (nwsData) {
        provider = "nws";
        locationName = `${nwsData.city}, ${nwsData.state}`;

        const currentPeriod = nwsData.forecast[0];
        currentTemp = currentPeriod.temperature;
        currentDesc = currentPeriod.shortForecast;
        currentDetailed = currentPeriod.detailedForecast;
        currentWind = currentPeriod.windSpeed;
        currentWindDir = currentPeriod.windDirection;
        currentIcon = mapNwsForecastToMeteocon(currentPeriod.shortForecast, currentPeriod.isDaytime);
        currentFeelsLike = currentTemp;

        // Overlay with high-precision real-time observations from OpenMeteo if available!
        if (openMeteoData && openMeteoData.current) {
          const cur = openMeteoData.current;
          const isDay = cur.is_day !== 0;
          const mapped = mapWmoToMeteocon(cur.weather_code, isDay);
          
          currentTemp = Math.round(cur.temperature_2m);
          currentDesc = mapped.text;
          currentIcon = mapped.icon;
          currentHumidity = Math.round(cur.relative_humidity_2m);
          currentDewpoint = Math.round(cur.dew_point_2m);
          currentWind = `${Math.round(cur.wind_speed_10m)} mph`;
          currentWindDir = getWindDirectionName(cur.wind_direction_10m);
          currentPressure = Math.round((cur.pressure_msl / 33.8639) * 100) / 100; // hPa to inHg
          currentFeelsLike = Math.round(cur.apparent_temperature);
        }

        // 72 Hourly Forecast
        if (nwsData.forecastHourly) {
          const limit = Math.min(nwsData.forecastHourly.length, 72);
          for (let i = 0; i < limit; i++) {
            const h = nwsData.forecastHourly[i];
            const dateObj = new Date(h.startTime);
            const formattedHour = dateObj.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: targetTimeZone,
            });
            hourlyUnified.push({
              time: h.startTime,
              hourFormatted: formattedHour,
              temperature: h.temperature,
              shortForecast: h.shortForecast,
              windSpeed: h.windSpeed,
              precipitationProbability: h.probabilityOfPrecipitation?.value || 0,
              icon: mapNwsForecastToMeteocon(h.shortForecast, h.isDaytime),
            });
          }
        } else if (openMeteoData && openMeteoData.hourly) {
          // If NWS hourly is missing, use OpenMeteo hourly mapping
          const limit = Math.min(openMeteoData.hourly.time.length, 72);
          for (let i = 0; i < limit; i++) {
            const t = openMeteoData.hourly.time[i];
            const hourPart = t.split("T")[1] || "12:00";
            const hour = parseInt(hourPart.split(":")[0], 10) || 12;
            const isDay = hour > 6 && hour < 20;
            const code = openMeteoData.hourly.weather_code[i];
            const mapped = mapWmoToMeteocon(code, isDay);
            
            let formattedHour = t;
            try {
              const ampm = hour >= 12 ? "PM" : "AM";
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              formattedHour = `${displayHour}:00 ${ampm}`;
            } catch (e) {
              console.error("Error formatting OpenMeteo hour:", e);
            }

            hourlyUnified.push({
              time: t,
              hourFormatted: formattedHour,
              temperature: Math.round(openMeteoData.hourly.temperature_2m[i]),
              shortForecast: mapped.text,
              windSpeed: `${Math.round(openMeteoData.hourly.wind_speed_10m[i])} mph`,
              precipitationProbability: openMeteoData.hourly.precipitation_probability[i] || 0,
              icon: mapped.icon,
            });
          }
        }

        // Daily Forecast (10 Days!)
        // NWS typically has ~14 half-day periods. We can group them by day.
        const dayBuckets: { [key: string]: any } = {};
        nwsData.forecast.forEach((p: any) => {
          // Extract general day name. "Today", "Tonight", "Monday", "Monday Night"
          const baseDayName = p.name.replace(" Night", "");
          if (!dayBuckets[baseDayName]) {
            dayBuckets[baseDayName] = {
              dayName: baseDayName,
              startTime: p.startTime,
              tempMax: null,
              tempMin: null,
              shortForecast: p.shortForecast,
              detailedForecastDay: "",
              detailedForecastNight: "",
              icon: "",
            };
          }

          if (p.isDaytime) {
            dayBuckets[baseDayName].tempMax = p.temperature;
            dayBuckets[baseDayName].detailedForecastDay = p.detailedForecast;
            dayBuckets[baseDayName].icon = mapNwsForecastToMeteocon(p.shortForecast, true);
          } else {
            dayBuckets[baseDayName].tempMin = p.temperature;
            dayBuckets[baseDayName].detailedForecastNight = p.detailedForecast;
            if (!dayBuckets[baseDayName].icon) {
              dayBuckets[baseDayName].icon = mapNwsForecastToMeteocon(p.shortForecast, false);
            }
          }
        });

        // Convert day buckets to ordered array
        const sortedDays = Object.values(dayBuckets).sort(
          (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        // Fill min/max if missing (e.g. if we started during the night and today doesn't have a daytime temp)
        sortedDays.forEach((d: any) => {
          if (d.tempMax === null) d.tempMax = d.tempMin;
          if (d.tempMin === null) d.tempMin = d.tempMax;
        });

        // Now maps Day 1 to Day 7
        sortedDays.forEach((d: any) => {
          const dObj = new Date(d.startTime);
          const dateStr = dObj.toISOString().split("T")[0];
          dailyUnified.push({
            dayName: d.dayName,
            date: dateStr,
            tempMax: d.tempMax,
            tempMin: d.tempMin,
            shortForecast: d.shortForecast,
            detailedForecastDay: d.detailedForecastDay || d.detailedForecastNight,
            detailedForecastNight: d.detailedForecastNight || d.detailedForecastDay,
            icon: d.icon,
          });
        });

        // NWS has around 7 days. To reach exactly 10 days, supplement days 8-10 from OpenMeteo
        if (openMeteoData && openMeteoData.daily) {
          const omDays = openMeteoData.daily;
          const offset = openMeteoData.utc_offset_seconds || 0;
          for (let i = dailyUnified.length; i < 10; i++) {
            if (omDays.time[i]) {
              const t = omDays.time[i];
              const dateObj = parseLocalTimeWithOffset(omDays.time[i] + "T12:00:00", offset);
              const dayName = dateObj.toLocaleDateString("en-US", {
                weekday: "long",
                timeZone: targetTimeZone,
              });
              const code = omDays.weather_code[i];
              const mapped = mapWmoToMeteocon(code, true);
              dailyUnified.push({
                dayName,
                date: t,
                tempMax: Math.round(omDays.temperature_2m_max[i]),
                tempMin: Math.round(omDays.temperature_2m_min[i]),
                shortForecast: mapped.text,
                detailedForecastDay: `High of ${Math.round(omDays.temperature_2m_max[i])}°F. ${mapped.text}.`,
                detailedForecastNight: `Low of ${Math.round(omDays.temperature_2m_min[i])}°F.`,
                icon: mapped.icon,
              });
            }
          }
        }
      } else if (openMeteoData) {
        // Fallback or international locations (pure OpenMeteo)
        provider = "open-meteo";
        locationName = "International / Fallback Location";

        if (openMeteoData.current) {
          const cur = openMeteoData.current;
          const isDay = cur.is_day !== 0;
          const mapped = mapWmoToMeteocon(cur.weather_code, isDay);
          currentTemp = Math.round(cur.temperature_2m);
          currentDesc = mapped.text;
          currentDetailed = `Currently ${mapped.text.toLowerCase()} with a temperature of ${currentTemp}°F. Winds are blowing at ${Math.round(cur.wind_speed_10m)} mph from the ${cur.wind_direction_10m}° direction.`;
          currentHumidity = Math.round(cur.relative_humidity_2m);
          currentWind = `${Math.round(cur.wind_speed_10m)} mph`;
          currentWindDir = getWindDirectionName(cur.wind_direction_10m);
          currentDewpoint = Math.round(cur.dew_point_2m);
          currentPressure = Math.round((cur.pressure_msl / 33.8639) * 100) / 100;
          currentIcon = mapped.icon;
          currentFeelsLike = Math.round(cur.apparent_temperature);
        }

        // Hourly
        if (openMeteoData.hourly) {
          const limit = Math.min(openMeteoData.hourly.time.length, 72);
          for (let i = 0; i < limit; i++) {
            const t = openMeteoData.hourly.time[i];
            const hourPart = t.split("T")[1] || "12:00";
            const hour = parseInt(hourPart.split(":")[0], 10) || 12;
            const isDay = hour > 6 && hour < 20;
            const code = openMeteoData.hourly.weather_code[i];
            const mapped = mapWmoToMeteocon(code, isDay);
            
            let formattedHour = t;
            try {
              const ampm = hour >= 12 ? "PM" : "AM";
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              formattedHour = `${displayHour}:00 ${ampm}`;
            } catch (e) {
              console.error("Error formatting OpenMeteo hour:", e);
            }

            hourlyUnified.push({
              time: t,
              hourFormatted: formattedHour,
              temperature: Math.round(openMeteoData.hourly.temperature_2m[i]),
              shortForecast: mapped.text,
              windSpeed: `${Math.round(openMeteoData.hourly.wind_speed_10m[i])} mph`,
              precipitationProbability: openMeteoData.hourly.precipitation_probability[i] || 0,
              icon: mapped.icon,
            });
          }
        }

        // Daily
        if (openMeteoData.daily) {
          const omDays = openMeteoData.daily;
          const offset = openMeteoData.utc_offset_seconds || 0;
          for (let i = 0; i < omDays.time.length; i++) {
            const t = omDays.time[i];
            const dateObj = parseLocalTimeWithOffset(t + "T12:00:00", offset);
            const dayName = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              timeZone: targetTimeZone,
            });
            const code = omDays.weather_code[i];
            const mapped = mapWmoToMeteocon(code, true);
            dailyUnified.push({
              dayName,
              date: t,
              tempMax: Math.round(omDays.temperature_2m_max[i]),
              tempMin: Math.round(omDays.temperature_2m_min[i]),
              shortForecast: mapped.text,
              detailedForecastDay: `High of ${Math.round(omDays.temperature_2m_max[i])}°F. ${mapped.text}.`,
              detailedForecastNight: `Low of ${Math.round(omDays.temperature_2m_min[i])}°F.`,
              icon: mapped.icon,
            });
          }
        }
      }

      const responsePayload = {
        provider,
        location: {
          latitude,
          longitude,
          name: locationName,
          timezone: targetTimeZone,
        },
        current: {
          temperature: currentTemp,
          shortForecast: currentDesc,
          detailedForecast: currentDetailed,
          humidity: currentHumidity,
          windSpeed: currentWind,
          windDirection: currentWindDir,
          dewpoint: currentDewpoint,
          pressure: currentPressure,
          icon: currentIcon,
          feelsLike: currentFeelsLike,
        },
        hourly: hourlyUnified,
        daily: dailyUnified,
        alerts: activeAlerts,
      };

      res.json(responsePayload);
    } catch (err: any) {
      console.error("Weather endpoint error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch weather forecast." });
    }
  });

  // Helper for human-readable wind direction
  function getWindDirectionName(degree: number): string {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(((degree % 360) / 22.5)) % 16;
    return directions[index];
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
