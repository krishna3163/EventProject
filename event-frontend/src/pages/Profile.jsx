import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
    const { userId } = useParams();
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...user });
    const [viewedUser, setViewedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Registered');

    // If viewing someone else's profile
    React.useEffect(() => {
        if (userId && userId !== 'demo') {
            fetchOtherUser();
        } else if (userId === 'demo') {
            setViewedUser({
                firstName: 'Demo',
                lastName: 'User',
                username: 'demouser',
                email: 'demo@eventhub.com',
                branch: 'Computer Science',
                role: 'STUDENT'
            });
        }
    }, [userId]);

    const fetchOtherUser = async () => {
        setLoading(true);
        const queryParams = new URLSearchParams(window.location.search);
        const fallbackName = queryParams.get('name') || 'Guest Participant';
        const nameParts = fallbackName.split(' ');

        try {
            const response = await apiService.auth.getUser(userId);
            setViewedUser(response.data);
        } catch (error) {
            console.error('Could not load user profile:', error);

            // FALLBACK: Use URL params for name if DB fetch fails
            if (userId && userId !== 'demo') {
                setViewedUser({
                    id: userId,
                    firstName: nameParts[0] || 'Guest',
                    lastName: nameParts.slice(1).join(' ') || 'Participant',
                    username: 'user_' + userId.toLowerCase(),
                    email: userId.toLowerCase() + '@campus.edu',
                    branch: 'Engineering',
                    role: 'STUDENT'
                });
                toast.info('Viewing Demo Profile (Real-time mapping)');
            } else {
                toast.error('User profile not found');
            }
        } finally {
            setLoading(false);
        }
    };

    const targetUser = viewedUser || user;

    if (!targetUser && !loading) {
        navigate('/login');
        return null;
    }

    const handleUpdateProfile = () => {
        setUser(editData);
        localStorage.setItem('user', JSON.stringify(editData));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setShowPasswordModal(false);
        toast.success('Password changed successfully (Demo Mode)!');
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
            {userId && (
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center space-x-2 text-gray-400 font-bold hover:text-blue-600 transition-colors group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Analytics</span>
                </button>
            )}

            <div className="text-center mb-12">
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {isEditing ? 'Editing Profile' : userId ? 'Student Profile' : 'Your Profile'}
                </h1>
                <p className="text-gray-500 text-xl font-medium uppercase tracking-widest">{userId ? 'Public Identity' : 'Identity & Credentials'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar Card */}
                <div className="md:col-span-1">
                    <div className="card p-8 flex flex-col items-center text-center space-y-6 glass-effect border-transparent shadow-2xl">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl font-black text-blue-600 uppercase">
                                {targetUser.firstName ? targetUser.firstName[0] : 'U'}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800">{targetUser.firstName} {targetUser.lastName}</h2>
                            <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mt-1">{targetUser.role || 'STUDENT'}</p>
                        </div>
                        <div className="pt-6 border-t border-gray-100 w-full space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Member Since</span>
                                <span className="text-gray-700 font-black">Feb 2026</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Events Joined</span>
                                <span className="text-gray-700 font-black">12</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Personal Info */}
                <div className="md:col-span-2 space-y-8">
                    <div className="card p-10 space-y-10 glass-effect border-transparent shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {isEditing ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">First Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.firstName}
                                            onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.lastName}
                                            onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Email</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Department</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.branch}
                                            onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                                        />
                                    </div>
                                </>
                            ) : (
                                [
                                    { label: 'Username', val: targetUser.username || 'user_' + (targetUser.id || 'demo') },
                                    { label: 'Email Address', val: targetUser.email || 'N/A' },
                                    { label: 'Full Name', val: `${targetUser.firstName} ${targetUser.lastName}` },
                                    { label: 'Department', val: targetUser.branch || 'Computer Science' },
                                    { label: 'Academic Year', val: '3rd Year' },
                                    { label: 'Roll Number', val: targetUser.id || '22CS104' }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">{item.label}</p>
                                        <p className="text-lg font-bold text-gray-700">{item.val}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {!userId && (
                            <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditData({ ...user }); }}
                                            className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex-1 py-4 bg-gray-800 text-white font-black rounded-2xl shadow-xl hover:bg-gray-900 transition-all active:scale-95"
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            Change Password
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card p-8 bg-blue-600 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-xl font-black mb-2">Certification Vault</h3>
                                <p className="opacity-80 font-medium">Your earned certificates are permanently stored here.</p>
                            </div>
                            <button
                                onClick={() => navigate('/certificate/demo123?type=rank&rank=1&score=98&event=Theory of Computation')}
                                className="px-6 py-3 bg-white text-blue-600 font-black rounded-xl shadow-lg hover:bg-blue-50 transition-all"
                            >
                                Download Rank #1
                            </button>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    <div className="card p-8 space-y-8 glass-effect overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-black text-gray-800">Event Activity</h3>
                            <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
                                {['Registered', 'Completed', 'In-Progress'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Event List Simulation */}
                        <div className="space-y-4">
                            {[
                                { id: 'demo123', type: 'mcq', name: 'Theory of Computation', status: 'In-Progress', progress: 65, color: 'text-amber-500', bg: 'bg-amber-50' },
                                { id: 'demo456', type: 'coding', name: 'Algorithm Deathmatch', status: 'Registered', progress: 0, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { id: 'demo789', type: 'mcq', name: 'DBMS Advanced Quiz', status: 'Completed', progress: 100, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { id: 'demo101', type: 'coding', name: 'Java Basics', status: 'Completed', progress: 100, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { id: 'demo202', type: 'mcq', name: 'Networking Essentials', status: 'In-Progress', progress: 30, color: 'text-amber-500', bg: 'bg-amber-50' }
                            ]
                                .filter(event => event.status === activeTab)
                                .map((event, i) => (
                                    <div key={i} className="group p-6 rounded-[2rem] border border-gray-50 bg-white hover:border-blue-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-lg font-bold text-gray-800">{event.name}</p>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.bg} ${event.color}`}>
                                                    {event.status}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium">Modified 2 hours ago</span>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-48 space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                                <span>Progress</span>
                                                <span>{event.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full transition-all duration-1000 ${event.status === 'Completed' ? 'bg-emerald-500' : event.status === 'In-Progress' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${event.progress}%` }}></div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (event.status === 'Completed') navigate(`/event/${event.id}/result`);
                                                else if (event.type === 'mcq') navigate(`/quiz/${event.id}`);
                                                else navigate(`/contest/${event.id}`);
                                            }}
                                            className="px-6 py-3 bg-gray-50 text-gray-400 font-black rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all text-xs"
                                        >
                                            {event.status === 'Completed' ? 'View Result' : event.status === 'In-Progress' ? 'Resume' : 'Start Now'}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="card p-8 space-y-6 glass-effect">
                        <h3 className="text-lg font-black text-gray-800 border-l-4 border-blue-500 pl-4">Recent Accomplishments</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Full Stack Bootcamp', type: 'Participation', date: 'Jan 15, 2026', link: '/certificate/fsb1?type=participation&event=Full Stack Bootcamp' },
                                { name: 'ML Mastery Quiz', type: 'Rank #3', date: 'Dec 20, 2025', link: '/certificate/mlq?type=rank&rank=3&score=85&event=ML Mastery Quiz' }
                            ].map((cert, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{cert.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{cert.date} • {cert.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(cert.link)}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}></div>
                    <form onSubmit={handleChangePassword} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-3xl p-10 animate-scale-in space-y-6">
                        <h2 className="text-3xl font-black text-gray-800 text-center">Security Update</h2>
                        <div className="space-y-4">
                            <input type="password" required className="input-field" placeholder="Current Password" />
                            <input type="password" required className="input-field" placeholder="New Password" />
                            <input type="password" required className="input-field" placeholder="Confirm New Password" />
                        </div>
                        <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                            Update Securely
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
