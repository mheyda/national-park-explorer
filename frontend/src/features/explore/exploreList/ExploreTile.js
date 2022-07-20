import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { useInView } from 'react-intersection-observer';
import { selectFavorites } from '../../favorites/favoritesSlice';
import { useSelector } from 'react-redux';


export default function ExploreTile( { park, toggleFavorite } ) {

    let states = park.states.split(',').join(', ');
    const statesLength = park.states.split(',').length;
    const favorites = useSelector(selectFavorites);

    if (statesLength > 2) {
        states = states.split(',').slice(0, 3).join(', ') + ', & More'
    }

    // Keep DOM elements to minimum until they are needed / in view
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '0px 0px 100px 0px',
        triggerOnce: true,
    });

    if (inView) {
        return (
            <li className='explore-tile' id={park.fullName} >
                <Link to={`${park.fullName}/${park.parkCode}`} onClick={() => {
                    sessionStorage.setItem('currentPark', JSON.stringify(park));
                }}>
                    <div className='explore-tile-img-container'>
                        <div className='explore-tile-img'>
                            <ManualSlideshow images={park.images} />
                        </div>
                    </div>
                    <div className='explore-tile-content'>
                        <p className='explore-tile-title'>{park.name}<br></br>{park.designation}</p>
                        <p className='explore-tile-states'>{states}</p>
                    </div>
                </Link>
                <button onClick={() => toggleFavorite(park.id)} className='park-toggle-favorite'>
                    {favorites && favorites.includes(park.id) ?
                    <i className="fa-solid fa-heart selected"></i> :
                    <i className="fa-solid fa-heart"></i>}
                </button>
            </li>
        );
    } else {
        return (
            <div ref={ref}></div>
        );
    }
}
