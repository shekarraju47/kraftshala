import { useState, useEffect } from "react";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";
import { WiHumidity } from "react-icons/wi";
import { IoIosTime, IoMdCalendar } from "react-icons/io";
import { BiCurrentLocation } from "react-icons/bi";
import { CiTempHigh } from "react-icons/ci";
import { FaWind } from "react-icons/fa6";
import "./App.css";

const API_KEY = "8f48e4068a51bded7939be2da5ee595d";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [curretnCity, setCurrentCuty] = useState(false);

// Time & Date Take From Time Zone Convet to Current Data And Time
  const updateCityTime = () => {
    const offset = weather.timezone;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityTime = new Date(utc + offset * 1000);
    const formattedDate = cityTime.toLocaleDateString();
    const formattedTime = cityTime.toLocaleTimeString();

    setDateTime([formattedDate, formattedTime]);
  };

  useEffect(() => {
    getCurrentLocationWeather();
    // eslint-disable-next-line
  }, []);


  //Time and date update evrey seconds using Intervals
  useEffect(() => {
    const interval = setInterval(() => {
      if (weather) {
        updateCityTime();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [weather]);

  //Fetch Weather User Current Location
  // latitude, longitude taking from inbuild functions
  const fetchWeather = async (latitude, longitude) => {
    setError(null);
    setWeather(null);
    setLoading(true);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const unixTimestamp = response.data.dt;
      const date = new Date(unixTimestamp * 1000);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();
      console.log(formattedDate, formattedTime);

      console.log(response.data);
      setWeather(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather data", error);
      setLoading(false);
      setError(error.message);
    }
  };

  const getCurrentLocationWeather = () => {
    setError(null);
    setWeather(null);
    setLoading(true);
    if (navigator.geolocation) {
      setCurrentCuty(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Error getting current location", error);
        }
      );
      setLoading(false);
    } else {
      setLoading(false);
      setError(error.message);
      alert("Geolocation is not supported by this browser.");
    }
  };


  //User Search perticuler location (zipcode or address) fetch datails from apis 
  const fetchWeatherByCity = async (city) => {
    setCurrentCuty(false);
    setError(null);
    setWeather(null);
    setLoading(true);
    if (city.length > 0) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        setWeather(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error.message);
        console.error("Error fetching weather data", error);
      }
    } else {
      setLoading(false);
      setError("Enter valid inputs");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather App</h1>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={() => fetchWeatherByCity(city)}>Get Weather</button>
        {loading && (
          <div className="loader">
            <TailSpin className="mt-5" width={"50%"} color="#36d7b7" />
          </div>
        )}
        {weather ? (
          <>
            <div className="weather-info">
              <div className="top-card">
                <div>
                  <IoMdCalendar className="icons" />
                  <p>{dateTime[0]}</p>
                </div>

                <div>
                  <IoIosTime className="icons" />
                  <p>{dateTime[1]}</p>
                </div>
              </div>

              <div>
                {curretnCity && (
                  <div className="location-card">
                    <BiCurrentLocation />
                    <p>Current Location</p>
                  </div>
                )}
                <h2>{weather.name}</h2>
                <img
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt="Weather icon"
                />

                <p className="weather">{weather.weather[0].description}</p>
              </div>

              <div className="temp-card">
                <div className="detials">
                  <div className="dt-card">
                    <CiTempHigh className="temp-icon" />
                    <p className="temp">Temp: {weather.main.temp}°C</p>
                  </div>

                  <div className="dt-card">
                    <WiHumidity className="humidity" />
                    <p>Humidity: {weather.main.humidity}</p>
                  </div>

                  <div className="dt-card">
                    <FaWind className="speed" />
                    <p>Speed: {weather.wind.speed} </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <h1>{error}</h1>
        )}
      </header>
    </div>
  );
};

export default App;
