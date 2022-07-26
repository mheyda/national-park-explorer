import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { selectFavorites, toggleFavorite } from '../../favorites/favoritesSlice';
import './ExploreMap.css';

export default function ExploreMap( { parks }) {

    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();

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
                            <Popup className='popup-container' >
                                <Link to={`${park.fullName}/${park.parkCode}`} onClick={() => sessionStorage.setItem('currentPark', JSON.stringify(park))}>
                                    <div className='popup-img-container'>
                                        <ManualSlideshow images={park.images} />
                                    </div>
                                    <div className='popup-content'>
                                        <p className='popup-title'>{park.name}<br></br>{park.designation}</p>
                                        <p className='popup-states'>{states}</p>
                                    </div>
                                </Link>
                                <button onClick={() => dispatch(toggleFavorite({id: park.id}))} className='park-toggle-favorite'>
                                    {favorites && favorites.includes(park.id) ?
                                    <i className="fa-solid fa-heart selected"></i> :
                                    <i className="fa-solid fa-heart"></i>}
                                </button>
                            </Popup>
                        </Marker>;
            })
            : <></>}
        </MapContainer>
    );
}
