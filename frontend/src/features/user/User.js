import './User.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTokens, selectUsername, refreshTokens, selectRefreshTokensStatus } from './userSlice';
import { Navigate } from 'react-router-dom';


export default function User() {

    const [userInfo, setUserInfo] = useState({});
    const username = useSelector(selectUsername);
    const tokens = useSelector(selectTokens);
    const refreshTokensStatus = useSelector(selectRefreshTokensStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getUserInfo = async (options) => {
        const { tokens, username } = options;
        const response = await fetch(`http://127.0.0.1:8000/user/info?username=${username}`, {
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
        

        if (!response.ok) {
            navigate('/user/login');
            throw Error(response.statusText);
        }

        const userInfo = await response.json();
        setUserInfo(userInfo);
        return;
        
    }

    // Refresh JWT tokens on refresh
    useEffect(() => {
        dispatch(refreshTokens({prevTokens: tokens}));
    }, [dispatch]);

    // Wait until JWT tokens have been refreshed, then get user info
    useEffect(() => {
        if (refreshTokensStatus === 'succeeded' || refreshTokensStatus === 'failed') {
            getUserInfo({
                tokens: tokens, 
                username: username
            });
        }
    }, [dispatch, tokens, refreshTokensStatus])

    return (
        <div>
            {Object.values(userInfo).map(attribute => {
                return <h1>{attribute}</h1>
            })}
        </div>
    );
}