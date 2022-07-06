import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeather, selectWeather, selectFormat } from '../weatherSlice.js';
import convertFromKelvin from '../../../utilityFunctions/convertFromKelvin.js';
import capitalizeFirstLetters from '../../../utilityFunctions/capitalizeFirstLetters.js';
import './WeatherCurrent.css';


export default function WeatherCurrent( { lat, lng } ) {

    const dispatch = useDispatch();
    const weather = useSelector(selectWeather);
    const weatherStatus = useSelector(state => state.weather.status);
    const tempFormat = useSelector(selectFormat);
    const [temp, setTemp] = useState({
        current: null,
        high: null,
        low: null
    });

    // Get weather data
    useEffect(() => {
        dispatch(fetchWeather({lat: lat, lng: lng}));
    }, [dispatch, lat, lng])

    // Update temp format when it changes in state
    useEffect(() => {
        if (weatherStatus === 'succeeded') {
            setTemp({
                current: convertFromKelvin(weather.current.temp, tempFormat).toFixed(0),
                high: convertFromKelvin(weather.daily[0].temp.max, tempFormat).toFixed(0),
                low: convertFromKelvin(weather.daily[0].temp.min, tempFormat).toFixed(0)
            });
        }
    }, [tempFormat, weather, weatherStatus]);


    if (weatherStatus === 'succeeded') {
        
        const icon = weather.current.weather[0].icon;
        const altText = weather.current.weather[0].description;
        const description = capitalizeFirstLetters(weather.current.weather[0].description);

        // Show current weather
        return (
            <div className='weather-current-container'>
                <h3>Currently</h3>
                <div className='weather-current-content'>
                    <img className='weather-current-icon' src={`http://openweathermap.org/img/wn/${icon}@2x.png`} alt={altText} />
                    <p className='weather-current-temp-main'>{temp.current}&deg;{tempFormat}</p>
                    <p>{description}</p>
                    <p>H: {temp.high}&deg;{tempFormat} | L: {temp.low}&deg;{tempFormat}</p>
                </div>
            </div>
        );
    }
    else {
        // Show loading
        return (
            <div className='weather-current-container'>
                <h3>Currently</h3>
                <i className="weather-loading-icon fa-solid fa-sun"></i>
                <p className='weather-current-temp-main'>--</p>
                <p>Loading Weather...</p>
                <p>H: -- | L: --</p>
            </div>
        );
    }
}
