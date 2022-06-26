import Map from '../../components/map/Map.js';
import ExploreTiles from '../../components/exploreTiles/ExploreTiles.js';
import './Explore.css';
import { selectAllParks, selectListParks, selectMapParks, setQuery, selectQuery, selectSort, selectView, selectFilter, filterParks } from '../../features/parks/parksSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import ViewToggler from '../../components/viewToggler/ViewToggler.js';
import FilterPage from '../../components/filterPage/FilterPage.js';
import { useState, useEffect } from 'react';

export default function Explore() {
    
    const [filtersOpen, setFiltersOpen] = useState(false);
    const allParks = useSelector(selectAllParks);
    const listParks = useSelector(selectListParks);
    const mapParks = useSelector(selectMapParks);
    const view = useSelector(selectView);
    const filter = useSelector(selectFilter);
    const query = useSelector(selectQuery);
    const sort = useSelector(selectSort);
    const dispatch = useDispatch();

    const sortCount = (sort !== 'Alphabetical (A-Z)' ? 1 : 0);

    const filterCount = Object.values(filter).map(value => {
        if (value.length === 0) {
            return 0;
        }
        else {
            return 1;
        }
    }).reduce((partialSum, a) => partialSum + a, 0)

    useEffect(() => {
        if (allParks.length > 0) {
            dispatch(filterParks());
        }
    }, [filter, sort, query, dispatch])

    if (view === 'list') {
        return (
            <main className='explore-container'>
                <div className='filter-bar-list'>
                    {query.length > 0 && mapParks.length > 0
                    ?   <p className='search-result-string'>{mapParks.length} search results for "{query}".
                            <br></br>
                            <button className='search-result-clear' onClick={() => dispatch(setQuery(''))}>
                                Clear
                            </button>
                        </p> 
                    :   <></>}
                    {mapParks.length > 0
                    ?   <button className={sort === 'Alphabetical (A-Z)' && Object.values(filter).every(value => value.length === 0) ? 'filter-btn' : 'filter-btn active'} onClick={() => {
                                    setFiltersOpen(true);
                                }}>
                                Sort & Filter {sortCount + filterCount > 0 ? `(${sortCount + filterCount})` : ''}
                        </button>
                    : <></>}
                    
                </div>
                {filtersOpen ? <FilterPage setFiltersOpen={setFiltersOpen} /> : <></>}
                <div className='explore'>
                    <ExploreTiles parks={listParks} />
                </div>
                <ViewToggler />
            </main>
        );
    } else if (view === 'map') {
        return (
            <>
                {query.length > 0 
                    ?   <button className='search-result-clear map' onClick={() => dispatch(setQuery(''))}>
                            <p className='search-result-string map'>
                                Clear
                                <br></br>
                                Results for "{query}"
                            </p> 
                        </button>
                    :   <></>}
                <button className={Object.values(filter).every(value => value.length === 0) ? 'filter-btn map' : 'filter-btn active map'} onClick={() => {
                            setFiltersOpen(true);
                        }}>
                        Filter {filterCount > 0 ? `(${filterCount})` : ''}
                </button>
                {filtersOpen ? <FilterPage setFiltersOpen={setFiltersOpen} /> : <></>}
                <Map parks={mapParks} />
                <ViewToggler />
            </>
        );
    }
}
