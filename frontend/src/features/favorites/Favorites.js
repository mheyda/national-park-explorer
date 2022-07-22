import './Favorites.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParks } from '../explore/exploreSlice';
import { selectFavorites, selectFavoritesStatus, selectToggleStatus, getFavorites, setToggleStatus } from './favoritesSlice';
import ExploreTile from '../explore/exploreList/ExploreTile';


export default function Favorites() {

    const allParks = useSelector(selectAllParks);
    const favoriteIds = useSelector(selectFavorites);
    const [favoriteParks, setFavoriteParks] = useState([]);
    const favoritesStatus = useSelector(selectFavoritesStatus);
    const toggleStatus = useSelector(selectToggleStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Make request to get user's favorites. If not successful, redirect to login page.
    useEffect(() => {
        dispatch(getFavorites());
    }, [])

    // If there was an error getting parks or toggling a park, redirect to login page
    useEffect(() => {
        if (favoritesStatus === 'failed' || toggleStatus === 'failed') {
            navigate('/user/login/');
            dispatch(setToggleStatus('idle'));
        }
    }, [favoritesStatus, toggleStatus])

    // Get favorite parks everytime the user changes their favorites
    useEffect(() => {
        setFavoriteParks(allParks.filter(park => {
            if (favoriteIds.includes(park.id)) {
                return park;
            }
            return;
        }));
    }, [favoriteIds, allParks])

    return (
        <main className='favorites-main'>
            <h2>Favorites</h2>
            <ul className='explore-tiles'>
                {favoriteParks.map((park, index) => {
                    return <ExploreTile key={index} park={park}  />
                })}
            </ul>
        </main>
    );
}
