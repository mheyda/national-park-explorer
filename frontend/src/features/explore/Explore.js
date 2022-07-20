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
import { useEffect, useState } from 'react';
import './Explore.css';
import { useNavigate } from 'react-router-dom';
import { selectTokens, refreshTokens, selectRefreshTokensStatus } from '../user/userSlice.js';
import { setFavorites } from '../favorites/favoritesSlice.js';

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
    const navigate = useNavigate();
    const tokens = useSelector(selectTokens);
    const refreshTokensStatus = useSelector(selectRefreshTokensStatus);

    const sortCount = (sort !== 'Alphabetical (A-Z)' ? 1 : 0);

    const favoritesAPI = async (options) => {
        const { method, tokens, parkId } = options;

        try {
            const response = await fetch(`http://127.0.0.1:8000/user/favorites/`, {
                method: method, // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Authorization': `JWT ${tokens.access}`,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(parkId),
            });
            

            if (response.ok) {
                const userFavorites = await response.json();
                dispatch(setFavorites(userFavorites));
                console.log(userFavorites)
                return;
            }

            throw Error(response.statusText);
            
        } catch (error) {
            console.log(error);
            navigate('/user/login');
        }
    }

    const filterCount = Object.values(filter).map(value => {
        if (value.length === 0) {
            return 0;
        }
        else {
            return 1;
        }
    }).reduce((partialSum, a) => partialSum + a, 0)

    const toggleFavorite = (parkId) => {
        favoritesAPI({method: 'POST', tokens: tokens, parkId: parkId});
    }

    // Check user authentication to access this page
    useEffect(() => {
        dispatch(refreshTokens({prevTokens: tokens}));
        // eslint-disable-next-line
    }, [dispatch]);

    // If user is authenticated, show them their favorite parks. Otherwise redirect to login page
    useEffect(() => {
        if (refreshTokensStatus === 'succeeded') {
            favoritesAPI({method: 'GET', tokens: tokens})
        }
        // eslint-disable-next-line
    }, [dispatch, navigate, tokens, refreshTokensStatus])

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
