import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // read the saved user, so you stay logged in after a page refresh
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // called after a successful login
    const login = (data) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
    }

    const logout = async () => {
        try {
            await apiRequest('/api/auth/logout', 'POST', { refreshToken: localStorage.getItem('refreshToken') });
        } catch (error) {
            // even if this fails, we still logout on the frontend
        }
        localStorage.clear();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// any page can use: const { user, login, logout } = useAuth();
export const useAuth = () => {
    return useContext(AuthContext);
}