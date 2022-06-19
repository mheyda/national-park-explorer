import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { selectFilter, fetchAllParks } from '../../features/parks/parksSlice';
import { useDispatch, useSelector } from 'react-redux';
import ManualSlideshow from '../slideShows/ManualSlideshow';
import './Map.css';

export default function Map( { parks }) {

    const dispatch = useDispatch();
    const filter = useSelector(selectFilter);

    useEffect(() => {
        dispatch(fetchAllParks({
            stateCode: filter.stateCode,
        }))
    }, [filter, dispatch])

    return (
        <MapContainer className={'map-container'} center={[38, -97]} zoom={3} scrollWheelZoom={true} maxBounds={[[-90, -360], [90, 360]]} maxBoundsViscosity={1}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {parks && parks.length > 0
            ? parks.map((park, index) => {
                 
                let states = park.states.split(',').join(', ');
                const statesLength = park.states.split(',').length;
             
                if (statesLength > 2) {
                    states = states.split(',').slice(0, 3).join(', ') + ', & More';
                }
                
                return <Marker key={index} position={[park.latitude, park.longitude]} >
                            <Link to={`${park.fullName}/${park.parkCode}`} onClick={() => sessionStorage.setItem('currentPark', JSON.stringify(park))}>
                                <Popup className='popup-container' >
                                    <div className='popup-img-container'>
                                        <ManualSlideshow images={park.images} />
                                    </div>
                                    <div className='popup-content'>
                                        <p className='popup-title'>{park.name}<br></br>{park.designation}</p>
                                        <p className='popup-states'>{states}</p>
                                    </div>
                                </Popup>
                            </Link>
                        </Marker>;
            })
            : <></>}
        </MapContainer>
    );
}
