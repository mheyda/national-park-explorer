import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeather, selectWeather } from '../weatherSlice.js';
import './Weather7Day.css';
import Weather7DayDisplay from './Weather7DayDisplay.js';
import Weather7DayLoading from './Weather7DayLoading.js';

export default function Weather7Day( { lat, lng } ) {

    const dispatch = useDispatch();
    const weather = useSelector(selectWeather);
    const weatherStatus = useSelector(state => state.weather.status);

    // Get weather to begin with
    useEffect(() => {
        if (weatherStatus === 'idle') {
          dispatch(fetchWeather({lat: lat, lng: lng}));
        }
    }, [weatherStatus, dispatch, lat, lng])

    // Get weather when latitude and longitude changes
    useEffect(() => {
        dispatch(fetchWeather({lat: lat, lng: lng}))
    }, [dispatch, lat, lng])


    if (weatherStatus === 'succeeded') {
        return (<Weather7DayDisplay weather={weather} />);
    }
    else {
        return (<Weather7DayLoading />);
    }
}