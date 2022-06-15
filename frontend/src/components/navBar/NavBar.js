import { Link } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {


    return (
        <nav className='navbar-container'>
            <div className='navbar'>
                <div className='nav-content'>
                    <img className='nav-logo' src={require('../../assets/images/nps-logo.png')} alt={'National Park Service Logo'} />
                    <h1 className='nav-title'>National Park Explorer</h1>
                </div>
                {
                /* For future use when favorites functionality is implemented
                <div className='nav-links'>
                    <Link className='nav-link' to={'explore'} >Explore</Link>
                    <Link className='nav-link' to={'my-parks'} >Favorites</Link>
                </div>
                */
                }
            </div>
        </nav>
    );
}
