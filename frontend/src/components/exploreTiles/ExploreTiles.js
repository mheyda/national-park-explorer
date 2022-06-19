import ExploreTile from './ExploreTile.js';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchParks } from '../../features/parks/parksSlice';
import { useInView } from 'react-intersection-observer';

export default function ExploreTiles( { parks } ) {

    const dispatch = useDispatch();
    const interval = 6;
    const [start, setStart] = useState(parks.length);

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '0px 0px 200px 0px',
    })

    // When user reaches end of page, fetch more parks
    useEffect(() => {
        dispatch(fetchParks({start: start, limit: interval, sort: 'fullName', stateCode: ''}));
        setStart(start + interval);
    }, [inView, dispatch])

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
            <>Loading parks...</>
        );
    }

}
