import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTokens, refreshTokens, selectRefreshTokensStatus } from '../user/userSlice';
import { selectAllParks } from '../explore/exploreSlice';


export default function Favorites() {

    const allParks = useSelector(selectAllParks);
    const [favorites, setFavorites] = useState([]);
    const tokens = useSelector(selectTokens);
    const refreshTokensStatus = useSelector(selectRefreshTokensStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const favoritesAPI = async (options) => {
        const { method, tokens, parkId } = options;

        try {
            const response = await fetch(`http://127.0.0.1:8000/user/favorites/`, {
                method: method, // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Authorization': `JWT ${tokens.access}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(parkId),
            });
            

            if (response.ok) {
                const userFavorites = await response.json();
                setFavorites(userFavorites);
                console.log(userFavorites)
                return;
            }

            throw Error(response.statusText);
            
        } catch (error) {
            console.log(error);
            navigate('/');
        }
    }

    // Check user authentication to access this page
    useEffect(() => {
        dispatch(refreshTokens({prevTokens: tokens}));
    }, [dispatch]);

    // If user is authenticated, show them their favorite parks. Otherwise redirect to login page
    useEffect(() => {
        if (refreshTokensStatus === 'succeeded') {
            favoritesAPI({method: 'GET', tokens: tokens})
        } else if (refreshTokensStatus === 'failed') {
            navigate('/user/login');
        }
    }, [dispatch, tokens, refreshTokensStatus])

    const add = () => {
        favoritesAPI({method: 'POST', tokens: tokens, parkId: 'F58C6D24-8D10-4573-9826-65D42B8B83AD'})
    }

    return (
        <main className='my-parks-container'>
            <button onClick={add}>Add</button>
            {allParks.map(park => {
                if (favorites && favorites.length > 0) {
                    return favorites.map((favoriteId, index) => {
                        if (favoriteId === park.id) {
                            return <p key={index}>{park.fullName}</p>;
                        }
                        return;
                    })
                }
            })}
        </main>
    );
}
