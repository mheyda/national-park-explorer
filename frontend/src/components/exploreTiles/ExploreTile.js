import { Link } from 'react-router-dom';
import ManualSlideshow from '../slideShows/ManualSlideshow';
import { useInView } from 'react-intersection-observer';


export default function ExploreTile( { park } ) {

    let states = park.states.split(',').join(', ');
    const statesLength = park.states.split(',').length;

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
            <Link to={`${park.fullName}/${park.parkCode}`} onClick={() => sessionStorage.setItem('currentPark', JSON.stringify(park))}>
                <li className='explore-tile' id={park.fullName} >
                    <div className='explore-tile-img-container'>
                        <div className='explore-tile-img'>
                            <ManualSlideshow images={park.images} />
                        </div>
                    </div>
                    <div className='explore-tile-content'>
                        <p className='explore-tile-title'>{park.name}<br></br>{park.designation}</p>
                        <p className='explore-tile-states'>{states}</p>
                    </div>
                </li>
            </Link>
        );
    } else {
        return (
            <div ref={ref}></div>
        );
    }
}
