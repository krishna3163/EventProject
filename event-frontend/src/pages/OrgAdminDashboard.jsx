import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const OrgAdminDashboard = () => {
    const { user } = useAuth();

    // MongoDB data
    const [events, setEvents] = useState([]);
    const [contests, setContests] = useState([]);
    const [orgStudents, setOrgStudents] = useState([]);
    const [orgAdmins, setOrgAdmins] = useState([]);
    const [orgInfo, setOrgInfo] = useState(null);

    // Supabase data
    const [orgParticipations, setOrgParticipations] = useState([]);
    const [eventLeaderboards, setEventLeaderboards] = useState({});

    // UI state
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentParticipations, setStudentParticipations] = useState([]);
    const [studentModalLoading, setStudentModalLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventLeaderboard, setEventLeaderboard] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [addAdminForm, setAddAdminForm] = useState({ email: '', name: '' });
    const [addAdminLoading, setAddAdminLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const orgId = user?.organizationId;

            const [eventsRes, contestsRes] = await Promise.allSettled([
                orgId ? apiService.quiz.getOrgEvents(orgId) : apiService.quiz.getAll(),
                orgId ? apiService.contest.getOrgContests(orgId) : apiService.contest.getAll(),
            ]);

            if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data || []);
            if (contestsRes.status === 'fulfilled') setContests(contestsRes.value.data || []);

            if (orgId) {
                const [studentsRes, adminsRes, orgRes] = await Promise.allSettled([
                    apiService.organization.getStudents(orgId),
                    apiService.organization.getAdmins(orgId),
                    apiService.organization.getById(orgId),
                ]);
                if (studentsRes.status === 'fulfilled') setOrgStudents(studentsRes.value.data || []);
                if (adminsRes.status === 'fulfilled') setOrgAdmins(adminsRes.value.data || []);
                if (orgRes.status === 'fulfilled') setOrgInfo(orgRes.value.data);

                // Supabase: org-wide participations
                const participations = await supabaseService.getOrgParticipations(orgId);
                setOrgParticipations(participations);
            }

            // Merge events and contests
            const quizzes = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : [];
            const codingContests = contestsRes.status === 'fulfilled' ? (contestsRes.value.data || []) : [];

            const combinedEvents = [
                ...quizzes.map(e => ({ ...e, eventType: 'MCQ' })), // api might return type, but enforce it
                ...codingContests.map(c => ({ ...c, eventType: 'CODING' }))
            ].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

            setEvents(combinedEvents);
        } catch (error) {
            console.error('OrgAdmin fetch error:', error);
        } finally {
            setLoading(false);
        }
    };


    const openStudentModal = async (student) => {
        setSelectedStudent(student);
        setStudentModalLoading(true);
        const participations = await supabaseService.getUserParticipations(student.id);
        setStudentParticipations(participations);
        setStudentModalLoading(false);
    };

    const openEventLeaderboard = async (event) => {
        setSelectedEvent(event);
        setLeaderboardLoading(true);
        const lb = await supabaseService.getEventLeaderboard(event.id);
        setEventLeaderboard(lb);
        setLeaderboardLoading(false);
    };

    const handleToggleBlockStudent = async (studentId) => {
        if (!user?.organizationId) return;
        try {
            const response = await apiService.organization.toggleBlockUser(user.organizationId, studentId);
            const { enabled, message } = response.data;
            toast.success(message);
            setOrgStudents(prev => prev.map(s => s.id === studentId ? { ...s, enabled } : s));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!user?.organizationId) return toast.error('No organization linked');
        setAddAdminLoading(true);
        try {
            await apiService.organization.addAdmin(user.organizationId, addAdminForm);
            toast.success('Co-admin added successfully!');
            setAddAdminForm({ email: '', name: '' });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setAddAdminLoading(false);
        }
    };

    // Compute per-event participation count from Supabase data
    const getEventParticipationCount = (eventId) =>
        orgParticipations.filter(p => p.event_id === eventId).length;

    const getEventAvgScore = (eventId) => {
        const relevant = orgParticipations.filter(p => p.event_id === eventId);
        if (!relevant.length) return 0;
        return Math.round(relevant.reduce((sum, p) => sum + (p.score || 0), 0) / relevant.length);
    };

    if (loading) return <Loader />;

    const totalParticipations = orgParticipations.length;
    const uniqueParticipants = new Set(orgParticipations.map(p => p.user_id)).size;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── HEADER ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-3">
                        {orgInfo?.name || 'Organization'} 🏢
                    </h1>
                    <p className="text-purple-100 text-lg font-medium">
                        {orgStudents.length} students · {events.length} events · {totalParticipations} participations
                    </p>
                </div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Students', value: orgStudents.length, icon: '🎓', g: 'from-blue-500 to-blue-600', tab: 'students' },
                    { label: 'Events Hosted', value: events.length, icon: '📋', g: 'from-orange-500 to-orange-600', tab: 'events' },
                    { label: 'Participations', value: totalParticipations, icon: '🏆', g: 'from-green-500 to-green-600', tab: 'overview' },
                    { label: 'Active Participants', value: uniqueParticipants, icon: '👥', g: 'from-purple-500 to-purple-600', tab: 'overview' },
                ].map((stat, i) => (
                    <div key={i}
                        onClick={() => setActiveTab(stat.tab)}
                        className={`rounded-2xl bg-gradient-to-br ${stat.g} p-5 text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform`}>
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-xs font-medium opacity-80">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-2 p-1 theme-bg-secondary rounded-2xl w-fit flex-wrap">
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'events', label: '📋 Events' },
                    { id: 'students', label: '🎓 Students' },
                    { id: 'admins', label: '🛡️ Admins' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'theme-text-secondary hover:theme-text-primary'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════ */}
            {/* OVERVIEW TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Participations */}
                    <div className="glass-card p-6 hover-lift">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold theme-text-primary">Recent Participations</h3>
                        </div>
                        {orgParticipations.length === 0 ? (
                            <p className="text-sm theme-text-secondary text-center py-8">No participation data yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto">
                                {orgParticipations.slice(0, 10).map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <span className="text-lg">{p.event_type === 'QUIZ' ? '📝' : '⚔️'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm theme-text-primary truncate">{p.user_name}</p>
                                            <p className="text-xs theme-text-secondary truncate">{p.event_title}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-green-600 text-sm">{p.score}/{p.max_score}</p>
                                            <p className="text-xs text-gray-400">{new Date(p.participated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Students */}
                    <div className="glass-card p-6 hover-lift">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold theme-text-primary">Top Students</h3>
                        </div>
                        {(() => {
                            const studentScores = {};
                            orgParticipations.forEach(p => {
                                if (!studentScores[p.user_id]) studentScores[p.user_id] = { name: p.user_name, total: 0, count: 0 };
                                studentScores[p.user_id].total += p.score || 0;
                                studentScores[p.user_id].count += 1;
                            });
                            const sorted = Object.entries(studentScores)
                                .sort((a, b) => b[1].total - a[1].total)
                                .slice(0, 5);
                            return sorted.length === 0 ? (
                                <p className="text-sm theme-text-secondary text-center py-8">No data yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {sorted.map(([uid, data], i) => (
                                        <div key={uid} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm theme-text-primary">{data.name}</p>
                                                <p className="text-xs theme-text-secondary">{data.count} events</p>
                                            </div>
                                            <p className="font-black text-purple-600">{data.total} pts</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* EVENTS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'events' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold theme-text-primary text-lg">Events ({events.length})</h3>
                        </div>
                        <Link to="/create" className="btn-primary text-sm px-4 py-2">+ Create Event</Link>
                    </div>

                    {events.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="theme-text-secondary mb-4">No events created yet.</p>
                            <Link to="/create" className="btn-primary">Create Your First Event</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {events.map(event => {
                                const participationCount = getEventParticipationCount(event.id);
                                const avgScore = getEventAvgScore(event.id);
                                return (
                                    <div key={event.id} className="glass-card p-5 hover-lift">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold theme-text-primary">{event.title}</h4>
                                                <p className="text-xs theme-text-secondary mt-0.5">{event.durationInMinutes} min · {event.totalMarks} marks</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${event.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                                                event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>{event.status || 'UPCOMING'}</span>
                                        </div>

                                        {/* Supabase stats */}
                                        <div className="flex gap-3 mb-4">
                                            <div className="flex-1 bg-blue-50 rounded-xl p-2 text-center">
                                                <p className="text-lg font-black text-blue-700">{participationCount}</p>
                                                <p className="text-xs text-blue-600">Participants</p>
                                            </div>
                                            <div className="flex-1 bg-green-50 rounded-xl p-2 text-center">
                                                <p className="text-lg font-black text-green-700">{avgScore}</p>
                                                <p className="text-xs text-green-600">Avg Score</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => openEventLeaderboard(event)}
                                                className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                🏆 Leaderboard
                                            </button>
                                            <Link to={`/event/${event.id}/analytics`}
                                                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                📊 Analytics
                                            </Link>
                                            <Link to={`/edit/${event.id}?category=${event.eventType === 'MCQ' ? 'mcq' : 'coding'}`}
                                                className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                ✏️ Edit
                                            </Link>
                                            {event.eventType === 'MCQ' && (
                                                <Link to={`/event/${event.id}/questions`}
                                                    className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                    📝 Manage Quiz
                                                </Link>
                                            )}
                                            <button onClick={async () => {
                                                if (window.confirm('Delete this event?')) {
                                                    if (event.eventType === 'MCQ') await apiService.quiz.delete(event.id);
                                                    else await apiService.contest.delete(event.id);
                                                    toast.success('Event deleted');
                                                    fetchData();
                                                }
                                            }} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* STUDENTS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'students' && (
                <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-bold theme-text-primary text-lg">Students ({orgStudents.length})</h3>
                    </div>
                    {orgStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-3">🎓</div>
                            <p className="theme-text-secondary">No students registered yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {orgStudents.map((student, idx) => {
                                const studentParts = orgParticipations.filter(p => p.user_id === student.id);
                                const totalScore = studentParts.reduce((sum, p) => sum + (p.score || 0), 0);
                                return (
                                    <div key={student.id}
                                        className={`glass-card p-6 flex items-center justify-between hover-lift animate-fade-up`}
                                        style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => openStudentModal(student)}>
                                            <div className="w-12 h-12 premium-gradient-bg rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                                                {student.firstName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold theme-text-primary text-lg flex items-center gap-2">
                                                    {student.firstName} {student.lastName}
                                                    {student.enabled === false && <span className="modern-badge bg-red-100 text-red-600">Blocked</span>}
                                                </p>
                                                <p className="text-xs theme-text-secondary truncate">{student.email}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold theme-text-secondary flex items-center gap-1">
                                                        <span className="text-purple-500">🏆</span> {studentParts.length} Events
                                                    </span>
                                                    <span className="text-xs font-bold theme-text-secondary flex items-center gap-1">
                                                        <span className="text-green-500">✨</span> {totalScore} Pts
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            <button onClick={() => handleToggleBlockStudent(student.id)}
                                                className={`p-2.5 rounded-xl transition-all hover:scale-110 ${student.enabled === false ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                                title={student.enabled === false ? 'Unblock' : 'Block'}>
                                                {student.enabled === false ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* ADMINS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'admins' && (
                <div className="space-y-6">
                    {/* Current Admins */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold theme-text-primary text-lg">Co-Admins ({orgAdmins.length})</h3>
                        </div>
                        {orgAdmins.length === 0 ? (
                            <p className="text-center theme-text-secondary py-6">No co-admins yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {orgAdmins.map(admin => (
                                    <div key={admin.id} className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {admin.firstName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold theme-text-primary">{admin.firstName} {admin.lastName}</p>
                                            <p className="text-xs theme-text-secondary">{admin.email}</p>
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">ORG_ADMIN</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Co-Admin Form */}
                    <div className="card p-6">
                        <h3 className="font-bold theme-text-primary text-lg mb-4">➕ Add Co-Admin</h3>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Admin Email</label>
                                <input type="email" className="input-field mt-1" placeholder="admin@example.com"
                                    value={addAdminForm.email} onChange={e => setAddAdminForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Admin Name</label>
                                <input type="text" className="input-field mt-1" placeholder="Full name"
                                    value={addAdminForm.name} onChange={e => setAddAdminForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <button type="submit" disabled={addAdminLoading}
                                className={`btn-primary w-full ${addAdminLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {addAdminLoading ? 'Adding...' : 'Add Co-Admin'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* STUDENT DETAIL MODAL */}
            {/* ══════════════════════════════════════════════════════ */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
                    <div className="card max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                                    {selectedStudent.firstName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black theme-text-primary">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                    <p className="theme-text-secondary text-sm">@{selectedStudent.username}</p>
                                    <p className="text-xs theme-text-secondary">{selectedStudent.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                        </div>

                        {/* MongoDB Profile */}
                        <div className="bg-blue-50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider">User Profile</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: 'College', value: selectedStudent.college || '—' },
                                    { label: 'Course', value: selectedStudent.course || '—' },
                                    { label: 'Branch', value: selectedStudent.branch || '—' },
                                    { label: 'Phone', value: selectedStudent.phone || '—' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                                        <p className="font-bold theme-text-primary">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Supabase Participation */}
                        <div className="bg-emerald-50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">Contest History</p>
                            {studentModalLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : studentParticipations.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No participation records yet.</p>
                            ) : (
                                <>
                                    <div className="flex gap-3 mb-3">
                                        <div className="flex-1 bg-white rounded-xl p-2 text-center">
                                            <p className="text-lg font-black text-blue-700">{studentParticipations.length}</p>
                                            <p className="text-xs text-blue-600">Events</p>
                                        </div>
                                        <div className="flex-1 bg-white rounded-xl p-2 text-center">
                                            <p className="text-lg font-black text-green-700">
                                                {Math.round(studentParticipations.reduce((s, p) => s + (p.score || 0), 0) / studentParticipations.length)}
                                            </p>
                                            <p className="text-xs text-green-600">Avg Score</p>
                                        </div>
                                        <div className="flex-1 bg-white rounded-xl p-2 text-center">
                                            <p className="text-lg font-black text-purple-700">
                                                {studentParticipations.reduce((s, p) => s + (p.score || 0), 0)}
                                            </p>
                                            <p className="text-xs text-purple-600">Total Pts</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {studentParticipations.map((p, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3">
                                                <span className="text-lg">{p.event_type === 'QUIZ' ? '📝' : '⚔️'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm theme-text-primary truncate">{p.event_title}</p>
                                                    <p className="text-xs text-gray-400">{new Date(p.participated_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-green-600">{p.score}/{p.max_score}</p>
                                                    {p.rank && <p className="text-xs text-gray-400">Rank #{p.rank}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* EVENT LEADERBOARD MODAL */}
            {/* ══════════════════════════════════════════════════════ */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
                    <div className="card max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-black theme-text-primary">🏆 Leaderboard</h2>
                                <p className="theme-text-secondary text-sm">{selectedEvent.title}</p>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">Rankings</p>
                            {leaderboardLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : eventLeaderboard.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No participants yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {eventLeaderboard.map((entry, i) => (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-white shadow-sm' : 'bg-white/60'}`}>
                                            <span className="text-xl w-8 text-center">
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-bold theme-text-primary">{entry.user_name}</p>
                                                <p className="text-xs theme-text-secondary">{entry.user_email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-green-600">{entry.score}</p>
                                                <p className="text-xs text-gray-400">/ {entry.max_score}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgAdminDashboard;
