import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParks } from '../explore/exploreSlice';
import { selectFavorites, setFavorites } from './favoritesSlice';
import makeRequest from '../../makeRequest';


export default function Favorites() {

    const allParks = useSelector(selectAllParks);
    const favorites = useSelector(selectFavorites);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Make request to get user's favorites. If not successful, redirect to login page.
    useEffect(() => {
        const getFavorites = async () => {
            const favorites = await makeRequest({ urlExtension: 'user/favorites/', method: 'GET', body: null });
            if (favorites.error) {
                navigate('/user/login')
            } else {
                dispatch(setFavorites(favorites.data));
            }
        }
        getFavorites();
    }, [])

    return (
        <main className='my-parks-container'>
            {allParks.map(park => {
                if (favorites && favorites.length > 0) {
                    return favorites.map((favoriteId, index) => {
                        if (favoriteId === park.id) {
                            return <p key={index}>{park.fullName}</p>;
                        }
                        return null;
                    })
                }
                return null;
            })}
        </main>
    );
}
