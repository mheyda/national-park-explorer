import { Link } from 'react-router-dom';
import SearchBar from '../../features/explore/exploreSearch/SearchBar.js';
import './NavBar.css';

export default function NavBar() {
    
    return (
        <nav className='navbar-container'>
                <div className='navbar'>
                    <div className='options-bar'>
                        <Link className='nav-logo' to={'/'}>
                            <img src={require('../../assets/images/nps-logo.png')} alt={'National Park Service Logo'} />
                        </Link>
                        <p className='nav-title'>National<br></br>Park<br></br>Explorer</p>
                        <SearchBar />
                    </div>
            </div>
        </nav>
    );
}
