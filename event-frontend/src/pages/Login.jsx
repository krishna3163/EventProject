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
            navigate('/');
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.code || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            toast.error(error.message);
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
        if (type === 'admin') setForm({ email: 'admin@eventhub.com', password: 'admin123' });
        else if (type === 'student') setForm({ email: 'student@demo.com', password: 'student123' });
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
                        🔐 Admin
                    </button>
                    <button onClick={() => handleQuickLogin('student')} className="flex-1 py-2 text-xs font-bold border border-accent-primary text-accent-primary bg-accent-primary/5 rounded-lg hover:bg-accent-primary/10 transition-all">
                        🎓 Student
                    </button>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Email address"
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
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                            {showPassword ? '🙈' : '👁️'}
                        </button>
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
                        <span className="text-xl">🇬</span> Google
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

                <div className="mt-6 text-center">
                    <Link to="/signup" className="text-accent-primary font-bold hover:underline text-sm">Create an Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
