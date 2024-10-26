const dotenv = require('dotenv');
const connectDB = require('./database/database.js');
const fetchWeatherData = require('./service/weather.js');
const express = require('express');
const Weather = require('./models/Weather.js')
const cors = require('cors')
const router = express.Router();
dotenv.config();
const app = express()
app.use(cors())
connectDB();

const PORT = process.env.PORT || 5000; // Default to 5 minutes


app.get('/api/weather/daily-summary', async (req, res) => {
  try {
    const dailySummaries = await Weather.aggregate([
      {
        $group: {
          _id: { day: { $dayOfMonth: "$timestamp" }, city: "$city" },
          avgTemp: { $avg: "$temp" },
          maxTemp: { $max: "$temp" },
          minTemp: { $min: "$temp" },
          dominantWeather: { $first: "$main" },  
          avgHumid: { $avg: "$humidity" },
          avgVisible: { $avg: "$visibility" },
          date: { $first: "$timestamp" }
        }
      },
      { $sort: { date: -1 } }  
    ]);

    res.json(dailySummaries);
  } catch (error) {

    console.error('Error fetching daily summaries:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/weather/historic', async (req, res) => {
  try {
    const dailySummaries = await Weather.aggregate([
      {
        $group: {
          _id: { city: "$city" },
          avgTemp: { $avg: "$temp" },
          maxTemp: { $max: "$temp" },
          minTemp: { $min: "$temp" },
          dominantWeather: { $first: "$main" },  
          avgHumid: { $avg: "$humidity" },
          date: { $first: "$timestamp" },
          avgVisible: { $avg: "$visibility" },
        }
      },
      { $sort: { date: -1 } }  
    ]);
    
    res.json(dailySummaries);
  } catch (error) {

    console.error('Error fetching daily summaries:', error);
    res.status(500).send('Server error');
  }
});

app.listen(8000, () => {
  console.log(`App started, listening on port ${PORT}`)
})
setInterval(() => {
  console.log('Fetching weather data...');
  fetchWeatherData();
}, PORT);
