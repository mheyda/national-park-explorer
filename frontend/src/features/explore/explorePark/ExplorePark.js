import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getStateFullName from '../../../utilityFunctions/getStateFullName.js';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow.js';
import WeatherCurrent from '../../weather/weatherCurrent/WeatherCurrent.js';
import WeatherForecast from '../../weather/weatherForecast/WeatherForecast.js';
import WeatherFormatToggler from '../../weather/WeatherFormatToggler.js';
import './ExplorePark.css';


export default function ExplorePark() {

    const navigate = useNavigate();
    const park = JSON.parse(sessionStorage.getItem('currentPark'));

    useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: 'auto'});
    }, [])

    const handleImageError = (e) => {
        e.target.src = require('../../../assets/images/plain-gray.webp')
    }

    const setActiveSection = (index) => {
        document.querySelectorAll('.park-section').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.park-section')[index].classList.add('active');
        document.querySelectorAll('.park-nav-btn').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.park-nav-btn')[index].classList.add('active');
    }

    return (
        <>
            <header className='park-header'>
                <button className='park-back-btn' onClick={(e) => {e.preventDefault(); navigate(-1)}} ><i className="fa-solid fa-circle-chevron-left"></i></button>
                <div className='park-header-title'>
                    <h1>{park.name}</h1>
                    <h1>{park.designation}</h1>
                    <p>{park.addresses[0].city}, {park.addresses[0].stateCode}</p>
                </div>
                <img src={park.images[0].url} onError={handleImageError} alt={park.images[0].altText} />
            </header>
            <nav className='park-nav'>
                <button className='park-nav-btn active' onClick={() => setActiveSection(0)}><i className="fa-solid fa-file-lines"></i>Overview</button>
                <button className='park-nav-btn' onClick={() => setActiveSection(1)}><i className="fa-solid fa-person-biking"></i>Things to Do</button>
                <button className='park-nav-btn' onClick={() => setActiveSection(2)}><i className="fa-solid fa-ticket"></i>Fees</button>
                <button className='park-nav-btn' onClick={() => setActiveSection(3)}><i className="fa-solid fa-sun"></i>Weather</button>
                <button className='park-nav-btn' onClick={() => setActiveSection(4)}><i className="fa-solid fa-clock"></i>Hours</button>
                <button className='park-nav-btn' onClick={() => setActiveSection(5)}><i className="fa-solid fa-pencil"></i>Topics</button>
            </nav>
            <main className='park-container'>
                <section className='park-section park-overview active'>
                    <h2 className='park-section-title'>Overview</h2>
                    <p className='park-section-paragraph'>&emsp;&emsp;{park.description}</p>
                    <p className='park-section-paragraph'><strong>Location: </strong>{park.states.split(',').map(state => getStateFullName(state)).join(', ')}</p>
                    <div className='park-img-container'>
                        <div className='park-img'>
                            <ManualSlideshow images={park.images} />
                        </div>
                    </div>
                </section>
                <section className='park-section'>
                    <h2 className='park-section-title'>Things to Do</h2>
                    <ul className='activities-list'>
                        {park.activities.map((activity, index) => {
                            return <li className='activity-item' key={index}>{activity.name}</li>
                        })}
                    </ul>
                </section>
                <section className='park-section'>
                    <h2 className='park-section-title'>Tickets & Fees</h2>
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
                <section className='park-section'>
                    <h2 className='park-section-title'>Weather <WeatherFormatToggler /></h2>
                    <div className='park-weather'>
                        <div className='weather-general-and-current'>
                            <div className='weather-general-container'>
                                <h3>General</h3>
                                <p className='weather-general-content'>&emsp;&emsp;{park.weatherInfo}</p>
                            </div>
                            <WeatherCurrent lat={park.latitude} lng={park.longitude} />
                        </div>
                        <WeatherForecast lat={park.latitude} lng={park.longitude} />
                    </div>
                </section>
                <section className='park-section'>
                    <h2 className='park-section-title'>Hours</h2>
                    {park.operatingHours.map((hours, index) => {
                        if (hours.name === hours.description) {
                            return (
                                <div key={index} className='hours-section'>
                                    <h3>{hours.name.toLowerCase().trim().split(/\s+/).map(word => word[0].toUpperCase() + word.substr(1)).join(' ')}</h3>
                                    <div>
                                        <p><strong>Sunday: </strong>{hours.standardHours.sunday}</p>
                                        <p><strong>Monday: </strong>{hours.standardHours.monday}</p>
                                        <p><strong>Tuesday: </strong>{hours.standardHours.tuesday}</p>
                                        <p><strong>Wednesday: </strong>{hours.standardHours.wednesday}</p>
                                        <p><strong>Thursday: </strong>{hours.standardHours.thursday}</p>
                                        <p><strong>Friday: </strong>{hours.standardHours.friday}</p>
                                        <p><strong>Saturday: </strong>{hours.standardHours.saturday}</p>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={index} className='hours-section'>
                                    <h3>{hours.name.toLowerCase().trim().split(/\s+/).map(word => word[0].toUpperCase() + word.substr(1)).join(' ')}</h3>
                                    <p className='park-section-paragraph'>{hours.description}</p>
                                    <div>
                                        <p><strong>Sunday: </strong>{hours.standardHours.sunday}</p>
                                        <p><strong>Monday: </strong>{hours.standardHours.monday}</p>
                                        <p><strong>Tuesday: </strong>{hours.standardHours.tuesday}</p>
                                        <p><strong>Wednesday: </strong>{hours.standardHours.wednesday}</p>
                                        <p><strong>Thursday: </strong>{hours.standardHours.thursday}</p>
                                        <p><strong>Friday: </strong>{hours.standardHours.friday}</p>
                                        <p><strong>Saturday: </strong>{hours.standardHours.saturday}</p>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </section>
                <section className='park-section'>
                    <h2 className='park-section-title'>Topics</h2>
                    <ul className='activities-list'>
                        {park.topics.map((topic, index) => {
                            return <li className='activity-item' key={index}>{topic.name}</li>
                        })}
                    </ul>
                </section>
            </main>
            <footer className='park-footer'>
                <main>
                    <h3>Contact</h3>
                    <br></br>
                    <div className='park-addresses'>
                        {park.addresses.map((address, index) => {
                            if (address.type.toLowerCase() === 'physical') {
                                return (
                                    <div key={index} className='park-physical-address'>
                                        <p><strong>Physical Address</strong></p>
                                        <p>{address.line1}</p>
                                        <p>{address.line2}</p>
                                        <p>{address.line3}</p>
                                        <p>{address.city}, {address.stateCode} {address.postalCode}</p>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index} className='park-mailing-address'>
                                        <p><strong>Mailing Address</strong></p>
                                        <p>{address.line1}</p>
                                        <p>{address.line2}</p>
                                        <p>{address.line3}</p>
                                        <p>{address.city}, {address.stateCode} {address.postalCode}</p>
                                    </div>
                                );
                            }
                        })}
                        <div className='park-contact-info'>
                            <p><strong>Phone: </strong></p>
                            <p>{park.contacts.phoneNumbers[0].phoneNumber}</p>
                            <br></br>
                            <strong><a target="_blank" rel="noreferrer" href={park.url}>Official Website <i className="fa-solid fa-up-right-from-square"></i></a></strong>
                        </div>
                    </div>
                </main>
            </footer>
        </>
    );
}
