import { useEffect, useState, useRef } from 'react';
import Image from '../image/Image.js';
import './Slideshow.css';


export default function ManualSlideshow( { images } ) {

    const root = useRef(null)
    const [imgIndex, setImgIndex] = useState(0);
    const [dotsStyling, setDotsStyling] = useState({ transform: 'translateX(0px)', transition: '0.8s' })

    useEffect(() => {
        if (images.length > 4) {
            if (imgIndex > 1 && imgIndex < images.length - 2) {
                setDotsStyling({ transform: `translateX(calc(${-imgIndex  * 22}px + 44px))`, transition: '0.8s' });
            } else if (imgIndex === 0) {
                setDotsStyling({ transform: 'translateX(0px)', transition: '0.8s' });
            }
            else if (imgIndex === images.length - 1) {
                setDotsStyling({ transform: `translateX(calc(${-imgIndex * 22}px + 88px))`, transition: '0.8s'})
            }
        }
    }, [imgIndex, images.length])

    return (
        <div className='slideshow' ref={root}>
            <div className='slideshow-btns'>
                <i className='slideshow-left fa-solid fa-circle-arrow-left' onClick={(e) => {imgIndex === 0 ? setImgIndex(images.length - 1) : setImgIndex(imgIndex - 1); e.preventDefault()}}></i>
                <i className="slideshow-right fa-solid fa-circle-arrow-right" onClick={(e) => {imgIndex === images.length - 1 ? setImgIndex(0) : setImgIndex(imgIndex + 1); e.preventDefault()}}></i>
            </div>
            <div className="slides" >
                {images.map((image, index) => (                    
                    <Image className='slide' root={root.current} key={index} src={image.url} alt={image.altText} style={{ transform: `translateX(${-imgIndex * 100}%)`, transition: '0.8s' }} loading='lazy' />
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
