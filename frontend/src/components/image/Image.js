import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import './Image.css';

export default function Image({ src, alt, style, className, root }) {

    const { ref, inView } = useInView({
        threshold: 0,
        root: root,
        //rootMargin: '0px 5px 0px 5px'
    });

    const [isLoading, setIsLoading] = useState(true);

    const [hasBeenViewed, setHasBeenViewed] = useState(false);

    useEffect(() => {
        if (inView) {
            setHasBeenViewed(true);
        }
    }, [inView]);

    return (
        <div className={className} ref={ref} style={style} >
            <img className='slide-img' src={hasBeenViewed ? src : null} alt={alt} onLoad={() => setIsLoading(false)} onError={() => setIsLoading(false)} style={isLoading ? { display: 'none' } : { display: 'block' }} />
        </div>
    );
}
