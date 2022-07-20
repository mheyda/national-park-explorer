import '../Authenticate.css';
import { Link } from 'react-router-dom';

export default function Signup({ 
    emailError,
    usernameError,
    passwordError,
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

    const emailErrorComponent = emailError ? <p><i className="fa-solid fa-circle-info"></i> {emailError}</p> : '';
    const usernameErrorComponent = usernameError ? <p><i className="fa-solid fa-circle-info"></i> {usernameError}</p> : '';
    const passwordErrorComponent = passwordError ? <p><i className="fa-solid fa-circle-info"></i> {passwordError}</p> : '';

    return (
        <main className='authenticate-main'>
            <h2>Sign up</h2>
            <form onSubmit={handleSignup} className='authenticate-form'>
                <label className='authenticate-form-field'>
                    <span>Email</span>
                    <br></br>
                    <input className='authenticate-form-input' type='text' value={email} onChange={(e) => setEmail(e.target.value)} required />
                    {emailErrorComponent}
                </label>
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
                    {passwordErrorComponent}
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