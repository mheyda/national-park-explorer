import './User.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTokens, refreshTokens, selectRefreshTokensStatus } from './userSlice';


export default function User() {

    const [userInfo, setUserInfo] = useState({});
    const [newUserInfo, setNewUserInfo] = useState(userInfo);
    const [editingUserInfo, setEditingUserInfo] = useState(false);
    const tokens = useSelector(selectTokens);
    const refreshTokensStatus = useSelector(selectRefreshTokensStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getUserInfo = async (tokens) => {
        try {
            console.log("Access token: ");
            console.log(tokens);
            const response = await fetch(`http://127.0.0.1:8000/user/info`, {
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
                const userInfo = await response.json();
                setUserInfo(userInfo);
                setNewUserInfo(userInfo);
                console.log(userInfo)
                return;
            }

            throw Error(response.statusText);

        } catch (error) {
            console.log(error);
            navigate('/user/login');
        }
    }

    // Check user authentication to access this page
    useEffect(() => {
        dispatch(refreshTokens({prevTokens: tokens}));
    }, [dispatch]);

    // If user is authenticated, show them their favorite parks. Otherwise redirect to login page
    useEffect(() => {
        if (refreshTokensStatus === 'succeeded') {
            getUserInfo(tokens);
        } else if (refreshTokensStatus === 'failed') {
            navigate('/user/login');
        }
    }, [dispatch, tokens, refreshTokensStatus])

    console.log(newUserInfo)
    console.log(userInfo);

    if (editingUserInfo) {
        return (
            <main>
                <button onClick={() => {
                        setEditingUserInfo(false);
                        setNewUserInfo(userInfo);
                    }}>
                    Cancel
                </button>
                <button>Save</button>
                <p>
                    <label>
                        <span>Username: </span>
                        <input type='text' value={newUserInfo.username} disabled />
                    </label>  
                </p>
                <p>
                    <label>
                        <span>Email Address: </span>
                        <input type='text' value={newUserInfo.email} disabled />
                    </label>
                </p>
                <p>
                    <label>
                        <span>First Name: </span>
                        <input type='text' value={newUserInfo.first_name} onChange={(e) => setNewUserInfo({...newUserInfo, first_name: e.target.value})} />
                    </label>
                    <label>
                        <span>Last Name: </span>
                        <input type='text' value={newUserInfo.last_name} onChange={(e) => setNewUserInfo({...newUserInfo, last_name: e.target.value})} />
                    </label>
                </p>
                <p>
                    <label>
                        <span>Birthdate: </span>
                        <input type='text' value={newUserInfo.birthdate} onChange={(e) => setNewUserInfo({...newUserInfo, birthdate: e.target.value})} />
                    </label>
                </p>
            </main>
        );
    } else {
        return (
            <main>
                <button onClick={() => setEditingUserInfo(true)}>Edit</button>
                <p>
                    <label>
                        <span>Username: </span>{userInfo.username}
                    </label>        
                </p>
                <p>
                    <label>
                        <span>Email Address: </span>{userInfo.email}
                    </label>   
                </p>
                <p>
                    <label>
                        <span>First Name: </span>{userInfo.first_name}
                    </label>
                    <label>
                        <span>Last Name: </span>{userInfo.last_name}
                    </label>
                </p>
                <p>
                    <label>
                        <span>Birthdate: </span>{userInfo.birthdate}
                    </label>   
                </p>
            </main>
        );
    }
    
}