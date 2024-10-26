
const dotenv = require('dotenv');
const connectDB = require('./database/database.js');
const fetchWeatherData = require('./service/weather.js');
const express = require('express');
const Weather = require('./models/Weather.js');
const cors = require('cors');
const cron = require('node-cron');

dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
connectDB();

const PORT = process.env.PORT || 5000;


let clients = new Set();


app.get('/api/weather/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  

  sendLatestWeatherData(res);
  

  clients.add(res);
  

  req.on('close', () => {
    clients.delete(res);
  });
});

async function sendLatestWeatherData(res = null) {
  try {
    const latestData = await Weather.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$city",
          temp: { $first: "$temp" },
          humidity: { $first: "$humidity" },
          visibility: { $first: "$visibility" },
          main: { $first: "$main" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);

    const formattedData = latestData.map(data => ({
      city: data._id,
      temp: data.temp,
      main: data.main,
      date: new Date(data.timestamp).toISOString().split('T')[0],
      timestamp: new Date(data.timestamp).toLocaleTimeString(),
      humidity: data.humidity,
      visibility: data.visibility,
    }));

    const eventData = `data: ${JSON.stringify(formattedData)}\n\n`;
    
    if (res) {
      
      res.write(eventData);
    } else {
      
      clients.forEach(client => {
        client.write(eventData);
      });
    }
  } catch (error) {
    console.error('Error fetching latest weather data:', error);
  }
}

// Schedule weather data fetching and broadcasting every 3 minutes
cron.schedule(process.env.CRON_SCHEDULE, async () => {
  console.log('Fetching weather data...');
  try {
    await fetchWeatherData(process.env.OPEN_WEATHER_API_ENDPOINT);
    console.log('Weather data fetched successfully');
    
    sendLatestWeatherData();
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
});


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
  console.log(`App started, listening on port ${PORT}`);

  fetchWeatherData();
});