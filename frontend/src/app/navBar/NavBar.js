import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoggedIn } from '../../features/user/userSlice.js';
import HeaderNav from './headerNav/HeaderNav.js';
import FooterNav from './footerNav/FooterNav.js';


export default function NavBar() {
    
    const [userNavOpen, setUserNavOpen] = useState(false);
    const loggedIn = useSelector(selectLoggedIn);
    const navigate = useNavigate();

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
            navigate('/user/login');
            window.location.reload();
        }
        return;
    }

    const handleLogout = () => {
        setUserNavOpen(false)
        logout();
    }

    return (
        <>
            <HeaderNav loggedIn={loggedIn} handleLogout={handleLogout} userNavOpen={userNavOpen} setUserNavOpen={setUserNavOpen} />
            <FooterNav loggedIn={loggedIn} handleLogout={handleLogout} />
        </>
    );
}
