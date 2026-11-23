import { useAuth } from '../../context/AuthContext.jsx';

const TeacherDashboard = () => {
    const { user } = useAuth();
    return (
        <div className="card">
            <h2>Welcome, {user.name}</h2>
            <p className="muted">Teacher page - coming soon.</p>
        </div>
    );
}

export default TeacherDashboard;