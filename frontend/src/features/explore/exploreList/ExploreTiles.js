import ExploreTile from './ExploreTile.js';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNextParks } from '../exploreSlice';
import { useInView } from 'react-intersection-observer';

export default function ExploreTiles( { parks } ) {

    const dispatch = useDispatch();
    const intervalParksStatus = useSelector(state => state.explore.intervalParksStatus);

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

    if (parks && parks.length > 0) {
        return (
            <>
                <ul className='explore-tiles'>
                    {parks.map((park, index) => {
                        return <ExploreTile key={index} park={park} />
                    })}
                </ul>
                <div ref={ref} >{/* End of list... get more park tiles */}</div>
            </>
        );
    } else {
        return (
            intervalParksStatus === 'succeeded'
            ? <>Sorry! Nothing matched your search.</>
            : <>Loading parks...</>
        );
    }

}
