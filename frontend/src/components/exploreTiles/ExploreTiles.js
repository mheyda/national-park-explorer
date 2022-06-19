import ExploreTile from './ExploreTile.js';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function ExploreTiles( { parks } ) {

    const interval = 12;
    const [currentParks, setCurrentParks] = useState(parks.slice(0, interval))
    const [end, setEnd] = useState(interval);

    const { ref, inView } = useInView({
        threshold: 0,
    })

    useEffect(() => {
        setCurrentParks(parks.slice(0, end + interval))
        setEnd(end + interval);
    }, [inView])

    if (parks && parks.length > 0) {
        return (
            <>
                <ul className='explore-tiles'>
                    {currentParks.map((park, index) => {
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
