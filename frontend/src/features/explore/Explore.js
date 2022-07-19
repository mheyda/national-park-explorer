import ExploreMap from './exploreMap/ExploreMap.js';
import ExploreTiles from './exploreList/ExploreTiles.js';
import { 
    selectListParks, 
    selectMapParks, 
    setQuery, 
    selectError, 
    selectQuery, 
    selectSort, 
    selectView, 
    selectFilter, 
} from './exploreSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import ViewToggler from './ViewToggler.js';
import FilterPage from './exploreFilter/FilterPage.js';
import { useState } from 'react';
import './Explore.css';

export default function Explore() {
    
    const [filtersOpen, setFiltersOpen] = useState(false);
    const listParks = useSelector(selectListParks);
    const mapParks = useSelector(selectMapParks);
    const view = useSelector(selectView);
    const filter = useSelector(selectFilter);
    const query = useSelector(selectQuery);
    const sort = useSelector(selectSort);
    const intervalParksStatus = useSelector(state => state.explore.intervalParksStatus);
    const error = useSelector(selectError);
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

    const toggleFavorite = (e) => {
        console.log(e.target.parentElement.value)
    }

    // If an error occured while fetching the parks
    if (error) {
        return (
            <main>Sorry! Something went wrong.</main>
        )
    }

    // If no errors occured while fetching data
    else {
        if (mapParks && mapParks.length > 0) {
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
                            <ExploreTiles toggleFavorite={toggleFavorite} parks={listParks} />
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
                        <ExploreMap toggleFavorite={toggleFavorite} parks={mapParks} />
                        <ViewToggler />
                    </>
                );
            }
        }
        else if (intervalParksStatus === 'idle') {
            return (
                <main>Loading parks...</main>
            );
        }
        else if (intervalParksStatus === 'success') {
            return (
                <main>Sorry! Nothing matched your search.</main>
            );
        }
    }
}
