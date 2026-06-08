export interface WeatherLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export interface CurrentWeather {
  temperature: number;
  shortForecast: string;
  detailedForecast: string;
  humidity: number;
  windSpeed: string;
  windDirection: string;
  dewpoint: number;
  pressure: number;
  icon: string;
  feelsLike: number;
}

export interface HourlyForecast {
  time: string;
  hourFormatted: string;
  temperature: number;
  shortForecast: string;
  windSpeed: string;
  precipitationProbability: number;
  icon: string;
}

export interface DailyForecast {
  dayName: string;
  date: string;
  tempMax: number;
  tempMin: number;
  shortForecast: string;
  detailedForecastDay: string;
  detailedForecastNight: string;
  icon: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: string;
  urgency: string;
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
  senderName: string;
  effective: string;
  ends: string;
}

export interface WeatherPayload {
  provider: "nws" | "open-meteo";
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: WeatherAlert[];
}

export interface GeocodeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id?: number;
  admin2_id?: number;
  admin3_id?: number;
  admin4_id?: number;
  timezone: string;
  population?: number;
  postcodes?: string[];
  country_id: number;
  country: string;
  admin1?: string; // state
  admin2?: string; // county
  admin3?: string;
  admin4?: string;
}
