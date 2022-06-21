import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectQuery } from '../../features/parks/parksSlice';
import './SearchBar.css';

export default function SearchBar({ handleSearch }) {

    const query = useSelector(selectQuery);

    const [currentQuery, setCurrentQuery] = useState(query);

    return (
        <form onSubmit={handleSearch} className='search-bar'>
            <input type='text' id='queryTerm' value={currentQuery} onChange={(e) => setCurrentQuery(e.target.value)} placeholder='Search' />
            <button id='submit-search' className='options-btn' type='submit'><i className="fa-solid fa-magnifying-glass"></i></button>
        </form>  
    );
}
