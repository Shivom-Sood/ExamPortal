import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    }

    return (
        <nav className="navbar">
            <div className="row">
                <Link to="/" className="logo">ExamPortal</Link>

                {user && user.role === 'student' && (
                    <>
                        <Link to="/student">Exams</Link>
                        <Link to="/student/history">My Results</Link>
                    </>
                )}

                {user && user.role === 'teacher' && (
                    <>
                        <Link to="/teacher">My Exams</Link>
                        <Link to="/teacher/questions">Question Bank</Link>
                    </>
                )}

                {user && user.role === 'admin' && (
                    <>
                        <Link to="/admin">Overview</Link>
                        <Link to="/admin/users">Users</Link>
                    </>
                )}
            </div>

            <div className="row">
                {user ? (
                    <>
                        <span>{user.name} ({user.role})</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;