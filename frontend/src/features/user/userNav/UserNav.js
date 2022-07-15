import { useState } from 'react';
import { Link } from 'react-router-dom';
import { selectLoggedIn, setTokens } from '../userSlice';
import { useDispatch, useSelector } from 'react-redux';
import './UserNav.css';

export default function UserNav() {

    const [userNavOpen, setUserNavOpen] = useState(false);
    const loggedIn = useSelector(selectLoggedIn);
    const dispatch = useDispatch();

    const logout = async () => {
        const response = await fetch('http://127.0.0.1:8000/blacklist/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({
                'refresh': JSON.parse(localStorage.getItem("tokens")).refresh
            })
        });

        if (!response.ok) {
            console.log(response.status + ": " + response.statusText)
        } else {
            localStorage.removeItem("tokens");
            dispatch(setTokens({access: null, refresh: null}));
            window.location.reload();
        }
        return;
    }

    const handleLogout = () => {
        logout();
    }

    return (
        <div className='user-nav'>
            <button className='user-nav-toggler' type='button' onClick={() => setUserNavOpen(prev => !prev)} >
                <i className="fa-solid fa-bars"></i>
                <i className="fa-solid fa-user"></i>
            </button>
            {userNavOpen
                ?
                <nav className='user-nav-content'>
                    {loggedIn
                    ?
                    <>
                        <Link onClick={() => setUserNavOpen(false)} className='user-nav-link' to={'user'}>My Profile</Link>
                        <Link onClick={() => setUserNavOpen(false)} className='user-nav-link' to={''}>Favorites</Link>
                        <button onClick={handleLogout} className='user-nav-link'>Log out</button>
                    </>
                    :
                    <>
                        <Link onClick={() => setUserNavOpen(false)} className='user-nav-link' to={'user/signup'}>Sign up</Link>
                        <Link onClick={() => setUserNavOpen(false)} className='user-nav-link' to={'user/login'}>Log in</Link>
                    </>}
                </nav>
                :
                <></>
            }
        </div>
    );
}