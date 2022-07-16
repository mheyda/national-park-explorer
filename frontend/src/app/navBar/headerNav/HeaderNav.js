import { Link } from 'react-router-dom';
import SearchBar from '../../../features/explore/exploreSearch/SearchBar.js';
import './HeaderNav.css';


export default function HeaderNav({ loggedIn, handleLogout, userNavOpen, setUserNavOpen }) {

    return (
        <nav className='header-nav-container'>
            <div className='header-nav'>
                <Link className='header-nav-logo' to={'/'}>
                    <img src={require('../../../assets/images/nps-logo.png')} alt={'National Park Service Logo'} />
                </Link>
                <p className='header-nav-title'>National<br></br>Park<br></br>Explorer</p>
                <SearchBar />
                <button className='header-nav-toggler' type='button' onClick={() => setUserNavOpen(prev => !prev)} >
                    <i className="fa-solid fa-bars"></i>
                    <i className="fa-solid fa-user"></i>
                </button>
                {userNavOpen
                    ?
                    <div className='header-nav-content'>
                        {loggedIn
                        ?
                        <>
                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'/'}>Explore</Link>
                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user'}>My Profile</Link>
                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user/favorites'}>Favorites</Link>
                            <button onClick={handleLogout} className='header-nav-link'>Log out</button>
                        </>
                        :
                        <>
                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user/signup'}>Sign up</Link>
                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user/login'}>Log in</Link>
                        </>}
                    </div>
                    :
                    <></>
                }
            </div>
        </nav>
    );
}