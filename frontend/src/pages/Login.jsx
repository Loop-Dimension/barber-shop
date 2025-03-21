import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api/api';

function Login() {
    const [email, setEmail] = useState(''); // used as username here
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Using the JWT token obtain endpoint
            const response = await axios.post(`${API_BASE_URL}/api/auth/token/`, {
                username: email,  // If your app expects a username, you can rename the label accordingly.
                password,
            });
            // Store the tokens in localStorage
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || err.message;
            setError(`Error logging in: ${errorMsg}`);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div className="card bg-secondary text-white shadow p-4 rounded" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control bg-dark text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control bg-dark text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
