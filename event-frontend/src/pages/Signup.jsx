import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        fatherName: '',
        course: '',
        branch: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signup(formData);
            // If email verification is enabled, we might not navigate immediately
            // But usually, we redirect to login or show a message
            navigate('/login');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-300 opacity-5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-300 opacity-5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>

            <div className="card max-w-2xl w-full p-8 relative z-10 glass-effect my-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Create Your Account
                    </h1>
                    <p className="theme-text-secondary font-medium">Join the premium event hub and start competing</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold theme-text-primary border-l-4 border-blue-500 pl-3 mb-4">Personal Details</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">First Name</label>
                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input-field" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Last Name</label>
                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="input-field" placeholder="Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Father's Name</label>
                                <input type="text" name="fatherName" required value={formData.fatherName} onChange={handleChange} className="input-field" placeholder="Richard Doe" />
                            </div>
                        </div>

                        {/* Academic Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold theme-text-primary border-l-4 border-purple-500 pl-3 mb-4">Academic Info</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Course</label>
                                <input type="text" name="course" required value={formData.course} onChange={handleChange} className="input-field" placeholder="B.Tech" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Branch</label>
                                <input type="text" name="branch" required value={formData.branch} onChange={handleChange} className="input-field" placeholder="Computer Science" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Email Address</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="john@example.com" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold theme-text-primary border-l-4 border-indigo-500 pl-3 mb-6">Security Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Username</label>
                                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="input-field" placeholder="johndoe123" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">Password</label>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full btn-primary py-4 text-lg mt-8 shadow-2xl shadow-blue-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Register as Participant'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="theme-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
