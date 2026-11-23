import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// role = which role is allowed to open this page
const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();

    // not logged in -> go to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // wrong role -> go to your own home page
    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;