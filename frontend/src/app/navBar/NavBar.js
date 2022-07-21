import { useEffect, useState } from 'react';
import HeaderNav from './headerNav/HeaderNav.js';
import FooterNav from './footerNav/FooterNav.js';
import { makeRequest, refreshTokens } from '../../makeRequest.js';


export default function NavBar() {
    
    const [userNavOpen, setUserNavOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    // Check user authentication
    useEffect(() => {
        const checkAuth = async () => {
            const loggedIn = await refreshTokens();
            setLoggedIn(loggedIn);
        }
        checkAuth();
    }, []);

    const handleLogout = async () => {
        const logout = await makeRequest({
            urlExtension: 'blacklist/',
            method: 'POST',
            body: {
                'refresh': JSON.parse(localStorage.getItem("tokens")).refresh
            },
            authRequired: false,
        })
        if (logout.error) {
            alert('Sorry! Something went wrong.');
        } else {
            localStorage.removeItem("tokens");
            window.location.href = '/user/login';
        }
    }

    return (
        <>
            <HeaderNav loggedIn={loggedIn} handleLogout={handleLogout} userNavOpen={userNavOpen} setUserNavOpen={setUserNavOpen} />
            <FooterNav loggedIn={loggedIn} handleLogout={handleLogout} />
        </>
    );
}
