import { useState, useEffect } from 'react';
import convertFromKelvin from '../../../functions/convertFromKelvin.js';
import { useSelector } from 'react-redux/es/exports.js';
import { selectFormat } from '../weatherSlice.js';

export default function WeatherCurrentDisplay( { weather } ) {


    const icon = weather.current.weather[0].icon;
    const altText = weather.current.weather[0].description;
    const description = weather.current.weather[0].description.split(" ").map((word) => word[0].toUpperCase() + word.substr(1) + ' ');
    const tempFormat = useSelector(selectFormat);
    const [temp, setTemp] = useState({
        current: convertFromKelvin(weather.current.temp, 'F').toFixed(0),
        high: convertFromKelvin(weather.daily[0].temp.max, 'F').toFixed(0),
        low: convertFromKelvin(weather.daily[0].temp.min, 'F').toFixed(0)
    });

    // Update temp format
    useEffect(() => {
        setTemp({
            current: convertFromKelvin(weather.current.temp, tempFormat).toFixed(0),
            high: convertFromKelvin(weather.daily[0].temp.max, tempFormat).toFixed(0),
            low: convertFromKelvin(weather.daily[0].temp.min, tempFormat).toFixed(0)
        });
    }, [tempFormat, weather]);

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
