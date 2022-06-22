import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setQuery } from '../../features/parks/parksSlice.js';
import SearchBar from '../searchBar/SearchBar';
import FilterPage from '../filterPage/FilterPage.js';
import './NavBar.css';

export default function NavBar() {
    
    const dispatch = useDispatch();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = e.target.queryTerm.value;
        dispatch(setQuery(query));
    }

    const toggleSearchBar = () => {
        const searchBar = document.querySelector('.search-bar');
        const searchToggler = document.querySelector('.search-toggler');
        if (searchBar.style.animationName === 'openSearch'){
            searchBar.style.animation = 'closeSearch 0.3s forwards';
            searchToggler.querySelector('i').classList.remove('fa-arrow-up');
            searchToggler.querySelector('i').classList.add('fa-magnifying-glass');
        } else {
            searchBar.style.animation = 'openSearch 0.3s forwards';
            searchToggler.querySelector('i').classList.remove('fa-magnifying-glass');
            searchToggler.querySelector('i').classList.add('fa-arrow-up');
        }
    }

    return (
        <nav className='navbar-container'>
                <div className='navbar'>
                    <div className='options-bar'>
                        <Link className='nav-logo' to={'/'}>
                            <img src={require('../../assets/images/nps-logo.png')} alt={'National Park Service Logo'} />
                        </Link>
                        <p className='nav-title'>National<br></br>Park<br></br>Explorer</p>
                        <button className='options-btn' onClick={() => {
                            setFiltersOpen(true);
                        }}>
                            <i className="fa-solid fa-filter"></i>
                        </button>
                        <button className='options-btn search-toggler' onClick={toggleSearchBar}><i className="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                    <SearchBar handleSearch={handleSearch} />
                    {filtersOpen ? <FilterPage setFiltersOpen={setFiltersOpen} /> : <></>}
            </div>
        </nav>
    );
}
