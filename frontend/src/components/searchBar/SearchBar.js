import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectQuery } from '../../features/parks/parksSlice';

export default function SearchBar({ handleSearch }) {

    const query = useSelector(selectQuery);

    const [currentQuery, setCurrentQuery] = useState(query);

    return (
        <form onSubmit={handleSearch}>
            <input type='text' id='queryTerm' value={currentQuery} onChange={(e) => setCurrentQuery(e.target.value)} placeholder='Search' />
            <input type='submit' />
        </form>  
    );
}
