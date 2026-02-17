import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle session on mount
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                handleUserSession(session);
            }
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                handleUserSession(session);
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUserSession = async (session) => {
        const token = session.access_token;
        const supabaseUser = session.user;

        localStorage.setItem('token', token);

        // Custom metadata might contain info like role, or we default to USER
        const userData = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            firstName: supabaseUser.user_metadata?.firstName || 'User',
            lastName: supabaseUser.user_metadata?.lastName || '',
            role: supabaseUser.user_metadata?.role || 'USER'
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Sync with MongoDB backend
        try {
            await apiService.auth.sync();
        } catch (error) {
            console.error('User sync failed:', error);
        }
    };

    const login = async (emailOrUsername, password) => {
        let email = emailOrUsername;

        // Support 'admin' username for quick access
        if (emailOrUsername.toLowerCase() === 'admin') {
            email = 'admin@eventhub.com';
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            throw error;
        }

        toast.success(`Welcome back!`);
        return data.user;
    };

    const signup = async (userData) => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    username: userData.username,
                    role: 'USER', // Default role
                    course: userData.course,
                    branch: userData.branch
                }
            }
        });

        if (error) {
            toast.error(error.message);
            return null;
        }

        if (data.session) {
            toast.success('Registration successful!');
        } else {
            toast.info('Please check your email for verification link.');
        }

        return data.user;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Logged out successfully');
    };

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            toast.error(error.message);
            throw error;
        }
        toast.success('Password reset email sent!');
    };

    const value = {
        user,
        setUser,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
