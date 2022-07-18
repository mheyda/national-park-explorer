import './Authenticate.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectTokens, setTokens, refreshTokens, selectRefreshTokensStatus } from '../userSlice';
import Login from './login/Login';
import Signup from './signup/Signup';
import NotFound from '../../notFound/NotFound';


export default function Authenticate() {

    const { format } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tokens = useSelector(selectTokens);
    const refreshTokensStatus = useSelector(selectRefreshTokensStatus);
    const [checkedAuth, setCheckedAuth] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const authenticate = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/token/obtain/', {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Authorization': "JWT ",
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify({
                    'username': username,
                    'password': password
                })
            });
            
            if (response.ok) {
                const tokens = await response.json(); // JWT Tokens object
                // Set Javascript Web Tokens in state
                dispatch(setTokens(tokens));
                navigate('/user');
                return;
            }

            setErrorMessage('Invalid username or password.');
            setPassword('');
            throw Error("Invalid credentials");

        } catch (error) {
            console.log(error);
        }
    }

    const signup = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/user/create/', {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify({
                    'username': username,
                    'password': password,
                    'email': email
                }) // body data type must match "Content-Type" header
            });

            if (response.ok) {
                authenticate();
            }

            setErrorMessage('Something went wrong. Please try again.');
            setPassword('');
            throw Error(response.statusText);
            
        } catch (error) {
            console.log(error);
        } 
    }

    const handleLogin = (e) => {
        e.preventDefault();
        authenticate();
    }

    const handleSignup = (e) => {
        e.preventDefault();
        signup();
    }

    // Check user authentication
    useEffect(() => {
        dispatch(refreshTokens({prevTokens: tokens}));
    }, [dispatch]);

    // If user is authenticated, show their profile page. Otherwise allow them to login or signup
    useEffect(() => {
        if (refreshTokensStatus === 'succeeded') {
            navigate('/user');
        } else if (refreshTokensStatus === 'failed') {
            setCheckedAuth(true);
        }
    }, [dispatch, tokens, refreshTokensStatus])

    
    if (format === 'login' && checkedAuth) {
        // User wants to login and is not already logged in
        return (
            <Login 
                errorMessage={errorMessage}
                username={username} 
                setUsername={setUsername} 
                password={password} 
                setPassword={setPassword}
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                handleLogin={handleLogin} 
            />
        );
    } else if (format === 'signup' && checkedAuth) {
        // User wants to sign up and is not currently logged in
        return (
            <Signup 
                errorMessage={errorMessage}
                email={email}
                setEmail={setEmail}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                handleSignup={handleSignup}
            />
        );
    } else if (checkedAuth) {
        // URL does not match login or signup
        return (
            <NotFound />
        )
    } else {
        return (
            <main>Loading...</main>
        )
    }
}
