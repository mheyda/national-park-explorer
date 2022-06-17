import { useState, useEffect, useRef } from 'react';
import './Slideshow.css';


export default function AutoSlideshow( { images } ) {

    const [imgIndex, setImgIndex] = useState(0);
    const [dotsStyling, setDotsStyling] = useState({ transform: 'translateX(0px)', transition: '0.8s' })
    const timeoutRef = useRef(null);
    const delay = 4000;


    function resetTimeout() {
        if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        }
    }

    // Set timer for slide change
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

    // Logic for slideshow dot carousel
    useEffect(() => {
        if (images.length > 4) {
            console.log("Index: " + imgIndex)
            if (imgIndex > 1 && imgIndex < images.length - 2) {
                console.log('greater than 2')
                setDotsStyling({ transform: `translateX(calc(${-imgIndex  * 22}px + 44px))`, transition: '0.8s' });
            } else if (imgIndex === 0) {
                console.log('equals zero')
                setDotsStyling({ transform: 'translateX(0px)', transition: '0.8s' });
            }
            else if (imgIndex === images.length - 1) {
                console.log('last slide')
                setDotsStyling({ transform: `translateX(calc(${-imgIndex * 22}px + 88px))`, transition: '0.8s'})
            }
        }
    }, [imgIndex, images.length])

    return (
        <div className='slideshow'>
            <div className='slideshow-btns'>
                <i className='slideshow-left fa-solid fa-circle-arrow-left' onClick={(e) => {imgIndex === 0 ? setImgIndex(images.length - 1) : setImgIndex(imgIndex - 1); e.preventDefault()}}></i>
                <i className="slideshow-right fa-solid fa-circle-arrow-right" onClick={(e) => {imgIndex === images.length - 1 ? setImgIndex(0) : setImgIndex(imgIndex + 1); e.preventDefault()}}></i>
            </div>
            <div className="slides" >
                {images.map((image, index) => (
                    <img className='slide' key={index} src={image.url} alt={image.altText} style={{ transform: `translateX(${-imgIndex * 100}%)`, transition: '0.8s' }} loading='lazy' />
                ))}
            </div>
            <div className='slideshow-dots-container'>
                <div className="slideshow-dots" style={dotsStyling} >
                    {images.map((_, index) => (
                        <div key={index} className={`slideshow-dot${imgIndex === index ? " active" : ""}`} onClick={() => {setImgIndex(index);}}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
