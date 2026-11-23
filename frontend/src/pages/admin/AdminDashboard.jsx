import { useAuth } from '../../context/AuthContext.jsx';

const AdminDashboard = () => {
    const { user } = useAuth();
    return (
        <div className="card">
            <h2>Welcome, {user.name}</h2>
            <p className="muted">Admin page - coming soon.</p>
        </div>
    );
}

export default AdminDashboard;