import { useState } from 'react'
import Forecast from './components/Forecast';
import ForecastDaily from './components/ForecastDaily';

export default function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    async function getWeather() {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      
      setLoading(true);
      setError(null);
      setWeather(null);

      try{
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric&lang=nl`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Stad niet gevonden");
      }
      
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const getWeatherIcon = (code) => {
  
  if (code >= 200 && code < 300) return '⛈️'; 
  if (code >= 300 && code < 400) return '🌧️'; 
  if (code >= 500 && code < 600) return '🌧️'; 
  if (code >= 600 && code < 700) return '🌨️'; 
  if (code >= 700 && code < 800) return '🌫️'; 
  if (code === 800) return '☀️';
  if (code === 801) return '🌤️'; 
  if (code === 802) return '⛅'; 
  if (code > 802) return '☁️'; 
  return '☀️';
};
    function handleSubmit(event) {
      event.preventDefault();
      if (!query.trim()) {
        setError("Voer een geldige stad in");
        return;
      }
      getWeather(query.trim());
    }

function getWeatherByLocation() {

  setLoading(true);
  setError(null);
  setWeather(null);

  if (!navigator.geolocation) {
    setError("Geolocatie wordt niet ondersteund door uw browser");
    return;
  }    

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=nl`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Weergegevens niet gevonden voor uw locatie");
        }

        const data = await response.json();
        setWeather(data);
        setQuery(data.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    (_error) => {
      setLoading(false);
      setError("Toestemming voor locatie geweigerd");
    }
  );
}

      
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-start justify-center p-6"
         style={{ backgroundImage: "url('/src/assets/bg.jpg')", backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }}>

      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Weer App</h1>
          </header>   

          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Stad zoeken (bijv. Amsterdam)"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 text-white font-medium hover:bg-sky-600 rounded-lg flex items-center gap-2"
              disabled={loading}
            ><span class="material-symbols-outlined">search</span>   
            </button>
            <button
              type="button"
              onClick={getWeatherByLocation}
              className="px-4 py-2 bg-green-500 text-white font-medium hover:bg-green-600 rounded-lg flex items-center gap-2"
              disabled={loading}
            >
              <span class="material-symbols-outlined">my_location</span>
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 mb-4 rounded-lg font-medium">
              {error}

            </div>
          )}

          {weather ?(
            <div className="text-center bg-gradient-to-b from-sky-50 to-white backdrop-blur-sm rounded-lg p-6 shadow-xl">
             <div className ="flex items-center justify-center gap-4">
                <div className="text-8xl drop-shadow-lg">
                   {getWeatherIcon(weather.weather[0].id)}
                </div>
                
              
               <div> 
                 <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-900">location_on

                 </span>
                  {weather.name}, {weather.sys?.country}</h2>
                 <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
                 <p className="text-sm text-gray-600">Max : {Math.round(weather.main.temp_max)}°C / Min: {Math.round(weather.main.temp_min)}°C</p>
                 <p className="text-sm text-gray-600 capitalize">{weather.weather[0].description}</p>
               </div>
             </div>
            
            <ul className="mt-4 grid grid-cols-2 gap-4 text-sm text-black-700 ">

              <li className="font-medium p-3 border shadow-xl rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-orange-500">thermostat</span>
                Gevoelstemperatuur: {Math.round(weather.main.feels_like)}°C
                </li>

              <li className="font-medium p-3 border  shadow-xl rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-blue-500">water_drop</span>
                Luchtvochtigheid: {weather.main.humidity}%
                </li>

              <li className="font-medium p-3 border shadow-xl rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-xl text-sky-500">air</span>
                Wind: {Math.round(weather.wind.speed * 3.6)} km/u
                </li>

              <li className="font-medium p-3 border border-black-300 shadow-xl rounded-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-xl">speed</span>
                Druk: {weather.main.pressure} hPa
                </li>

            </ul>
           </div>
          ) : (
            <div className=" text-black-600 flex flex-col"
                 style={{ backgroundImage: "url('/src/assets/search-city.png')", backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '350px' }}>
              <h1 className="mt-96 font-bold text-3xl text-center">Zoek een stad</h1>
              <p className=" font-semibold text-center">Bekijk de weersomstandigheden van de stad</p>
            </div>
          )}
          {weather && <Forecast city={weather.name} />}
          {weather && <ForecastDaily city={weather.name} />}
      </div>
   </div>

  );
}





