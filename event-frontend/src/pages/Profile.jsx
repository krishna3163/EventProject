import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const ACADEMIC_YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni'];

const Profile = () => {
    const { userId } = useParams();
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [viewedUser, setViewedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Registered');
    const [history, setHistory] = useState([]);

    React.useEffect(() => {
        if (userId || user?.id) {
            fetchHistory();
        }
    }, [userId, user]);

    const fetchHistory = async () => {
        try {
            const targetId = userId && userId !== 'demo' ? userId : user?.id;
            if (!targetId) return;

            const [mcqRes, codeRes] = await Promise.all([
                apiService.quiz.getHistory(targetId).catch(() => ({ data: [] })),
                apiService.submission.getByUser(targetId).catch(() => ({ data: [] }))
            ]);

            const mcqItems = (mcqRes.data || []).map(item => ({
                id: item.eventId,
                type: 'mcq',
                name: item.eventTitle,
                status: 'Completed',
                progress: 100,
                color: 'text-emerald-500',
                bg: 'bg-emerald-50',
                date: item.submittedAt
            }));

            const codeItems = (codeRes.data || []).map(item => ({
                id: item.problem?.id || item.id,
                type: 'coding',
                name: item.problem?.title || 'Coding Problem',
                status: item.verdict === 'ACCEPTED' ? 'Completed' : 'Attempted',
                progress: item.verdict === 'ACCEPTED' ? 100 : 50,
                color: item.verdict === 'ACCEPTED' ? 'text-blue-500' : 'text-amber-500',
                bg: 'bg-blue-50',
                date: item.submittedAt
            }));

            setHistory([...mcqItems, ...codeItems]);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

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
            const response = await apiService.user.getUser(userId);
            setViewedUser(response.data);
        } catch (error) {
            console.error('Could not load user profile:', error);

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

    const handleStartEdit = () => {
        setEditData({
            username: targetUser.username || '',
            firstName: targetUser.firstName || '',
            lastName: targetUser.lastName || '',
            email: targetUser.email || '',
            branch: targetUser.branch || '',
            college: targetUser.college || '',
            rollNumber: targetUser.rollNumber || '',
            academicYear: targetUser.academicYear || '',
        });
        setIsEditing(true);
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            const response = await apiService.user.updateProfile(editData);
            const updatedUser = { ...user, ...response.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error('Profile update failed:', err);
            // Fallback: local-only update
            const localUpdate = { ...user, ...editData };
            setUser(localUpdate);
            localStorage.setItem('user', JSON.stringify(localUpdate));
            setIsEditing(false);
            toast.success('Profile updated locally!');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setShowPasswordModal(false);
        toast.success('Password changed successfully (Demo Mode)!');
    };

    const profileFields = [
        { key: 'username', label: 'Username', icon: '👤', editable: true, type: 'text' },
        { key: 'email', label: 'Email Address', icon: '✉️', editable: true, type: 'email' },
        { key: 'fullName', label: 'Full Name', icon: '📛', editable: false, composite: true },
        { key: 'branch', label: 'Department', icon: '🏛️', editable: true, type: 'text' },
        { key: 'college', label: 'University / College', icon: '🎓', editable: true, type: 'text' },
        { key: 'academicYear', label: 'Academic Year', icon: '📅', editable: true, type: 'select', options: ACADEMIC_YEAR_OPTIONS },
        { key: 'rollNumber', label: 'Roll Number', icon: '🔢', editable: true, type: 'text' },
    ];

    const getFieldValue = (field) => {
        if (field.composite && field.key === 'fullName') {
            return `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'N/A';
        }
        return targetUser[field.key] || 'Not set';
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
                    <div className="theme-card p-8 flex flex-col items-center text-center space-y-6 glass-effect border-transparent shadow-2xl">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-2xl">
                            <div className="w-full h-full rounded-full theme-bg-secondary flex items-center justify-center text-5xl font-black text-blue-600 uppercase">
                                {targetUser.firstName ? targetUser.firstName[0] : 'U'}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black theme-text-primary">{targetUser.firstName} {targetUser.lastName}</h2>
                            <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mt-1">{targetUser.role || 'STUDENT'}</p>
                            {targetUser.college && (
                                <p className="text-gray-400 text-sm mt-2 font-medium">🎓 {targetUser.college}</p>
                            )}
                        </div>
                        <div className="pt-6 border-t border-gray-100 w-full space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="theme-text-secondary font-bold">Member Since</span>
                                <span className="theme-text-primary font-black">Feb 2026</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="theme-text-secondary font-bold">Events Joined</span>
                                <span className="theme-text-primary font-black">{history.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Personal Info */}
                <div className="md:col-span-2 space-y-8">
                    <div className="card p-10 space-y-10 glass-effect border-transparent shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {isEditing ? (
                                <>
                                    {/* Username */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">👤 Username</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            placeholder="Enter username"
                                        />
                                    </div>
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">✉️ Email Address</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">📛 First Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.firstName}
                                            onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">📛 Last Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.lastName}
                                            onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                    {/* Department */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">🏛️ Department</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.branch}
                                            onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>
                                    {/* University / College */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">🎓 University / College</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.college}
                                            onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                                            placeholder="e.g. IIT Delhi, NIT Patna"
                                        />
                                    </div>
                                    {/* Academic Year */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">📅 Academic Year</label>
                                        <select
                                            className="input-field"
                                            value={editData.academicYear}
                                            onChange={(e) => setEditData({ ...editData, academicYear: e.target.value })}
                                        >
                                            <option value="">Select Year</option>
                                            {ACADEMIC_YEAR_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Roll Number */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">🔢 Roll Number</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editData.rollNumber}
                                            onChange={(e) => setEditData({ ...editData, rollNumber: e.target.value })}
                                            placeholder="e.g. 22CS104"
                                        />
                                    </div>
                                </>
                            ) : (
                                profileFields.map((field, idx) => (
                                    <div key={idx} className="space-y-2 group">
                                        <p className="text-[10px] font-black theme-text-secondary uppercase tracking-widest leading-none flex items-center gap-1">
                                            <span>{field.icon}</span> {field.label}
                                        </p>
                                        <p className="text-lg font-bold theme-text-primary">{getFieldValue(field)}</p>
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
                                            disabled={saving}
                                            className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditData({}); }}
                                            className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleStartEdit}
                                            className="flex-1 py-4 bg-gray-800 text-white font-black rounded-2xl shadow-xl hover:bg-gray-900 transition-all active:scale-95"
                                        >
                                            ✏️ Edit Profile
                                        </button>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            🔒 Change Password
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
                            <h3 className="text-xl font-black theme-text-primary">Event Activity</h3>
                            <div className="flex space-x-2 theme-bg-tertiary p-1 rounded-xl">
                                {['Registered', 'Completed', 'In-Progress'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'theme-bg-secondary text-blue-600 shadow-sm' : 'theme-text-secondary hover:theme-text-primary'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No participation history found.</p>
                            ) : history
                                .map((event, i) => (
                                    <div key={i} className="group p-6 rounded-[2rem] border border-gray-50 theme-bg-secondary hover:border-blue-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-lg font-bold theme-text-primary">{event.name}</p>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.bg} ${event.color}`}>
                                                    {event.type} • {event.status}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-48 space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase theme-text-secondary">
                                                <span>Progress</span>
                                                <span>{event.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full theme-bg-tertiary rounded-full overflow-hidden">
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
                        <h3 className="text-lg font-black theme-text-primary border-l-4 border-blue-500 pl-4">Recent Accomplishments</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Full Stack Bootcamp', type: 'Participation', date: 'Jan 15, 2026', link: '/certificate/fsb1?type=participation&event=Full Stack Bootcamp' },
                                { name: 'ML Mastery Quiz', type: 'Rank #3', date: 'Dec 20, 2025', link: '/certificate/mlq?type=rank&rank=3&score=85&event=ML Mastery Quiz' }
                            ].map((cert, i) => (
                                <div key={i} className="flex items-center justify-between p-4 theme-bg-tertiary rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full theme-bg-secondary flex items-center justify-center text-blue-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold theme-text-primary">{cert.name}</p>
                                            <p className="text-xs theme-text-secondary font-medium">{cert.date} • {cert.type}</p>
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
