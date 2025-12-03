import { useState, useEffect } from 'react';

export default function Forecast({ city }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city) {
      fetchForecast();
    }
  }, [city]);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
      
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) throw new Error('Kan locatie niet vinden');
      
      const geoData = await geoResponse.json();
      if (geoData.length === 0) throw new Error('Stad niet gevonden');
      
      const { lat, lon } = geoData[0];
      
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max&timezone=auto&forecast_days=7`;
      
      const response = await fetch(forecastUrl);
      if (!response.ok) throw new Error('Kan weersverwachting niet ophalen');
      
      const data = await response.json();
      
      const forecastData = data.daily.time.map((date, i) => ({
        date: new Date(date),
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        precipitation: data.daily.precipitation_probability_max[i],
        weatherCode: data.daily.weathercode[i],
        windSpeed: Math.round(data.daily.windspeed_10m_max[i])
      }));
      
      setForecast(forecastData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 69) return '🌧️';
    if (code <= 79) return '🌨️';
    if (code <= 84) return '🌧️';
    return '⛈️';
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Helder';
    if (code <= 3) return 'Gedeeltelijk bewolkt';
    if (code <= 49) return 'Mistig';
    if (code <= 69) return 'Regenachtig';
    if (code <= 79) return 'Sneeuw';
    if (code <= 84) return 'Buien';
    return 'Onweer';
  };

  const getDayName = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Vandaag';
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
    
    return date.toLocaleDateString('nl-NL', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="mt-6 p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-sky-300 shadow-md">
        <div className="text-center text-gray-600">Weersverwachting laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-6 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-300">
        <p className="text-red-700 text-center font-medium">{error}</p>
      </div>
    );
  }

  if (forecast.length === 0) return null;

  return (
    <div className="mt-6 mb-6 p-6 backdrop-blur-sm rounded-2xl border border-sky-300 shadow-xl">
      <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <span className="material-symbols-outlined text-sky-500">calendar_month</span>
        7-daagse verwachting
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {forecast.map((day, i) => (
          <div 
            key={i}
            className="bg-gradient-to-br from-white/90 to-sky-50/90 backdrop-blur-sm rounded-xl shadow-lg p-4 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-sky-200/50"
          >
            <div className="text-center">
              <p className="font-bold text-base mb-1 text-gray-800">
                {getDayName(day.date)}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {day.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
              </p>
              
              <div className="text-5xl mb-3 drop-shadow-md">
                {getWeatherIcon(day.weatherCode)}
              </div>
              
              <p className="text-xs font-medium text-gray-700 mb-3 h-8 flex items-center justify-center">
                {getWeatherDescription(day.weatherCode)}
              </p>
              
              <div className="flex justify-center items-center gap-2 mb-4 bg-white/50 rounded-lg py-2">
                <span className="text-xl font-bold text-orange-500">
                  {day.tempMax}°
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-base font-semibold text-blue-600">
                  {day.tempMin}°
                </span>
              </div>
              
              <div className="text-xs text-gray-700 space-y-2">
                <div className="flex items-center justify-center gap-2 bg-blue-50/50 rounded-lg py-1.5 px-2">
                  <span className="material-symbols-outlined text-blue-500" style={{ fontSize: '16px' }}>water_drop</span>
                  <span className="font-medium">{day.precipitation}%</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-sky-50/50 rounded-lg py-1.5 px-2">
                  <span className="material-symbols-outlined text-sky-500" style={{ fontSize: '16px' }}>air</span>
                  <span className="font-medium">{day.windSpeed} km/u</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}