import Weather7DayItem from './Weather7DayItem.js';


export default function Weather7DayDisplay( { weather } ) {
    
    return (
        <ul className='weather-7day-container'>
            <h3>7 Day Forecast</h3>
            {weather.daily.map((weather, index) => {
                let dayOfTheWeek = new Date();
                dayOfTheWeek.setDate(dayOfTheWeek.getDate() + index);
                dayOfTheWeek = dayOfTheWeek.getDay();
                if (index === 0) { dayOfTheWeek = 7 };
                return <Weather7DayItem key={index} weather={weather} dayOfTheWeek={dayOfTheWeek} />
            })}
        </ul>
    );
}
