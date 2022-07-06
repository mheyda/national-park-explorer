import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeather, selectWeather } from '../weatherSlice.js';
import WeatherForecastItem from './WeatherForecastItem.js';
import './WeatherForecast.css';

export default function WeatherForecast( { lat, lng } ) {

    const dispatch = useDispatch();
    const weather = useSelector(selectWeather);
    const weatherStatus = useSelector(state => state.weather.status);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    // Get weather data
    useEffect(() => {
        dispatch(fetchWeather({lat: lat, lng: lng}))
    }, [dispatch, lat, lng])


    if (weatherStatus === 'succeeded') {
        // Show weather forecast
        return (
            <div className='weather-forecast-container'>
                <h3>7 Day Forecast</h3>
                <ul className='weather-forecast-content'>
                    {weather.daily.map((weather, index) => {
                        // Get day of the week
                        let dayIndex = new Date();
                        dayIndex.setDate(dayIndex.getDate() + index);
                        dayIndex = dayIndex.getDay();
                        if (index === 0) { dayIndex = 7 };

                        return <WeatherForecastItem key={index} weather={weather} dayOfTheWeek={weekdays[dayIndex]} />
                    })}
                </ul>
            </div>
        );
    }
    else {
        // Show loading
        return (
            <div className='weather-forecast-container'>
                <h3>7 Day Forecast</h3>
                Loading Forecast...
            </div>
        );
    }
}
