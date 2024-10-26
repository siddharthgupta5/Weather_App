
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const WeatherTrendChart = ({ weatherData = [], city }) => {
  
  if (!Array.isArray(weatherData) || weatherData.length === 0) {
    return <p>No weather data available for {city}.</p>;
  }

  
  const cityData = weatherData
    .filter(data => data && data._id && data._id.city === city && data.date) 
    .map(data => ({
      ...data,
      formattedDate: new Date(data.date).toLocaleDateString(), 
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));


  if (cityData.length === 0) {
    return <p>No historical data for {city}.</p>;
  }

  return (
    <div className="weather-trend-chart">
      <h2>Historical Temperature Trends for {city}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={cityData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formattedDate" />
          <YAxis label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avgTemp" stroke="#8884d8" name="Avg Temp" />
          <Line type="monotone" dataKey="maxTemp" stroke="#82ca9d" name="Max Temp" />
          <Line type="monotone" dataKey="minTemp" stroke="#ff7300" name="Min Temp" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherTrendChart;
