/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize from localStorage on first render
        const token = localStorage.getItem('access_token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        const isSuperuser = localStorage.getItem('is_superuser') === 'true';
        let parsedPermissions;
        try {
            parsedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
        } catch {
            parsedPermissions = [];
        }

        if (token) {
            return {
                token,
                username,
                role,
                isSuperuser,
                permissions: parsedPermissions,
                isAuthenticated: true
            };
        }
        return {
            token: null,
            username: null,
            role: null,
            isSuperuser: false,
            permissions: [],
            isAuthenticated: false
        };
    });

    const login = (accessToken, refreshToken, username, role, isSuperuser = false, permissions = []) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        localStorage.setItem('is_superuser', isSuperuser ? 'true' : 'false');
        localStorage.setItem('permissions', JSON.stringify(permissions || []));
        setAuth({
            token: accessToken,
            username,
            role,
            isSuperuser: !!isSuperuser,
            permissions: permissions || [],
            isAuthenticated: true
        });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('is_superuser');
        localStorage.removeItem('permissions');
        setAuth({
            token: null,
            username: null,
            role: null,
            isSuperuser: false,
            permissions: [],
            isAuthenticated: false
        });
    };

    // Helper to check granular permissions for Admin users
    const hasPermission = useCallback((permission) => {
        if (!auth.isAuthenticated) return false;
        if (auth.role?.toUpperCase() !== 'ADMIN') return false;
        if (auth.isSuperuser) return true;
        if (!permission) return true;
        return Array.isArray(auth.permissions) && auth.permissions.includes(permission);
    }, [auth.isAuthenticated, auth.role, auth.isSuperuser, auth.permissions]);

    // Refresh admin permissions in background if user is ADMIN on page load
    useEffect(() => {
        if (auth.isAuthenticated && auth.role?.toUpperCase() === 'ADMIN' && auth.token) {
            let isMounted = true;
            api.get('users/me/')
                .then((res) => {
                    if (!isMounted || !res.data) return;
                    const data = res.data;
                    const isSuper = !!data.is_superuser;
                    const perms = Array.isArray(data.permissions) ? data.permissions : [];
                    localStorage.setItem('is_superuser', isSuper ? 'true' : 'false');
                    localStorage.setItem('permissions', JSON.stringify(perms));
                    setAuth((prev) => ({
                        ...prev,
                        isSuperuser: isSuper,
                        permissions: perms,
                    }));
                })
                .catch(() => {
                    // Fail silently to avoid breaking offline or token expired states
                });
            return () => {
                isMounted = false;
            };
        }
    }, [auth.isAuthenticated, auth.role, auth.token]);

    return (
        <AuthContext.Provider value={{ auth, login, logout, hasPermission }}>
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
