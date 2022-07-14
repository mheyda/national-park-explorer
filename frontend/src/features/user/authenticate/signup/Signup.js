import './Signup.css';
import { Link } from 'react-router-dom';

export default function Signup({ 
    errorMessage,
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleSignup,
}) {

    return (
        <main>
            <h2>Sign up</h2>
            <p>{errorMessage}</p>
            <form onSubmit={handleSignup}>
                <label>Email</label>
                <input type='text' value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Username</label>
                <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label>Password</label>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type='button' onClick={() => setShowPassword(prev => !prev)}>Show Password</button>
                <input type='submit' value='Sign up' />
            </form>
            <p>
                Already have an account?
                <Link to={'/user/login'}> Log in</Link>
            </p>
        </main>
    );
}