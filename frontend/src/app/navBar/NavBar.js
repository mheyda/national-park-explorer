import { Link } from 'react-router-dom';
import SearchBar from '../../features/explore/exploreSearch/SearchBar.js';
import UserNav from '../../features/user/userNav/UserNav';
import './NavBar.css';

export default function NavBar() {
    
    return (
        <>
            <nav className='header-nav-container'>
                <div className='header-nav'>
                    <Link className='nav-logo' to={'/'}>
                        <img src={require('../../assets/images/nps-logo.png')} alt={'National Park Service Logo'} />
                    </Link>
                    <p className='nav-title'>National<br></br>Park<br></br>Explorer</p>
                    <SearchBar />
                    <UserNav />
                </div>
            </nav>
            <nav className='footer-nav-container'>
                <div className='footer-nav'>
                    <Link to={'/'}>
                        <i className="fa-solid fa-earth-americas"></i>
                        <br></br>
                        <span>Explore</span>
                    </Link>
                    <Link to={'/'}>
                        <i className="fa-solid fa-heart"></i>
                        <br></br>
                        <span>Favorites</span>
                    </Link>
                    <Link to={'/'}>
                        <i className="fa-solid fa-user"></i>
                        <br></br>
                        <span>Profile</span>
                    </Link>
                </div>
            </nav>
        </>
    );
}
