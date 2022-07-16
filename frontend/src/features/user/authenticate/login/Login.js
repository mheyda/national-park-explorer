import '../Authenticate.css';
import { Link } from 'react-router-dom';


export default function Login({ 
    errorMessage,
    username,
    setUsername, 
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
}) {

    return (
        <main className='authenticate-main'>
            <h2>Log in</h2>
            <p>{errorMessage}</p>
            <form onSubmit={handleLogin} className='authenticate-form'>
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
                <input type='submit' value='Log in' />
            </form>
            <p className='authenticate-toggle-format'>
                <span>Don't have an account yet? </span>
                <Link className='underline' to={'/user/signup'}>Sign up</Link>
            </p>
        </main>
    );
}