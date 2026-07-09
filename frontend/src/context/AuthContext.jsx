/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize from localStorage on first render
        const token = localStorage.getItem('access_token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        if (token) {
            return { token, username, role, isAuthenticated: true };
        }
        return { token: null, username: null, role: null, isAuthenticated: false };
    });

    const login = (accessToken, refreshToken, username, role) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        setAuth({ token: accessToken, username, role, isAuthenticated: true });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setAuth({ token: null, username: null, role: null, isAuthenticated: false });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
