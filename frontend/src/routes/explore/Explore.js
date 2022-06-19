import Map from '../../components/map/Map.js';
import ExploreTiles from '../../components/exploreTiles/ExploreTiles.js';
import './Explore.css';
import { selectParks } from '../../features/parks/parksSlice.js';
import { selectView } from '../../features/parks/parksSlice.js';
import { useSelector } from 'react-redux';
import OptionsBar from '../../components/optionsBar/OptionsBar.js';


export default function Explore() {
    const parks = useSelector(selectParks);
    const view = useSelector(selectView);

    if (view === 'list') {
        return (
            <main className='explore-container'>
                <OptionsBar />
                <div className='explore'>
                    <ExploreTiles parks={parks} />
                </div>
            </main>
        );
    } else if (view === 'map') {
        return (
            <>
                <OptionsBar />
                <Map parks={parks} />
            </>
        );
    }
}
