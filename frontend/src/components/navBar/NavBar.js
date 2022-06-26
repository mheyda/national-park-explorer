import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setQuery } from '../../features/parks/parksSlice.js';
import SearchBar from '../searchBar/SearchBar';
import './NavBar.css';

export default function NavBar() {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate('/');
        const query = e.target.queryTerm.value;
        dispatch(setQuery(query));
    }

    return (
        <nav className='navbar-container'>
                <div className='navbar'>
                    <div className='options-bar'>
                        <Link className='nav-logo' to={'/'}>
                            <img src={require('../../assets/images/nps-logo.png')} alt={'National Park Service Logo'} />
                        </Link>
                        <p className='nav-title'>National<br></br>Park<br></br>Explorer</p>
                        <SearchBar handleSearch={handleSearch} />
                    </div>
            </div>
        </nav>
    );
}
