import { useAuth } from '../../context/AuthContext.jsx';

const StudentDashboard = () => {
    const { user } = useAuth();
    return (
        <div className="card">
            <h2>Welcome, {user.name}</h2>
            <p className="muted">Student page - exams coming in the next step.</p>
        </div>
    );
}

export default StudentDashboard;