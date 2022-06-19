import Map from '../../components/map/Map.js';
import ExploreTiles from '../../components/exploreTiles/ExploreTiles.js';
import './Explore.css';
import { selectListParks, selectMapParks, selectView } from '../../features/parks/parksSlice.js';
import { useSelector } from 'react-redux';
import OptionsBar from '../../components/optionsBar/OptionsBar.js';


export default function Explore() {
    const listParks = useSelector(selectListParks);
    const mapParks = useSelector(selectMapParks);
    const view = useSelector(selectView);

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
