const axios = require('axios');
const Weather = require('../models/Weather.js');
const dotenv = require('dotenv');

dotenv.config();

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

const fetchWeatherData = async () => {
  try {

    for (const city of cities) {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: city,
          appid: process.env.API_KEY,
        },
      });

      const data = response.data;
      const tempCelsius = (data.main.temp - 273.15).toFixed(2); // Kelvin to Celsius
      const feelsLikeCelsius = (data.main.feels_like - 273.15).toFixed(2);


      const weather = new Weather({
        city,
        main: data.weather[0].main,
        temp: tempCelsius,
        feels_like: feelsLikeCelsius,
        humidity: data.main.humidity,
        visibility: data.visibility,
      });

      await weather.save();
      console.log(`Weather data saved for ${city}: ${tempCelsius}°C`);

      if (tempCelsius >= process.env.THRESHOLD_TEMP) {
        sendAlert(city, tempCelsius);
      }
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

module.exports = fetchWeatherData;
