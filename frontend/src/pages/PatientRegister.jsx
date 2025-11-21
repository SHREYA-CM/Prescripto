import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';   // ✅ use custom axios instance
import './AuthForm.css';

const PatientRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ Correct MERN backend route
            const res = await api.post('/auth/register', formData);

            toast.success("Patient registered ✅");
            navigate('/patient-login');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="auth-container">
            <Toaster position="top-center" />

            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Patient Registration</h2>

                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        onChange={handleChange}
                        value={formData.name}
                    />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        onChange={handleChange}
                        value={formData.email}
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        onChange={handleChange}
                        value={formData.password}
                    />
                </div>

                <button type="submit">Register</button>

                <p className="form-footer">
                    Already have an account? <Link to="/patient-login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default PatientRegister;
