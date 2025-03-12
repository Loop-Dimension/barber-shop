// src/pages/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api/api';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Replace with your API URL
        try {
            const response = await axios.post('http://api.example.com/api/auth/signup', {
                email,
                password,
                name,
                isAdmin: false
            });
            console.log('Signup successful:', response.data);
        } catch (error) {
            console.error('Signup error:', error.response?.data || error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md p-6 rounded">
            <h2 className="text-2xl mb-4">{t('signup')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-1">Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">{t('email')}</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">{t('password')}</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">

                </button>
            </form>
        </div>
    );
}

export default Signup;
