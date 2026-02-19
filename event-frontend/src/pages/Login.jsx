import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, loginWithGoogle, loginWithPhone, verifyPhoneOtp, loginAnonymouslyUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        const { email, password } = form;
        if (!email || !password) return toast.error('Please fill in all fields');

        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            console.error("Login error:", error);
            const code = error?.code || '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                toast.error('Invalid email/username or password');
            } else if (code === 'auth/too-many-requests') {
                toast.error('Too many attempts. Please try again later.');
            } else {
                toast.error(error?.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            toast.success('Logged in with Google!');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneLogin = async (e) => {
        e.preventDefault();
        if (!phone) return toast.error("Enter phone number (e.g., +1234567890)");

        setIsLoading(true);
        try {
            await loginWithPhone(phone);
            setShowOtpInput(true);
            toast.success("OTP sent!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error("Enter OTP");

        setIsLoading(true);
        try {
            await verifyPhoneOtp(otp);
            navigate('/');
        } catch (error) {
            toast.error("Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnonLogin = async () => {
        setIsLoading(true);
        try {
            await loginAnonymouslyUser();
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = (type) => {
        if (type === 'admin') setForm({ email: 'admin', password: 'admin123' });
        else if (type === 'student') setForm({ email: 'student', password: 'student123' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-bg-primary transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent-primary opacity-10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent-secondary opacity-10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="card max-w-md w-full p-8 relative z-10 glass-effect bg-bg-secondary shadow-2xl rounded-2xl border border-card-border">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-text-secondary mt-2 font-medium">Log in to your account</p>
                </div>

                {/* Quick Demos */}
                <div className="flex gap-2 mb-6">
                    <button onClick={() => handleQuickLogin('admin')} className="flex-1 py-2 text-xs font-bold border border-accent-secondary text-accent-secondary bg-accent-secondary/5 rounded-lg hover:bg-accent-secondary/10 transition-all">
                        🔐 Admin Demo
                    </button>
                    <button onClick={() => handleQuickLogin('student')} className="flex-1 py-2 text-xs font-bold border border-accent-primary text-accent-primary bg-accent-primary/5 rounded-lg hover:bg-accent-primary/10 transition-all">
                        🎓 Student Demo
                    </button>
                </div>

                {/* Email / Username Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Email or Username"
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-accent-primary hover:underline font-medium">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full py-3 btn-primary disabled:opacity-70 disabled:cursor-not-allowed">
                        {isLoading ? 'Processing...' : 'Log In'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-card-border"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-bg-secondary text-text-secondary">Or continue with</span></div>
                </div>

                {/* Social / Phone / Anon */}
                <div className="space-y-3">
                    <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-2.5 bg-bg-secondary border border-card-border text-text-primary font-bold rounded-xl hover:bg-bg-tertiary transition-all flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    {!showOtpInput ? (
                        <form onSubmit={handlePhoneLogin} className="flex gap-2">
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 234 567 8900"
                                className="input-field text-sm"
                            />
                            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-status-success text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-md">
                                📱 Phone
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="flex gap-2 animate-fade-in">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                className="input-field text-sm"
                            />
                            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-status-success text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-md">
                                Verify
                            </button>
                        </form>
                    )}

                    <button onClick={handleAnonLogin} disabled={isLoading} className="w-full py-2 text-sm text-text-secondary hover:text-text-primary font-medium hover:underline">
                        🕵️ Continue as Guest
                    </button>
                </div>

                {/* Recaptcha container */}
                <div id="recaptcha-container"></div>

                <div className="mt-6 text-center space-y-2">
                    <Link to="/signup" className="text-accent-primary font-bold hover:underline text-sm block">Create an Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
