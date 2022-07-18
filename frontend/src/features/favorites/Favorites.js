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

    const getFavorites = async (tokens) => {
        try{
            const response = await fetch(`http://127.0.0.1:8000/user/favorites`, {
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
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
            getFavorites(tokens);
        } else if (refreshTokensStatus === 'failed') {
            navigate('/user/login');
        }
    }, [dispatch, tokens, refreshTokensStatus])

    return (
        <main className='my-parks-container'>
            {allParks.map(park => {
                return favorites.map((favoriteId, index) => {
                    if (favoriteId === park.id) {
                        return <p key={index}>{park.fullName}</p>;
                    }
                    return;
                })
            })}
        </main>
    );
}
