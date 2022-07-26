import '../Authenticate.css';
import { Link } from 'react-router-dom';


export default function Login({ 
    usernameError,
    username,
    setUsername, 
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
}) {

    const usernameErrorComponent = usernameError ? <p><i className="fa-solid fa-circle-info"></i> {usernameError}</p> : '';

    return (
        <main className='authenticate-main'>
            <h2>Log in</h2>
            <form onSubmit={handleLogin} className='authenticate-form'>
                <label className='authenticate-form-field'>
                    <span>Username</span>
                    <br></br>
                    <input className='authenticate-form-input' type='text' value={username} onChange={(e) => setUsername(e.target.value)} required />
                    {usernameErrorComponent}
                </label>
                <label className='authenticate-form-field'>
                    <span>Password</span>
                    <br></br>
                    <div className='authenticate-form-input-container'>
                        <input className='authenticate-form-input password' type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button className='authenticate-show-password' type='button' onClick={() => setShowPassword(prev => !prev)}>
                            {password.length > 0 ?
                            <i className={showPassword ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}></i> :
                            <></>
                            }
                        </button>
                    </div>
                </label>
                <button type='submit'>Log in</button>
            </form>
            <p className='authenticate-toggle-format'>
                <span>Don't have an account yet? </span>
                <Link className='underline' to={'/user/signup'}>Sign up</Link>
            </p>
        </main>
    );
}