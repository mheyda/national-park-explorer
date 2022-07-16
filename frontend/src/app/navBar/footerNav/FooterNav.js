import { Link } from "react-router-dom";
import './FooterNav.css';


export default function FooterNav({ loggedIn, handleLogout }) {

    return (
        <nav className='footer-nav-container'>
            <div className='footer-nav'>
                <Link className='footer-nav-link' to={'/'}>
                    <i className="fa-solid fa-earth-americas"></i>
                    <br></br>
                    <span>Explore</span>
                </Link>
                { loggedIn ?
                <>
                    <Link className='footer-nav-link' to={'/user/favorites'}>
                        <i className="fa-solid fa-heart"></i>
                        <br></br>
                        <span>Favorites</span>
                    </Link>
                    <Link className='footer-nav-link' to={'/user'}>
                        <i className="fa-solid fa-user"></i>
                        <br></br>
                        <span>Profile</span>
                    </Link>
                    <button onClick={handleLogout} className='footer-nav-link'>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <br></br>
                        <span>Log out</span>
                    </button>
                </>
                :
                <>
                    <Link className='footer-nav-link' to={'/user/login'}>
                        <i className="fa-solid fa-heart"></i>
                        <br></br>
                        <span>Favorites</span>
                    </Link>
                    <Link className='footer-nav-link' to={'/user/login'}>
                        <i className="fa-solid fa-user"></i>
                        <br></br>
                        <span>Log in</span>
                    </Link>
                </>
                }
            </div>
        </nav>
    );
}