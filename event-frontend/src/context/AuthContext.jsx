import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: check for saved token and validate it
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch {
                // Corrupted data — clean up
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await apiService.auth.login({ username, password });
            const { token, ...userData } = response.data;

            // Store JWT token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success(`Welcome back, ${userData.firstName}!`);
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            const msg = error.response?.data?.error || 'Login failed. Please try again.';
            toast.error(msg);
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            const response = await apiService.auth.register(userData);
            const { token, ...user } = response.data;

            // Auto-login after successful registration
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            toast.success('Registration successful! Welcome to EventHub!');
            return user;
        } catch (error) {
            console.error('Signup error:', error);
            const msg = error.response?.data?.error || 'Registration failed. Please try again.';
            toast.error(msg);
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Logged out successfully');
    };

    const value = {
        user,
        setUser,
        loading,
        login,
        signup,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
