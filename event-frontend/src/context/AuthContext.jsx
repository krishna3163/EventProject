import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            // TEMPORARY: Hardcoded guest user to allow entry without backend
            const guestUser = {
                id: 'guest_123',
                username: 'guest',
                firstName: 'Guest',
                lastName: 'Admin',
                role: 'ADMIN', // Enabling admin role so you can see all features
                email: 'guest@example.com'
            };
            setUser(guestUser);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        // TEMPORARY: Hardcoded bypass for testing
        if (username === 'admin' && password === 'admin') {
            const adminUser = {
                id: 'admin_123',
                username: 'admin',
                firstName: 'System',
                lastName: 'Administrator',
                role: 'ADMIN',
                email: 'admin@eventhub.com'
            };
            setUser(adminUser);
            localStorage.setItem('user', JSON.stringify(adminUser));
            localStorage.setItem('authData', btoa('admin:admin'));
            toast.success('Admin access granted (Demo Mode)');
            return adminUser;
        }

        try {
            // Set authData temporarily to test the connection
            const authHeader = btoa(`${username}:${password}`);
            localStorage.setItem('authData', authHeader);

            // Since we are using Basic Auth, we try to fetch all users.
            // If the credentials are wrong, this will throw a 401 error.
            const response = await apiService.auth.getAllUsers();

            // If successful, find the specific user profile
            const userData = response.data.find(u => u.username === username);

            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                toast.success(`Welcome back, ${userData.firstName}!`);
                return userData;
            } else {
                localStorage.removeItem('authData');
                throw new Error('User data not found');
            }
        } catch (error) {
            localStorage.removeItem('authData');
            console.error('Login failed:', error);
            const msg = error.response?.status === 401 ? 'Invalid username or password' : 'Login failed: Server error';
            toast.error(msg);
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            await apiService.auth.signup(userData);
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authData');
        setUser(null);
        toast.info('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        isAdmin: user?.role === 'ADMIN'
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
