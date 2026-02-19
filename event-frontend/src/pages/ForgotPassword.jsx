import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        setIsLoading(true);
        try {
            await resetPassword(email);
            // resetPassword in AuthContext already shows success toast
        } catch (error) {
            console.error(error);
            const code = error?.code || '';
            if (code === 'auth/user-not-found') {
                toast.error('No account found with this email.');
            } else if (code === 'auth/invalid-email') {
                toast.error('Invalid email address.');
            } else {
                toast.error('Failed to send reset link. Try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

            <div className="card max-w-md w-full p-8 relative z-10 glass-effect">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Reset Password
                    </h1>
                    <p className="theme-text-secondary font-medium">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold theme-text-primary ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="john@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full btn-primary py-4 text-lg mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
