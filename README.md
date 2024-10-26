# Weather Monitoring Application

## Project Description

This project is a Weather Monitoring System that tracks weather data for different cities, allowing users to set temperature thresholds and receive alerts if the threshold is exceeded for two consecutive API calls (3 minutes apart).

This is a real-time data processing system to monitor weather conditions and provide summarized insights using rollups and aggregates. The system will utilize data from the OpenWeatherMap API (https://openweathermap.org/).

## Features

1. Fetches data of every city for every day: Continuously track and retrieve Data through API call.
2. Stores and Calculates daily summaries and daily aggregates: Calculated Average temperature, Maximumtemperature, Minimumtemperature and Dominant weather condition (give reason on this).
3. Temperature Conversion: Converts the Temperature to Celsius.
4. Shows Historical Trends and daily Summaries: Plot graph using those datas.
5. Alerting Thresholds: Send real-time alert messages when choosing the threshold condition, its limit and when a number of continuous limits is breached.
6. Added Bonus Features such as Weather Forecasts and extended the aggregate and rollups to other parameters such as Humidity and Visibility.
7. Database: This Application is using MongoDB as database.


## Tech Stacks:

-   Tech stack: MERN stack + Chartjs. 
-   Error handling both on the server and on the client

## Dependencies:
   ### Backend:
    -  Node.js (v18.12.1)
    -  Express (v4.x)
    -  Axios (v1.x)
    -  Mongoose (v6.x)
    -  dotenv (v16.x)
    -  Nodemon (v2.x) (for development) 
    
   ### Frontend:
    -  React (v18.x)
    -  Axios (v1.x)
    -  Chart.js (v4.x)
    -  React Chart.js (v4.x)

Here all the enclosed braces indicate the version of these Tech Stacks used.

## Prerequisites
- Ensure you have Node.js and npm installed.

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/siddharthgupta5/Weather_App.git
```

2. Change Directory:
```bash
cd .\app\backend\
``` 

4. Install dependencies:
```bash
npm install
```

3. Update the .env file with your values for OPEN_WEATHER_API_KEY, PORT and USERNAME and PASSWORD for the MONGO_URI (for the MongoDB database).
```js
OPEN_WEATHER_API_KEY=...
PORT=...
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.lw6c7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

4. Start the development server:
```bash
npm run server
```

5. Open another terminal. Navigate into the project directory:
```bash
cd .\app\client\
```

6. Install dependencies:
```bash
npm install
```

7. Start the frontend server:
```bash
npm start
```




