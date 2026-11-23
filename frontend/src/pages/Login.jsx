import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

// demo accounts from seed.js (password for all: 123456)
const demoAccounts = [
    { label: 'Admin', email: 'admin@examportal.com' },
    { label: 'Teacher', email: 'priya@examportal.com' },
    { label: 'Student', email: 'aman@examportal.com' }
];

const Login = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // already logged in
    if (user) {
        return <Navigate to="/" />;
    }

    // controlled form: every key press updates the state
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiRequest('/api/auth/login', 'POST', form);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <div className="card auth-box">
            <h2>Login</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />

                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />

                <button type="submit" className="mt" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="muted">
                No account? <Link to="/register">Register here</Link>
            </p>

            <hr />
            <p className="muted">Demo accounts (password: 123456)</p>
            <div className="row">
                {demoAccounts.map((account) => (
                    <button
                        key={account.email}
                        type="button"
                        className="secondary"
                        onClick={() => setForm({ email: account.email, password: '123456' })}
                    >
                        {account.label}
                    </button>
                ))}
            </div>
            <p className="muted">
                Note: the free server can take up to 1 minute to wake up on the first login.
            </p>
        </div>
    );
}

export default Login;