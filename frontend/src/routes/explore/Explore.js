import { useEffect } from 'react';
import Map from '../../components/map/Map.js';
import ExploreTiles from '../../components/exploreTiles/ExploreTiles.js';
import './Explore.css';
import { setParks, selectFilteredParks, fetchParks } from '../../features/parks/parksSlice.js';
import { selectView } from '../../features/parks/parksSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import OptionsBar from '../../components/optionsBar/OptionsBar.js';


export default function Explore() {

    const dispatch = useDispatch();
    const filteredParks = useSelector(selectFilteredParks);
    const parksStatus = useSelector(state => state.parks.status)
    const view = useSelector(selectView);

    // Get park data
    useEffect(() => {
            if (parksStatus === 'idle') {
                dispatch(fetchParks());
            }
    }, [parksStatus, dispatch])

    if (view === 'list') {
        return (
            <main className='explore-container'>
                <OptionsBar />
                <div className='explore'>
                    <ExploreTiles parks={filteredParks} />
                </div>
            </main>
        );
    } else if (view === 'map') {
        return (
            <>
                <OptionsBar />
                <Map parks={filteredParks} />
            </>
        );
    }
}
