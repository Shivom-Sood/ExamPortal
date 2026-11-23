import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api.js';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await apiRequest('/api/auth/register', 'POST', form);
            setSuccess('Registered successfully! You can login now.');
            setForm({ name: '', email: '', password: '' });
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    return (
        <div className="card auth-box">
            <h2>Register (Student)</h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success-msg">{success} <Link to="/login">Go to login</Link></div>}

            <form onSubmit={handleSubmit}>
                <label>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />

                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />

                <label>Password (min 6 characters)</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />

                <button type="submit" className="mt" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p className="muted">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;