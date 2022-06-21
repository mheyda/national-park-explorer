import Map from '../../components/map/Map.js';
import ExploreTiles from '../../components/exploreTiles/ExploreTiles.js';
import './Explore.css';
import { selectAllParks, selectListParks, selectMapParks, selectQuery, selectSort, selectView, selectFilter, filterParks } from '../../features/parks/parksSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import OptionsBar from '../../components/optionsBar/OptionsBar.js';
import { useEffect } from 'react';

export default function Explore() {
    const allParks = useSelector(selectAllParks);
    const listParks = useSelector(selectListParks);
    const mapParks = useSelector(selectMapParks);
    const view = useSelector(selectView);
    const filter = useSelector(selectFilter);
    const query = useSelector(selectQuery);
    const sort = useSelector(selectSort);
    const dispatch = useDispatch();


    useEffect(() => {
        if (allParks.length > 0) {
            dispatch(filterParks());
        }
    }, [filter, sort, query, dispatch])

    if (view === 'list') {
        return (
            <main className='explore-container'>
                <OptionsBar />
                <div className='explore'>
                    <ExploreTiles parks={listParks} />
                </div>
            </main>
        );
    } else if (view === 'map') {
        return (
            <>
                <OptionsBar />
                <Map parks={mapParks} />
            </>
        );
    }
}
