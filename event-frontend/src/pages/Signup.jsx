import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
    const [accountType, setAccountType] = useState('student'); // 'student' | 'organization'
    const [isLoading, setIsLoading] = useState(false);
    const { registerStudent, registerOrganization } = useAuth();
    const navigate = useNavigate();

    // Student form state
    const [studentForm, setStudentForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        college: '',
        phone: '',
    });

    // Organization form state
    const [orgForm, setOrgForm] = useState({
        organizationName: '',
        organizationUsername: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        adminName: '',
    });

    const handleStudentChange = (e) => {
        setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
    };

    const handleOrgChange = (e) => {
        setOrgForm({ ...orgForm, [e.target.name]: e.target.value });
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (studentForm.password !== studentForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (studentForm.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        try {
            await registerStudent({
                name: studentForm.name,
                email: studentForm.email,
                password: studentForm.password,
                college: studentForm.college,
                phone: studentForm.phone,
            });
            navigate('/');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrgSubmit = async (e) => {
        e.preventDefault();
        if (orgForm.password !== orgForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (orgForm.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (!/^[a-z0-9_]+$/.test(orgForm.organizationUsername)) {
            toast.error('Organization username can only contain lowercase letters, numbers, and underscores');
            return;
        }
        setIsLoading(true);
        try {
            await registerOrganization({
                organizationName: orgForm.organizationName,
                organizationUsername: orgForm.organizationUsername,
                email: orgForm.email,
                password: orgForm.password,
                contactNumber: orgForm.contactNumber,
                adminName: orgForm.adminName || orgForm.organizationName,
            });
            navigate('/');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-bg-primary transition-colors duration-300">
            {/* Background blobs */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent-primary opacity-5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent-secondary opacity-5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>

            <div className="card max-w-2xl w-full p-8 relative z-10 glass-effect my-12 bg-bg-secondary border border-card-border shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-text-secondary font-medium">Join the platform and start your journey</p>
                </div>

                {/* Account Type Toggle */}
                <div className="flex p-1 bg-bg-tertiary rounded-2xl mb-8 gap-1 border border-card-border">
                    <button
                        type="button"
                        onClick={() => setAccountType('student')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${accountType === 'student'
                            ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/20'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('organization')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${accountType === 'organization'
                            ? 'bg-gradient-to-r from-accent-secondary to-accent-primary text-white shadow-lg shadow-accent-secondary/20'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Organization
                    </button>
                </div>

                {/* ── STUDENT FORM ── */}
                {accountType === 'student' && (
                    <form onSubmit={handleStudentSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Full Name *</label>
                                <input
                                    type="text" name="name" required
                                    value={studentForm.name} onChange={handleStudentChange}
                                    className="input-field" placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email Address *</label>
                                <input
                                    type="email" name="email" required
                                    value={studentForm.email} onChange={handleStudentChange}
                                    className="input-field" placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">College / University</label>
                                <input
                                    type="text" name="college"
                                    value={studentForm.college} onChange={handleStudentChange}
                                    className="input-field" placeholder="MIT, IIT Delhi..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Phone Number</label>
                                <input
                                    type="tel" name="phone"
                                    value={studentForm.phone} onChange={handleStudentChange}
                                    className="input-field" placeholder="+91 9876543210"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Password *</label>
                                <input
                                    type="password" name="password" required
                                    value={studentForm.password} onChange={handleStudentChange}
                                    className="input-field" placeholder="Min. 6 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Confirm Password *</label>
                                <input
                                    type="password" name="confirmPassword" required
                                    value={studentForm.confirmPassword} onChange={handleStudentChange}
                                    className="input-field" placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center gap-3 p-4 bg-accent-primary bg-opacity-10 rounded-2xl border border-accent-primary border-opacity-20">
                            <div className="bg-accent-primary bg-opacity-20 p-2 rounded-xl">
                                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm text-text-secondary font-medium">
                                You'll be registered as a <strong className="text-accent-primary">Student</strong> and can participate in events and exams.
                            </p>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className={`w-full btn-primary py-4 text-lg mt-2 shadow-2xl ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Register as Student'}
                        </button>
                    </form>
                )}

                {/* ── ORGANIZATION FORM ── */}
                {accountType === 'organization' && (
                    <form onSubmit={handleOrgSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Organization Name *</label>
                                <input
                                    type="text" name="organizationName" required
                                    value={orgForm.organizationName} onChange={handleOrgChange}
                                    className="input-field" placeholder="TechFest Club, ACM Chapter..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Organization Username * <span className="text-text-tertiary normal-case font-normal">(unique, no spaces)</span></label>
                                <input
                                    type="text" name="organizationUsername" required
                                    value={orgForm.organizationUsername} onChange={handleOrgChange}
                                    className="input-field" placeholder="techfest_club"
                                    pattern="[a-z0-9_]+"
                                    title="Only lowercase letters, numbers, and underscores"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Admin Name</label>
                                <input
                                    type="text" name="adminName"
                                    value={orgForm.adminName} onChange={handleOrgChange}
                                    className="input-field" placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email Address *</label>
                                <input
                                    type="email" name="email" required
                                    value={orgForm.email} onChange={handleOrgChange}
                                    className="input-field" placeholder="admin@org.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Contact Number</label>
                                <input
                                    type="tel" name="contactNumber"
                                    value={orgForm.contactNumber} onChange={handleOrgChange}
                                    className="input-field" placeholder="+91 9876543210"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Password *</label>
                                <input
                                    type="password" name="password" required
                                    value={orgForm.password} onChange={handleOrgChange}
                                    className="input-field" placeholder="Min. 6 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Confirm Password *</label>
                                <input
                                    type="password" name="confirmPassword" required
                                    value={orgForm.confirmPassword} onChange={handleOrgChange}
                                    className="input-field" placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center gap-3 p-4 bg-accent-secondary bg-opacity-10 rounded-2xl border border-accent-secondary border-opacity-20">
                            <div className="bg-accent-secondary bg-opacity-20 p-2 rounded-xl">
                                <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <p className="text-sm text-text-secondary font-medium">
                                You'll be registered as an <strong className="text-accent-secondary">Organization Admin</strong> and can create events, manage exams, and assign co-admins.
                            </p>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className={`w-full py-4 text-lg mt-2 font-bold rounded-2xl bg-gradient-to-r from-accent-secondary to-accent-primary text-white shadow-2xl hover:opacity-90 max-hover:-translate-y-1 transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Registering Organization...' : 'Register Organization'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-card-border pt-6">
                    <p className="text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-accent-primary font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
