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

    const [isSyncing, setIsSyncing] = useState(() => !!localStorage.getItem('access_token'));

    const login = (accessToken, refreshToken, username, role, isSuperuser = false, permissions = []) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        localStorage.setItem('is_superuser', isSuperuser ? 'true' : 'false');
        localStorage.setItem('permissions', JSON.stringify(permissions || []));
        setIsSyncing(false);
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
        setIsSyncing(false);
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

    // Verify & synchronize user role, superuser status, and permissions with server on mount/auth change
    useEffect(() => {
        if (!auth.isAuthenticated || !auth.token) {
            return;
        }

        let isMounted = true;

        api.get('users/me/')
            .then((res) => {
                if (!isMounted || !res.data) return;
                const data = res.data;

                setAuth((prev) => {
                    const serverRole = data.role ? data.role.toUpperCase() : prev.role;
                    const isSuper = !!data.is_superuser;
                    const perms = Array.isArray(data.permissions) ? data.permissions : [];
                    const serverUsername = data.username || prev.username;

                    // Synchronize localStorage with confirmed server state
                    localStorage.setItem('role', serverRole);
                    localStorage.setItem('username', serverUsername);
                    localStorage.setItem('is_superuser', isSuper ? 'true' : 'false');
                    localStorage.setItem('permissions', JSON.stringify(perms));

                    return {
                        ...prev,
                        username: serverUsername,
                        role: serverRole,
                        isSuperuser: isSuper,
                        permissions: perms,
                    };
                });
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    logout();
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsSyncing(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [auth.isAuthenticated, auth.token]);

    return (
        <AuthContext.Provider value={{ auth, login, logout, hasPermission, isSyncing }}>
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
