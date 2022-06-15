import { useState, useEffect, useRef } from 'react';
import './Slideshow.css';


export default function AutoSlideshow( { images } ) {

    const [imgIndex, setImgIndex] = useState(0);
    const timeoutRef = useRef(null);
    const delay = 3000;


    function resetTimeout() {
        if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        }
    }

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
        () =>
            setImgIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
            ),
        delay
        );

        return () => {
        resetTimeout();
        };
    }, [imgIndex, images.length]);


    return (
        <div className="slideshow">
            <div className="slideshow-slider" style={{ transform: `translate3d(${-imgIndex * 100}%, 0, 0)` }}>
                {images.map((image, index) => (
                    <img key={index} className='slide' src={image.url} alt={image.altText} loading='lazy' />
                ))}
            </div>
            <div className="slideshow-dots">
                {images.map((_, index) => (
                    <div key={index} className={`slideshow-dot${imgIndex === index ? " active" : ""}`} onClick={() => {setImgIndex(index);}}></div>
                ))}
            </div>
        </div>
    );
}
