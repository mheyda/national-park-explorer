

export default function WeatherCurrentLoading() {


    return (
        <div className='weather-current-container'>
            <i className="weather-loading-icon fa-solid fa-sun"></i>
            <p className='weather-current-temp-main'>--</p>
            <p>Loading Weather...</p>
            <p>H: -- | L: --</p>
        </div>
    );
}
