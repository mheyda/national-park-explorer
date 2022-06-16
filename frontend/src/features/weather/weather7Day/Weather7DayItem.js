import convertFromKelvin from '../../../functions/convertFromKelvin.js';
import { useSelector } from 'react-redux/es/exports.js';
import { selectFormat } from '../weatherSlice.js';
import { useState, useEffect } from 'react';


export default function Weather7weatherItem( { weather, dayOfTheWeek } ) {
    
    const icon = weather.weather[0].icon;
    const altText = weather.weather[0].description;
    const description = weather.weather[0].description.split(" ").map((word) => word[0].toUpperCase() + word.substr(1) + ' ');
    const tempFormat = useSelector(selectFormat);
    const [temp, setTemp] = useState({
        high: convertFromKelvin(weather.temp.max, 'F').toFixed(0),
        low: convertFromKelvin(weather.temp.min, 'F').toFixed(0)
    });

    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];


    useEffect(() => {
        setTemp({
            high: convertFromKelvin(weather.temp.max, tempFormat).toFixed(0),
            low: convertFromKelvin(weather.temp.min, tempFormat).toFixed(0)
        });
    }, [tempFormat, weather.temp.max, weather.temp.min])

    return (
        <li className='weather-7day-item'>
            <p className='weather-7day-day'>{weekday[dayOfTheWeek]}</p>
            <div>
                <img className='weather-7day-icon' src={`http://openweathermap.org/img/wn/${icon}@2x.png`} alt={altText} />
                <p>{description}</p>
            </div>
            <p className='weather-7day-temps'>
                H: {temp.high}&deg;{tempFormat}
                <br></br>
                L: {temp.low}&deg;{tempFormat}
            </p>
        </li>
    );
}
