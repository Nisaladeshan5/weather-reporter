import React, { useEffect, useState } from 'react';

function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      console.log("API Key:", apiKey);

      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Colombo`
        );
        const data = await res.json();
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <p className="text-center text-lg text-white">Loading weather data...</p>;
  if (!weather || !weather.current) return <p className="text-center text-red-500">Weather data not available.</p>;

  return (
    <div className="h-screen py-4 px-4 flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-md text-white flex flex-col justify-between h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Colombo</h2>
          <p className="text-sm">{weather.location.localtime}</p>
        </div>

        <div className="flex items-center justify-center my-4">
          <img
            src={`https:${weather.current.condition.icon}`}
            alt="weather icon"
            className="w-16 h-16"
          />
          <div className="ml-3 text-center">
            <p className="text-base font-semibold">{weather.current.condition.text}</p>
            <p className="text-4xl font-bold">{weather.current.temp_c}°C</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 p-3 rounded-xl">
            <p className="text-xs uppercase text-gray-200">Feels Like</p>
            <p className="text-base font-semibold">{weather.current.feelslike_c}°C</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <p className="text-xs uppercase text-gray-200">Humidity</p>
            <p className="text-base font-semibold">{weather.current.humidity}%</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <p className="text-xs uppercase text-gray-200">Wind</p>
            <p className="text-base font-semibold">{weather.current.wind_kph} km/h</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <p className="text-xs uppercase text-gray-200">UV Index</p>
            <p className="text-base font-semibold">{weather.current.uv}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Weather;
