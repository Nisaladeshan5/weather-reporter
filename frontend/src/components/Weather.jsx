import React, { useEffect, useState } from "react";

function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Colombo");
  const [inputValue, setInputValue] = useState("Colombo");
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
          city
        )}`
      );
      if (!res.ok) {
        throw new Error("City not found");
      }
      const data = await res.json();
      setWeather(data);
      setLocation(city);
      updateSearchHistory(city);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
    const stored = localStorage.getItem("searchHistory");
    if (stored) setSearchHistory(JSON.parse(stored));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    fetchWeather(inputValue.trim());
    setShowSuggestions(false);
  };

  const updateSearchHistory = (city) => {
    const updated = [city, ...searchHistory.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 px-8 md:px-9 py-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl w-full max-w-4xl p-6 text-white flex flex-col justify-between min-h-[80vh]">
        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mb-6 flex justify-center w-full relative"
          autoComplete="off"
        >
          <div className="relative w-4/5 max-w-lg">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(searchHistory.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search city"
              className="w-full rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 px-4 py-3 lg:py-4 text-lg focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-[1px] top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-5 sm:px-4 py-4 text-lg font-semibold transition duration-300 active:scale-95 flex items-center justify-center rounded-full rounded-l-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
              <span className="hidden sm:inline ml-1">Search</span>
            </button>

            {showSuggestions && searchHistory.length > 0 && (
              <ul className="absolute top-full mt-1 w-full bg-white/20 text-white rounded-xl text-sm max-h-40 overflow-y-auto backdrop-blur-md border border-white/30 shadow-lg z-10">
                {searchHistory
                  .filter((c) =>
                    c.toLowerCase().startsWith(inputValue.toLowerCase())
                  )
                  .map((city, index) => (
                    <li
                      key={index}
                      onMouseDown={() => {
                        setInputValue(city);
                        setShowSuggestions(false);
                        fetchWeather(city);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-white/30 transition"
                    >
                      {city}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center my-4">
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}

        {/* Weather Display */}
        {!loading && !error && weather && (
          <>
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-1">
                {weather.location.name}
              </h2>
              <p className="text-lg md:text-3xl">
                {weather.location.localtime}
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center my-5 gap-0 md:gap-5 py-3">
              <img
                src={`https:${weather.current.condition.icon}`}
                alt="weather icon"
                className="w-20 h-20 md:w-24 md:h-24 "
              />
              <div className="text-center md:text-left">
                <p className="text-2xl font-semibold">
                  {weather.current.condition.text}
                </p>
                <p className="text-5xl md:text-6xl font-bold">
                  {weather.current.temp_c}°C
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-base md:text-2xl">
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="uppercase text-gray-200">Feels Like</p>
                <p className="font-semibold">
                  {weather.current.feelslike_c}°C
                </p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="uppercase text-gray-200">Humidity</p>
                <p className="font-semibold">{weather.current.humidity}%</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="uppercase text-gray-200">Wind</p>
                <p className="font-semibold">
                  {weather.current.wind_kph} km/h
                </p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="uppercase text-gray-200">UV Index</p>
                <p className="font-semibold">{weather.current.uv}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="uppercase text-gray-200">Pressure</p>
                <p className="font-semibold">
                  {weather.current.pressure_mb} mb
                </p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="uppercase text-gray-200 ">Wind Dir</p>
                <p className="font-semibold">{weather.current.wind_dir}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Weather;
