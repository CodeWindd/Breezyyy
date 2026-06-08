import { WeatherPayload, GeocodeLocation } from "../types";

export function getWindDirectionName(degree: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((degree % 360) / 22.5)) % 16;
  return directions[index];
}

export function mapWmoToMeteocon(code: number, isDay: boolean): { icon: string; text: string } {
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

export async function clientFetchGeocode(query: string): Promise<GeocodeLocation[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to search locations");
  }
  const data = await response.json();
  return data.results || [];
}

export async function clientFetchWeather(
  latitude: number,
  longitude: number,
  fallbackName?: string
): Promise<WeatherPayload> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,dew_point_2m,is_day&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=10`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to connect to weather services directly.");
  }
  
  const data = await response.json();
  if (!data.current) {
    throw new Error("Invalid response structure from weather services.");
  }

  // Current
  const cur = data.current;
  const isDay = cur.is_day !== 0;
  const curMapped = mapWmoToMeteocon(cur.weather_code, isDay);
  
  const currentTemp = Math.round(cur.temperature_2m);
  const currentDesc = curMapped.text;
  const currentDetailed = `Currently ${curMapped.text.toLowerCase()} with a temperature of ${currentTemp}°F. Winds are blowing at ${Math.round(cur.wind_speed_10m)} mph from the ${cur.wind_direction_10m}° direction.`;
  const currentHumidity = Math.round(cur.relative_humidity_2m);
  const currentWind = `${Math.round(cur.wind_speed_10m)} mph`;
  const currentWindDir = getWindDirectionName(cur.wind_direction_10m);
  const currentDewpoint = Math.round(cur.dew_point_2m);
  const currentPressure = Math.round((cur.pressure_msl / 33.8639) * 100) / 100; // hPa to inHg
  const currentIcon = curMapped.icon;
  const currentFeelsLike = Math.round(cur.apparent_temperature);

  // Hourly
  const hourlyUnified: any[] = [];
  if (data.hourly) {
    const limit = Math.min(data.hourly.time.length, 72);
    for (let i = 0; i < limit; i++) {
      const t = data.hourly.time[i];
      const dateObj = new Date(t);
      const hour = dateObj.getHours();
      const hIsDay = hour > 6 && hour < 20;
      const code = data.hourly.weather_code[i];
      const mapped = mapWmoToMeteocon(code, hIsDay);
      const formattedHour = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      hourlyUnified.push({
        time: t,
        hourFormatted: formattedHour,
        temperature: Math.round(data.hourly.temperature_2m[i]),
        shortForecast: mapped.text,
        windSpeed: `${Math.round(data.hourly.wind_speed_10m[i])} mph`,
        precipitationProbability: data.hourly.precipitation_probability[i] || 0,
        icon: mapped.icon,
      });
    }
  }

  // Daily
  const dailyUnified: any[] = [];
  if (data.daily) {
    const omDays = data.daily;
    for (let i = 0; i < omDays.time.length; i++) {
      const t = omDays.time[i];
      const dateObj = new Date(t + "T12:00:00");
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
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

  return {
    provider: "open-meteo",
    location: {
      latitude,
      longitude,
      name: fallbackName || "Selected Location",
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
    alerts: [],
  };
}
