import './Authenticate.css';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Login from './login/Login';
import Signup from './signup/Signup';


export default function Authenticate() {

    const { format } = useParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
    }

    const handleSignup = (e) => {
        e.preventDefault();
    }

    if (format === 'login') {
        return (
            <Login 
                username={username} 
                setUsername={setUsername} 
                password={password} 
                setPassword={setPassword} 
                handleLogin={handleLogin} 
            />
        );
    } else {
        return (
            <Signup 
                firstName={firstName} 
                setFirstName={setFirstName} 
                lastName={lastName} 
                setLastName={setLastName}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                handleSignup={handleSignup}
            />
        );
    }
}