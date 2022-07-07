import { useState } from 'react';
import { Link } from 'react-router-dom';
import './UserNav.css';

export default function UserNav() {

    const [userNavOpen, setUserNavOpen] = useState(false);

    if (userNavOpen) {
        return (
            <>
                <button type='button' onClick={() => setUserNavOpen(prev => !prev)} >
                    <i className="fa-solid fa-user"></i>
                </button>
                <nav>
                    <Link to={'user/signup'} onClick={() => setUserNavOpen(false)}>Sign up</Link>
                    <Link to={'user/login'} onClick={() => setUserNavOpen(false)}>Log in</Link>
                </nav>
            </>
        );
    } else {
        return (
            <>
                <button type='button' onClick={() => setUserNavOpen(prev => !prev)} >
                    <i className="fa-solid fa-user"></i>
                </button>
            </>
        );
    }
}