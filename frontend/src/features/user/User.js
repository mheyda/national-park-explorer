import './User.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeRequest } from '../../makeRequest';


export default function User() {

    const [userInfo, setUserInfo] = useState({});
    const [newUserInfo, setNewUserInfo] = useState(userInfo);
    const [checkedAuth, setCheckedAuth] = useState(false);
    const [editingUserInfo, setEditingUserInfo] = useState(false);
    const navigate = useNavigate();

    // Make request to get user's info. If they are not logged in, redirect to login page.
    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await makeRequest({
                urlExtension: 'user/info/',
                method: 'GET',
                body: null,
                authRequired: true,
            });
            if (userInfo.error) {
                navigate('/user/login');
            } else {
                setUserInfo(userInfo.data);
                setNewUserInfo(userInfo.data);
                setCheckedAuth(true);
            }
        }
        getUserInfo();
    }, [])

    if (checkedAuth && editingUserInfo) {
        return (
            <main>
                <button onClick={() => {
                        setEditingUserInfo(false);
                        setNewUserInfo(userInfo);
                    }}>
                    Cancel
                </button>
                <button>Save</button>
                <p>
                    <label>
                        <span>Username: </span>
                        <input type='text' value={newUserInfo.username} disabled />
                    </label>  
                </p>
                <p>
                    <label>
                        <span>Email Address: </span>
                        <input type='text' value={newUserInfo.email} disabled />
                    </label>
                </p>
                <p>
                    <label>
                        <span>First Name: </span>
                        <input type='text' value={newUserInfo.first_name} onChange={(e) => setNewUserInfo({...newUserInfo, first_name: e.target.value})} />
                    </label>
                    <label>
                        <span>Last Name: </span>
                        <input type='text' value={newUserInfo.last_name} onChange={(e) => setNewUserInfo({...newUserInfo, last_name: e.target.value})} />
                    </label>
                </p>
                <p>
                    <label>
                        <span>Birthdate: </span>
                        <input type='text' value={newUserInfo.birthdate} onChange={(e) => setNewUserInfo({...newUserInfo, birthdate: e.target.value})} />
                    </label>
                </p>
            </main>
        );
    } else if (checkedAuth) {
        return (
            <main>
                <button onClick={() => setEditingUserInfo(true)}>Edit</button>
                <p>
                    <label>
                        <span>Username: </span>{userInfo.username}
                    </label>        
                </p>
                <p>
                    <label>
                        <span>Email Address: </span>{userInfo.email}
                    </label>   
                </p>
                <p>
                    <label>
                        <span>First Name: </span>{userInfo.first_name}
                    </label>
                    <label>
                        <span>Last Name: </span>{userInfo.last_name}
                    </label>
                </p>
                <p>
                    <label>
                        <span>Birthdate: </span>{userInfo.birthdate}
                    </label>   
                </p>
            </main>
        );
    }
    
}