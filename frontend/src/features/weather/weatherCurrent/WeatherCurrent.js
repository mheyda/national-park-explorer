import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeather, selectWeather } from '../weatherSlice.js';
import './WeatherCurrent.css';
import WeatherCurrentDisplay from './WeatherCurrentDisplay.js';
import WeatherCurrentLoading from './WeatherCurrentLoading.js';

export default function WeatherCurrent( { lat, lng } ) {

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
        return (<WeatherCurrentDisplay weather={weather} />);
    }
    else {
        return (<WeatherCurrentLoading />);
    }
}
