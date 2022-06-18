import { Link } from 'react-router-dom';
import { useState } from 'react';
import ManualSlideshow from '../slideShows/ManualSlideshow';


export default function ExploreTile( { park } ) {

    const [firstImgLoaded, setFirstImgLoaded] = useState(false);
    let states = park.states.split(',').join(', ');
    const statesLength = park.states.split(',').length;

    if (statesLength > 2) {
        states = states.split(',').slice(0, 3).join(', ') + ', & More'
    }

    if (firstImgLoaded) {
        return (
            <Link to={`${park.fullName}/${park.parkCode}`} onClick={() => sessionStorage.setItem('currentPark', JSON.stringify(park))}>
                <li className='explore-tile' id={park.fullName}>
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
            <li className='explore-tile'>
                <div className='explore-tile-img-container'>
                    <div className='explore-tile-img'>
                        {// put placeholder image here }
                        }
                        <img src={park.images[0].url} onLoad={setFirstImgLoaded((prev) => !prev)} style={{display: 'hidden'}} />
                    </div>
                </div>
                <div className='explore-tile-content'>
                    <p className='explore-tile-title'>-----<br></br>-------</p>
                    <p className='explore-tile-states'>--</p>
                </div>
            </li>
        );
    }
}
