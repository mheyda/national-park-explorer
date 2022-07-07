import './Signup.css';
import { Link } from 'react-router-dom';

export default function Signup({ 
        firstName,
        setFirstName,
        lastName,
        setLastName,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        handleSignup,
    }) {

    return (
        <main>
            <h2>Sign up</h2>
            <form onSubmit={handleSignup}>
                <label>First Name</label>
                <input type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <label>Last Name</label>
                <input type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} required />
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