import './Park.css';
import { Link } from 'react-router-dom';
import AutoSlideshow from '../../components/slideShows/AutoSlideshow.js';
import WeatherCurrent from '../../features/weather/weatherCurrent/WeatherCurrent.js';
import Weather7Day from '../../features/weather/weather7Day/Weather7Day.js';
import WeatherFormatToggler from '../../features/weather/WeatherFormatToggler.js';


export default function Park() {

    const park = JSON.parse(sessionStorage.getItem('currentPark'));

    return (
        <main className='park-container'>
            <Link to={'/'} >Back</Link>
            <br></br>
            <br></br>
            <div className='park'>
                <div className='park-img-container'>
                    <div className='park-img'>
                        <AutoSlideshow images={park.images} />
                    </div>
                </div>
                <div>
                    <section className='park-section'>
                        <h1>{park.fullName}</h1>
                        <p>{park.addresses[0].city}, {park.addresses[0].stateCode}</p>
                    </section>
                    <section className='park-section'>
                        <h2>Overview</h2>
                        <p>{park.description}</p>
                    </section>
                    <section className='park-section'>
                        <h2>Tickets & Fees</h2>
                        <ul>
                            {park.entranceFees.map((fee, index) => {
                                let { title, cost } = fee;
                                if (cost === '0.00') {
                                    if (title.toLowerCase().includes('free')) {
                                        cost = '';
                                    }
                                    else {
                                        cost = ' (FREE)';
                                    }
                                } else {
                                    cost = ': $' + cost;
                                }
                                return <li key={index}>{`${title}${cost}`}</li>
                            })}
                        </ul>
                    </section>
                </div>
            </div>
            <section className='park-section'>
                <h2>Weather <WeatherFormatToggler /></h2>
                <div className='park-weather'>
                    <WeatherCurrent lat={park.latitude} lng={park.longitude} />
                    <Weather7Day lat={park.latitude} lng={park.longitude} />
                </div>
            </section>
        </main>
    );
}
