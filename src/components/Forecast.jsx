import React, { useEffect, useState} from 'react';

export default function Forecast ({ city }) {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!city) return;

        async function fetchForecast() {
            setLoading(true);
            setError(null);

            try {
                const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
                const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=nl`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Forecast niet gevonden");
                }

                const data = await response.json();
                setForecast(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                }
            }

            fetchForecast();
        }, [city]);

    if (loading) 
        return <p>Forecast laden...</p>;
    if (error) 
        return <p className="text-red-500">Fout: {error}</p>;
    if (!forecast) 
        return null;

   return (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4">3-uur verwachting</h2>

    {/* Horizontale scroll-container */}
    <div className="flex gap-4 overflow-x-auto pb-2">
      {forecast.list.slice(0, 8).map((item) => (
        <div
          key={item.dt}
          className="min-w-[130px] mt-4 p-4 bg-gradient-to-b from-sky-50 to-white backdrop-blur-sm rounded-xl text-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <p className="font-medium">{item.dt_txt.slice(11, 16)}</p>

          <img
            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
            alt={item.weather[0].description}
            className="mx-auto"
          />

          <p className="text-lg font-semibold">{Math.round(item.main.temp)}°C</p>
          <p className="text-sm text-gray-600 capitalize">
            {item.weather[0].description}
          </p>
        </div>
      ))}
    </div>
  </div>
);

}


