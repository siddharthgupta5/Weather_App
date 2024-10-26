
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherTrendChart from './WeatherTrendChart';
import WeatherMonitor from './WeatherMonitor';

const WeatherTable = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/weather/daily-summary');
        setWeatherData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    const fetchHistoryData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/weather/historic');
        setHistory(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
    fetchHistoryData();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Hyderabad', 'Bangalore'];

  return (
    <div className="weather-dashboard">
      <h2>Daily Weather Updates</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>City</th>
            <th>Avg Temp (°C)</th>
            <th>Max Temp (°C)</th>
            <th>Min Temp (°C)</th>
            <th>Dominant Weather</th>
            <th>Avg Humidity</th>
            <th>Avg Visibility</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((weather, index) => (
            <tr key={index}>
              <td>{new Date(weather.date).toLocaleDateString()}</td>
              <td>{weather._id.city}</td>
              <td>{weather.avgTemp.toFixed(4)}°C</td>
              <td>{weather.maxTemp}°C</td>
              <td>{weather.minTemp}°C</td>
              <td>{weather.dominantWeather}</td>
              <td>{weather.avgHumid.toFixed(4)}</td>
              <td>{weather.avgVisible.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
      {cities.map((city) => (
        <WeatherTrendChart key={city} weatherData={weatherData} city={city} />
      ))}

      <WeatherMonitor weatherData={weatherData} />
    </div>
  );
};

export default WeatherTable;
