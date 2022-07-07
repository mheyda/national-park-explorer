import './Login.css';
import { Link } from 'react-router-dom';


export default function Login({ 
        username,
        setUsername, 
        password,
        setPassword,
        handleLogin,
    }) {

    return (
        <main>
            <h2>Log in</h2>
            <form onSubmit={handleLogin}>
                <label>Username</label>
                <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label>Password</label>
                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type='submit' value='Login' />
            </form>
            <p>
                Don't have an account yet?
                <Link to={'/user/signup'}> Sign up</Link>
            </p>
        </main>
    );
}