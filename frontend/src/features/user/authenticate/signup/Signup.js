import '../Authenticate.css';
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
        <main className='authenticate-main'>
            <h2>Sign up</h2>
            <p>{errorMessage}</p>
            <form onSubmit={handleSignup} className='authenticate-form'>
                <label className='authenticate-form-field'>
                    <span>Email</span>
                    <br></br>
                    <input className='authenticate-form-input' type='text' value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label className='authenticate-form-field'>
                    <span>Username</span>
                    <br></br>
                    <input className='authenticate-form-input' type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label className='authenticate-form-field'>
                    <span>Password</span>
                    <br></br>
                    <input className='authenticate-form-input password' type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button className='authenticate-show-password' type='button' onClick={() => setShowPassword(prev => !prev)}>
                        {password.length > 0 ?
                        <i className={showPassword ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}></i> :
                        <></>
                        }
                    </button>
                </label>
                <input type='submit' value='Sign up' />
            </form>
            <p className='authenticate-toggle-format'>
                <span>Already have an account? </span>
                <Link className='underline' to={'/user/login'}>Log in</Link>
            </p>
        </main>
    );
}