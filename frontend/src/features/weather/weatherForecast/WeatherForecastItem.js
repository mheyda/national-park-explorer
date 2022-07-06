import convertFromKelvin from '../../../utilityFunctions/convertFromKelvin.js';
import capitalizeFirstLetters from '../../../utilityFunctions/capitalizeFirstLetters.js';
import { useSelector } from 'react-redux/es/exports.js';
import { selectFormat } from '../weatherSlice.js';
import { useState, useEffect } from 'react';


export default function WeatherForecastItem( { weather, dayOfTheWeek } ) {
    
    const icon = weather.weather[0].icon;
    const altText = weather.weather[0].description;
    const description = capitalizeFirstLetters(weather.weather[0].description);
    const tempFormat = useSelector(selectFormat);
    const [temp, setTemp] = useState({
        high: convertFromKelvin(weather.temp.max, 'F').toFixed(0),
        low: convertFromKelvin(weather.temp.min, 'F').toFixed(0)
    });

    useEffect(() => {
        setTemp({
            high: convertFromKelvin(weather.temp.max, tempFormat).toFixed(0),
            low: convertFromKelvin(weather.temp.min, tempFormat).toFixed(0)
        });
    }, [tempFormat, weather.temp.max, weather.temp.min])

    return (
        <li className='weather-forecast-item'>
            <p className='weather-forecast-day'>{dayOfTheWeek}</p>
            <div>
                <img className='weather-forecast-icon' src={`http://openweathermap.org/img/wn/${icon}@2x.png`} alt={altText} />
                <p>{description}</p>
            </div>
            <p className='weather-forecast-temps'>
                H: {temp.high}&deg;{tempFormat}
                <br></br>
                L: {temp.low}&deg;{tempFormat}
            </p>
        </li>
    );
}
