import ExploreTile from './ExploreTile.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNextParks } from '../exploreSlice';
import { useInView } from 'react-intersection-observer';

export default function ExploreTiles( { parks, toggleFavorite } ) {

    const dispatch = useDispatch();

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '0px 0px 100px 0px',
    })

    useEffect(() => {
        setTimeout(() => {
            if (parks && parks.length > 0 && inView) {
                dispatch(getNextParks());
            }
        }, 100)
    }, [inView, dispatch, parks])

    return (
        <>
            <ul className='explore-tiles'>
                {parks.map((park, index) => {
                    return <ExploreTile key={index} toggleFavorite={toggleFavorite} park={park} />
                })}
            </ul>
            <div ref={ref} >{/* End of list... get more park tiles */}</div>
        </>
    );
}
