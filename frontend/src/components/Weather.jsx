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

      // Update search history, avoid duplicates (case-insensitive)
      setSearchHistory((prev) => {
        const exists = prev.some(
          (item) => item.toLowerCase() === city.toLowerCase()
        );
        if (exists) return prev;
        return [city, ...prev].slice(0, 5); // keep max 5 recent searches
      });
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    fetchWeather(inputValue.trim());
    setShowSuggestions(false);
  };

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("searchHistory") || "[]"
    );
    setSearchHistory(storedHistory);
  }, []);

  const updateSearchHistory = (city) => {
    setSearchHistory((prev) => {
      const updated = [...new Set([city, ...prev])].slice(0, 5); // max 5 recent
      localStorage.setItem("searchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="h-full bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl shadow-xl w-full max-w-screen p-6 text-white">
        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mb-4 flex justify-center w-full"
          autoComplete="off"
        >
          <label htmlFor="city-search" className="sr-only">
            Search city
          </label>
          <div className="relative w-4/5 max-w-lg">
            <input
              id="city-search"
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow click
                setTimeout(() => setShowSuggestions(false), 100);
              }}
              onFocus={() => {
                if (searchHistory.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search city"
              autoComplete="off"
              className="w-full rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 px-3 py-2 text-sm focus:outline-none min-w-0"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-[1px] top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-3 py-2 text-sm font-semibold transition duration-300 active:scale-95 flex items-center rounded-full rounded-l-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
              <ul
                id="search-suggestions"
                role="listbox"
                className="absolute z-10 w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-b-xl max-h-48 overflow-auto text-white text-sm"
              >
                {searchHistory
                  .filter((city) =>
                    city.toLowerCase().startsWith(inputValue.toLowerCase())
                  )
                  .map((city) => (
                    <li
                      key={city}
                      role="option"
                      tabIndex={-1}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setInputValue(city);
                        setShowSuggestions(false);
                      }}
                      className="cursor-pointer px-3 py-2 hover:bg-purple-600"
                    >
                      {city}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </form>

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

        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        {!loading && !error && weather && weather.current && (
          <>
            {/* Location and time */}
            <div className="text-center lg:text-left">
              <h2 className="text-base sm:text-xl font-bold mb-1">
                {weather.location.name}
              </h2>
              <p className="text-xs sm:text-sm">{weather.location.localtime}</p>
            </div>

            {/* Weather icon and temp */}
            <div className="flex flex-col sm:flex-row items-center justify-center my-3 gap-y-2 sm:gap-x-4">
              <img
                src={`https:${weather.current.condition.icon}`}
                alt="weather icon"
                className="w-12 h-12 sm:w-16 sm:h-16"
              />
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm font-semibold">
                  {weather.current.condition.text}
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {weather.current.temp_c}°C
                </p>
              </div>
            </div>

            {/* Weather details */}
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm sm:grid-cols-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="uppercase text-gray-200">feels like</p>
                <p className="font-semibold">{weather.current.feelslike_c}°C</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="uppercase text-gray-200">Humidity</p>
                <p className="font-semibold">{weather.current.humidity}%</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="uppercase text-gray-200">Wind</p>
                <p className="font-semibold">{weather.current.wind_kph} km/h</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="uppercase text-gray-200">UV Index</p>
                <p className="font-semibold">{weather.current.uv}</p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="uppercase text-gray-200">Pressure</p>
                <p className="font-semibold">
                  {weather.current.pressure_mb} mb
                </p>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <p className="uppercase text-gray-200">Wind Dir</p>
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
