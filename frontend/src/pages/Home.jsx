import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }
    if (user.role === 'admin') {
        return <Navigate to="/admin" />;
    }
    if (user.role === 'teacher') {
        return <Navigate to="/teacher" />;
    }
    return <Navigate to="/student" />;
}

export default Home;