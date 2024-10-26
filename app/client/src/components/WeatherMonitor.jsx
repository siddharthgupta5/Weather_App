
const React = require('react');
const { useState, useEffect } = require('react');

const WeatherMonitor = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [consecutiveAlerts, setConsecutiveAlerts] = useState({});
  const [selectedCondition, setSelectedCondition] = useState('temperature');
  
  const [thresholds, setThresholds] = useState({
    temperature: {
      max: 23,
      consecutiveCount: 2,
    },
    humidity: {
      max: 80,
      consecutiveCount: 2,
    },
    visibility: {
      min: 4000, 
      consecutiveCount: 2,
    }
  });
  
  const [inputValues, setInputValues] = useState({
    temperature: {
      max: thresholds.temperature.max.toString(),
      consecutiveCount: thresholds.temperature.consecutiveCount.toString()
    },
    humidity: {
      max: thresholds.humidity.max.toString(),
      consecutiveCount: thresholds.humidity.consecutiveCount.toString()
    },
    visibility: {
      min: thresholds.visibility.min.toString(),
      consecutiveCount: thresholds.visibility.consecutiveCount.toString()
    }
  });

  const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

  const handleConditionChange = (e) => {
    setSelectedCondition(e.target.value);
    setAlerts([]);
    setConsecutiveAlerts({});
  };

  const handleInputChange = (field, value) => {
    setInputValues(prev => ({
      ...prev,
      [selectedCondition]: {
        ...prev[selectedCondition],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newValue = parseFloat(inputValues[selectedCondition][selectedCondition === 'visibility' ? 'min' : 'max']);
    const newCount = parseInt(inputValues[selectedCondition].consecutiveCount);

    if (isNaN(newValue) || isNaN(newCount) || newCount < 1) {
      alert('Please enter valid values');
      return;
    }

    setThresholds(prev => ({
      ...prev,
      [selectedCondition]: {
        [selectedCondition === 'visibility' ? 'min' : 'max']: newValue,
        consecutiveCount: newCount,
      }
    }));
    
    setConsecutiveAlerts({});
    setAlerts([]);
  };

  const fetchWeatherData = async () => {
    try {
      const fetchedData = await Promise.all(
        cities.map(async (city) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=b8a608dc457bacc51a75851c2fe64bad`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${city}`);
          }
          const data = await response.json();

          return {
            city,
            temp: data.main.temp - 273.15,
            main: data.weather[0].main,
            date: new Date(data.dt * 1000).toISOString().split('T')[0],
            timestamp: new Date().toLocaleTimeString(),
            humidity: data.main.humidity,
            visibility: data.visibility,
          };
        })
      );

      setWeatherData(fetchedData);
      fetchedData.forEach(checkWeatherAlerts);
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const checkWeatherAlerts = (latestWeatherData) => {
    const { city } = latestWeatherData;
    let isThresholdExceeded = false;
    let value;

    switch(selectedCondition) {
      case 'temperature':
        value = latestWeatherData.temp;
        isThresholdExceeded = value > thresholds.temperature.max;
        break;
      case 'humidity':
        value = latestWeatherData.humidity;
        isThresholdExceeded = value > thresholds.humidity.max;
        break;
      case 'visibility':
        value = latestWeatherData.visibility;
        isThresholdExceeded = value < thresholds.visibility.min;
        break;
    }
    
    setConsecutiveAlerts(prev => {
      const newConsecutiveAlerts = { ...prev };
      
      if (isThresholdExceeded) {
        const key = `${city}`;
        newConsecutiveAlerts[key] = (newConsecutiveAlerts[key] || 0) + 1;
        
        if (newConsecutiveAlerts[key] >= thresholds[selectedCondition].consecutiveCount) {
          triggerAlert(latestWeatherData);
          newConsecutiveAlerts[key] = 0;
        }
      } else {
        newConsecutiveAlerts[`${city}`] = 0;
      }
      
      return newConsecutiveAlerts;
    });
  };

  const triggerAlert = (weatherData) => {
    let value, unit;
    switch(selectedCondition) {
      case 'temperature':
        value = `${weatherData.temp.toFixed(2)}°C (${weatherData.main})`;
        break;
      case 'humidity':
        value = `${weatherData.humidity}%`;
        break;
      case 'visibility':
        value = `${weatherData.visibility}m`;
        break;
    }
      
    const alertMessage = `Alert! ${weatherData.city}: ${selectedCondition.charAt(0).toUpperCase() + selectedCondition.slice(1)} ${selectedCondition === 'visibility' ? 'below' : 'exceeds'} threshold: ${value} at ${weatherData.timestamp}`;
    
    setAlerts(prevAlerts => {
      if (!prevAlerts.includes(alertMessage)) {
        return [...prevAlerts, alertMessage];
      }
      return prevAlerts;
    });
  };

  useEffect(() => {
    fetchWeatherData();
    const intervalId = setInterval(fetchWeatherData, 30000);
    return () => clearInterval(intervalId);
  }, [thresholds, selectedCondition]);

  const getInputFields = () => {
    const condition = selectedCondition;
    const isVisibility = condition === 'visibility';
    const threshold = isVisibility ? 'min' : 'max';
    
    return (
      <>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="thresholdValue">
            {isVisibility ? 'Minimum' : 'Maximum'} {condition.charAt(0).toUpperCase() + condition.slice(1)} 
            {condition === 'temperature' ? ' (°C)' : condition === 'visibility' ? ' (m)' : ' (%)'}:
          </label>
          <input
            id="thresholdValue"
            type="number"
            step={condition === 'temperature' ? "0.1" : "1"}
            value={inputValues[condition][threshold]}
            onChange={(e) => handleInputChange(threshold, e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="consecutiveCount">Consecutive Readings: </label>
          <input
            id="consecutiveCount"
            type="number"
            min="1"
            value={inputValues[condition].consecutiveCount}
            onChange={(e) => handleInputChange('consecutiveCount', e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
      </>
    );
  };

  return (
    <div>
      <h1>Weather Monitor</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Weather Monitor Settings</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="condition">Select Threshold Condition: </label>
            <select
              id="condition"
              value={selectedCondition}
              onChange={handleConditionChange}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="visibility">Visibility</option>
            </select>
          </div>
          {getInputFields()}
          <button type="submit">Update Threshold</button>
        </form>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Active Threshold</h2>
        <p>
          {selectedCondition.charAt(0).toUpperCase() + selectedCondition.slice(1)}: {
            selectedCondition === 'visibility' 
              ? `${thresholds[selectedCondition].min}m (minimum)`
              : `${thresholds[selectedCondition].max}${selectedCondition === 'temperature' ? '°C' : '%'}`
          }
          ({thresholds[selectedCondition].consecutiveCount} consecutive readings)
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Current Weather</h2>
        <div 
    style={{ 
      display: 'flex', 
      gap: '10px', 
      overflowX: 'scroll',
      paddingBottom: '10px'  // Add some padding for easier scrolling
    }}
  >
          {weatherData.map((data, index) => {
            let isThresholdExceeded;
            switch(selectedCondition) {
              case 'visibility':
                isThresholdExceeded = data.visibility < thresholds.visibility.min;
                break;
              case 'temperature':
                isThresholdExceeded = data.temp > thresholds.temperature.max;
                break;
              case 'humidity':
                isThresholdExceeded = data.humidity > thresholds.humidity.max;
                break;
            }
            
            return (
              <div key={index} style={{ 
                padding: '10px', 
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: isThresholdExceeded ? '#fff0f0' : '#f0f0f0'
              }}>
                <h3>{data.city}</h3>
                <p>Temperature: {data.temp.toFixed(2)}°C</p>
                <p>Humidity: {data.humidity}%</p>
                <p>Visibility: {data.visibility}m</p>
                <p>Condition: {data.main}</p>
                <p>Weather forecast: {data.main}</p>
                <p>Last Updated: {data.timestamp}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2>Alerts</h2>
        {alerts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.map((alert, index) => (
              <li 
                key={index} 
                style={{ 
                  color: 'red',
                  padding: '10px',
                  marginBottom: '5px',
                  border: '1px solid red',
                  borderRadius: '5px',
                  backgroundColor: '#fff0f0'
                }}
              >
                {alert}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'gray' }}>No alerts to display</p>
        )}
      </div>
    </div>
  );
};

export default WeatherMonitor;