import { useState } from 'react';
import './Slideshow.css';


export default function ManualSlideshow( { images } ) {

    const [imgIndex, setImgIndex] = useState(0);

    return (
        <div className={'slideshow'}>
            <div className='slideshow-btns'>
                <i className='slideshow-left fa-solid fa-circle-arrow-left' onClick={(e) => {imgIndex === 0 ? setImgIndex(images.length - 1) : setImgIndex(imgIndex - 1); e.preventDefault()}}></i>
                <i className="slideshow-right fa-solid fa-circle-arrow-right" onClick={(e) => {imgIndex === images.length - 1 ? setImgIndex(0) : setImgIndex(imgIndex + 1); e.preventDefault()}}></i>
            </div>
            <div className="slideshow-slider" style={{ transform: `translate3d(${-imgIndex * 100}%, 0, 0)` }}>
                {images.map((image, index) => (
                    <img key={index} className={'slide'} src={image.url} alt={image.altText} loading='lazy' />
                ))}
            </div>
        </div>
    );
}
