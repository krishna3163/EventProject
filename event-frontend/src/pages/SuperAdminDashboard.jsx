import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const ROLES = ['STUDENT', 'ORG_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'USER'];

const SuperAdminDashboard = () => {
    // MongoDB data
    const [users, setUsers] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [mongoAnalytics, setMongoAnalytics] = useState(null);
    const [events, setEvents] = useState([]);
    const [contests, setContests] = useState([]);

    // Supabase data
    const [platformAnalytics, setPlatformAnalytics] = useState(null);
    const [topPerformers, setTopPerformers] = useState([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userParticipations, setUserParticipations] = useState([]);
    const [userModalLoading, setUserModalLoading] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgParticipations, setOrgParticipations] = useState([]);
    const [orgModalLoading, setOrgModalLoading] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch from MongoDB via Spring Boot
            const [usersRes, orgsRes, analyticsRes, eventsRes, contestsRes] = await Promise.allSettled([
                apiService.superAdmin.getAllUsers(),
                apiService.superAdmin.getAllOrgs(),
                apiService.superAdmin.getAnalytics(),
                apiService.quiz.getAll(),
                apiService.contest.getAll(),
            ]);

            if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
            if (orgsRes.status === 'fulfilled') setOrgs(orgsRes.value.data || []);
            if (analyticsRes.status === 'fulfilled') setMongoAnalytics(analyticsRes.value.data || {});
            if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data || []);
            if (contestsRes.status === 'fulfilled') setContests(contestsRes.value.data || []);

            // Fetch from Supabase
            const [supaAnalytics, performers] = await Promise.all([
                supabaseService.getPlatformAnalytics(),
                supabaseService.getTopPerformers(10),
            ]);
            setPlatformAnalytics(supaAnalytics);
            setTopPerformers(performers);

        } catch (error) {
            console.error('Dashboard fetch error:', error);
            setMongoAnalytics({ totalUsers: 0, totalOrganizations: 0, totalStudents: 0, totalAdmins: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Open user detail modal — pulls Supabase participation data
    const openUserModal = async (user) => {
        setSelectedUser(user);
        setUserModalLoading(true);
        const participations = await supabaseService.getUserParticipations(user.id);
        setUserParticipations(participations);
        setUserModalLoading(false);
    };

    // Open org detail modal — pulls Supabase org participation data
    const openOrgModal = async (org) => {
        setSelectedOrg(org);
        setOrgModalLoading(true);
        const participations = await supabaseService.getOrgParticipations(org.id);
        setOrgParticipations(participations);
        setOrgModalLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiService.superAdmin.updateUserRole(userId, newRole);
            toast.success(`Role updated to ${newRole}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleBlockUser = async (userId, currentState) => {
        try {
            const response = await apiService.superAdmin.toggleBlockUser(userId);
            const { enabled, message } = response.data;
            toast.success(message);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled } : u));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        try {
            await apiService.superAdmin.deleteUser(userId);
            toast.success('User deleted');
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.username || ''}`
            .toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const map = {
            SUPER_ADMIN: 'bg-red-100 text-red-700 border border-red-200',
            ORG_ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
            ADMIN: 'bg-orange-100 text-orange-700 border border-orange-200',
            STUDENT: 'bg-blue-100 text-blue-700 border border-blue-200',
            USER: 'bg-gray-100 text-gray-600 border border-gray-200',
        };
        return map[role] || map.USER;
    };

    const getStatusBadge = (status) => {
        const map = {
            LIVE: 'bg-red-100 text-red-700',
            UPCOMING: 'bg-blue-100 text-blue-700',
            COMPLETED: 'bg-gray-100 text-gray-600',
        };
        return map[status] || map.UPCOMING;
    };

    if (loading) return <Loader />;

    const totalEvents = events.length + contests.length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── HEADER ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-red-700 to-rose-700 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-3">System Control Panel 🔐</h1>
                    <p className="text-red-100 text-lg font-medium">
                        {mongoAnalytics?.totalUsers || users.length} users · {orgs.length} organizations · {totalEvents} events
                    </p>
                    <p className="text-red-200 text-sm mt-1">
                        {platformAnalytics?.totalParticipations || 0} total participations tracked
                    </p>
                </div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-yellow-300 opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* ── STATS GRID ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Total Users', value: mongoAnalytics?.totalUsers || users.length, icon: '👤', g: 'from-blue-500 to-blue-600', tab: 'users' },
                    { label: 'Organizations', value: orgs.length, icon: '🏢', g: 'from-purple-500 to-purple-600', tab: 'organizations' },
                    { label: 'Students', value: mongoAnalytics?.totalStudents || users.filter(u => u.role === 'STUDENT').length, icon: '🎓', g: 'from-green-500 to-green-600', tab: 'users' },
                    { label: 'Events & Quizzes', value: events.length, icon: '📋', g: 'from-orange-500 to-orange-600', tab: 'events' },
                    { label: 'Participations', value: platformAnalytics?.totalParticipations || 0, icon: '🏆', g: 'from-pink-500 to-rose-600', tab: 'leaderboard' },
                    { label: 'Contests', value: contests.length, icon: '⚔️', g: 'from-indigo-500 to-indigo-600', tab: 'events' },
                ].map((stat, i) => (
                    <div key={i}
                        onClick={() => setActiveTab(stat.tab)}
                        className={`rounded-2xl bg-gradient-to-br ${stat.g} p-5 text-white shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform`}>
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
                    { id: 'users', label: '👤 Users' },
                    { id: 'organizations', label: '🏢 Organizations' },
                    { id: 'events', label: '📋 Events' },
                    { id: 'leaderboard', label: '🏆 Top Performers' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'theme-text-secondary hover:theme-text-primary'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════ */}
            {/* OVERVIEW TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* User Role Distribution */}
                    <div className="glass-card p-6 overflow-hidden relative group hover-lift">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">👥</span>
                            <h3 className="font-bold theme-text-primary">User Distribution</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { role: 'STUDENT', count: users.filter(u => u.role === 'STUDENT').length, color: 'bg-blue-500' },
                                { role: 'ORG_ADMIN', count: users.filter(u => u.role === 'ORG_ADMIN').length, color: 'bg-purple-500' },
                                { role: 'SUPER_ADMIN', count: users.filter(u => u.role === 'SUPER_ADMIN').length, color: 'bg-red-500' },
                                { role: 'USER', count: users.filter(u => u.role === 'USER').length, color: 'bg-gray-400' },
                            ].map(item => (
                                <div key={item.role} className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => { setActiveTab('users'); setRoleFilter(item.role); }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium theme-text-primary">{item.role}</span>
                                        <span className="font-bold theme-text-primary">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full transition-all`}
                                            style={{ width: `${users.length ? (item.count / users.length) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Participation Analytics from Supabase */}
                    <div className="glass-card p-6 overflow-hidden relative group hover-lift">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">📈</span>
                            <h3 className="font-bold theme-text-primary">Participation Analytics</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Total Participations', value: platformAnalytics?.totalParticipations || 0, icon: '🏆' },
                                { label: 'Quiz Attempts', value: platformAnalytics?.quizParticipations || 0, icon: '📝' },
                                { label: 'Contest Entries', value: platformAnalytics?.contestParticipations || 0, icon: '⚔️' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm theme-text-secondary font-medium">{item.icon} {item.label}</span>
                                    <span className="text-lg font-black theme-text-primary">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="glass-card p-6 overflow-hidden relative group hover-lift">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">⚙️</span>
                            <h3 className="font-bold theme-text-primary">System Status</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Auth Service', value: 'Active', color: 'text-green-600' },
                                { label: 'Database', value: 'Connected', color: 'text-green-600' },
                                { label: 'Analytics Engine', value: 'Connected', color: 'text-green-600' },
                                { label: 'Security System', value: 'Enabled', color: 'text-blue-600' },
                                { label: 'Real-time Sync', value: 'Running', color: 'text-purple-600' },
                                { label: 'Exam Integrity', value: 'Active', color: 'text-orange-600' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50/50 rounded-xl transition-colors hover:bg-gray-50">
                                    <span className="text-sm theme-text-secondary font-medium">{item.label}</span>
                                    <div className="status-indicator">
                                        <div className={`status-dot-pulse ${item.color.replace('text-', 'text-')}`}></div>
                                        <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="glass-card p-6 md:col-span-2 hover-lift">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">🆕</span>
                            <h3 className="font-bold theme-text-primary">Recent Registrations</h3>
                        </div>
                        <div className="space-y-2">
                            {users.slice(0, 5).map(user => (
                                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => openUserModal(user)}>
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold theme-text-primary text-sm truncate">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs theme-text-secondary truncate">{user.email}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${getRoleBadge(user.role)}`}>{user.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Events */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">📋</span>
                            <h3 className="font-bold theme-text-primary">Recent Events</h3>
                        </div>
                        <div className="space-y-2">
                            {events.slice(0, 5).map(event => (
                                <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📋</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold theme-text-primary text-sm truncate">{event.title}</p>
                                            <div className="hidden group-hover:flex gap-1 ml-2">
                                                <Link to={`/edit/${event.id}?category=mcq`} className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm hover:text-blue-600">✏️</Link>
                                                <Link to={`/event/${event.id}/questions`} className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm hover:text-emerald-600">📝</Link>
                                            </div>
                                        </div>
                                        <p className="text-xs theme-text-secondary">{event.durationInMinutes} min · {event.totalMarks} marks</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusBadge(event.status)}`}>{event.status || 'UPCOMING'}</span>
                                </div>
                            ))}
                            {events.length === 0 && <p className="text-sm theme-text-secondary text-center py-4">No events yet</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* USERS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
                <div className="card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold theme-text-primary text-lg">All Users ({users.length})</h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" className="input-field pl-11" placeholder="Search by name, email, username..."
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-auto">
                            <option value="all">All Roles</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['User', 'Email', 'College', 'Role', 'Actions'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-bold theme-text-secondary uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, idx) => (
                                    <tr key={user.id} className={`modern-table-row border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors animate-fade-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 premium-gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                                    {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold theme-text-primary text-sm flex items-center gap-2">
                                                        {user.firstName} {user.lastName}
                                                        {user.enabled === false && <span className="modern-badge bg-red-100 text-red-600">Blocked</span>}
                                                    </p>
                                                    <p className="text-xs theme-text-secondary">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 theme-text-secondary text-sm font-medium">{user.email}</td>
                                        <td className="py-4 px-4 theme-text-secondary text-sm">{user.college || '—'}</td>
                                        <td className="py-4 px-4">
                                            <span className={`modern-badge ${getRoleBadge(user.role)}`}>{user.role}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openUserModal(user)}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110" title="View Profile">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)}
                                                    className="text-xs border-none bg-gray-100 font-bold rounded-xl px-2 py-2 theme-text-primary focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer">
                                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <button onClick={() => handleToggleBlockUser(user.id, user.enabled)}
                                                    className={`p-2 rounded-xl transition-all hover:scale-110 ${user.enabled === false ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                                    title={user.enabled === false ? 'Unblock' : 'Block'}>
                                                    {user.enabled === false ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all hover:scale-110" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12"><p className="theme-text-secondary">No users found.</p></div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* ORGANIZATIONS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'organizations' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold theme-text-primary text-lg">All Organizations ({orgs.length})</h3>
                    </div>
                    {orgs.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="text-6xl mb-4">🏢</div>
                            <p className="theme-text-secondary">No organizations registered yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {orgs.map(org => {
                                const orgAdmins = users.filter(u => u.organizationId === org.id && u.role === 'ORG_ADMIN');
                                const orgStudents = users.filter(u => u.organizationId === org.id && u.role === 'STUDENT');
                                return (
                                    <div key={org.id} className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => openOrgModal(org)}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-xl">
                                                {org.name?.[0]?.toUpperCase() || 'O'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold theme-text-primary">{org.name}</h4>
                                                <p className="text-xs theme-text-secondary">@{org.username}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm mb-4">
                                            <p className="theme-text-secondary">📧 {org.email}</p>
                                            {org.contactNumber && <p className="theme-text-secondary">📞 {org.contactNumber}</p>}
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1 bg-purple-50 rounded-xl p-2 text-center">
                                                <p className="text-lg font-black text-purple-700">{orgAdmins.length}</p>
                                                <p className="text-xs text-purple-600 font-medium">Admins</p>
                                            </div>
                                            <div className="flex-1 bg-blue-50 rounded-xl p-2 text-center">
                                                <p className="text-lg font-black text-blue-700">{orgStudents.length}</p>
                                                <p className="text-xs text-blue-600 font-medium">Students</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button className="flex-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold py-2 rounded-xl transition-colors">
                                                📊 View Details
                                            </button>
                                            <button onClick={async (e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Delete this organization and all its data?')) {
                                                    await apiService.organization.delete(org.id);
                                                    toast.success('Organization deleted');
                                                    fetchAllData();
                                                }
                                            }} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-2 rounded-xl transition-colors text-xs">
                                                🗑️
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
            {/* EVENTS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'events' && (
                <>
                    <div className="space-y-6">
                        {/* Quizzes */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold theme-text-primary text-lg">📋 Quiz Events ({events.length})</h3>
                            </div>
                            <Link to="/create" className="btn-primary text-xs px-4 py-2">+ Create New Event</Link>
                        </div>
                        {events.length === 0 ? (
                            <p className="text-center theme-text-secondary py-8">No quiz events yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {['Title', 'Duration', 'Marks', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="text-left py-3 px-4 text-xs font-bold theme-text-secondary uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map(event => (
                                            <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-bold theme-text-primary text-sm">{event.title}</td>
                                                <td className="py-3 px-4 theme-text-secondary text-sm">{event.durationInMinutes} min</td>
                                                <td className="py-3 px-4 theme-text-secondary text-sm">{event.totalMarks}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusBadge(event.status)}`}>
                                                        {event.status || 'UPCOMING'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Link to={`/event/${event.id}/analytics`}
                                                            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                            📊 Analytics
                                                        </Link>
                                                        <Link to={`/event/${event.id}/questions`}
                                                            className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                            📝 Questions
                                                        </Link>
                                                        <Link to={`/edit/${event.id}?category=mcq`}
                                                            className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold px-3 py-1.5 rounded-lg transition-colors">
                                                            ✏️ Edit
                                                        </Link>
                                                        <button onClick={async () => {
                                                            if (window.confirm('Delete this quiz?')) {
                                                                await apiService.quiz.delete(event.id);
                                                                toast.success('Quiz deleted');
                                                                fetchAllData();
                                                            }
                                                        }} className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Coding Contests */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold theme-text-primary text-lg">⚔️ Coding Contests ({contests.length})</h3>
                        </div>
                        {contests.length === 0 ? (
                            <p className="text-center theme-text-secondary py-8">No coding contests yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {contests.map(contest => (
                                    <div key={contest.id} className="p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                                        <h4 className="font-bold theme-text-primary">{contest.title || contest.name}</h4>
                                        <p className="text-sm theme-text-secondary mt-1">{contest.description || 'Coding contest'}</p>
                                        <div className="flex gap-2 mt-3">
                                            <Link to={`/contest/${contest.id}/leaderboard`}
                                                className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                                🏆 Leaderboard
                                            </Link>
                                            <Link to={`/edit/${contest.id}?category=coding`}
                                                className="text-xs bg-gray-50 text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                ✏️ Edit
                                            </Link>
                                            <button onClick={async () => {
                                                if (window.confirm('Delete contest?')) {
                                                    await apiService.contest.delete(contest.id);
                                                    toast.success('Contest deleted');
                                                    fetchAllData();
                                                }
                                            }} className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* TOP PERFORMERS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {
                activeTab === 'leaderboard' && (
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <h3 className="font-bold theme-text-primary text-lg">🏆 Top Performers</h3>
                        </div>
                        {topPerformers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">🏆</div>
                                <p className="theme-text-secondary">No participation data yet.</p>
                                <p className="text-xs theme-text-secondary mt-1">Data appears here when students complete quizzes/contests.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topPerformers.map((performer, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            i === 1 ? 'bg-gray-200 text-gray-600' :
                                                i === 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-blue-50 text-blue-600'
                                            }`}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold theme-text-primary">{performer.user_name}</p>
                                            <p className="text-xs theme-text-secondary truncate">{performer.event_title}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xl font-black text-green-600">{performer.score}</p>
                                            <p className="text-xs theme-text-secondary">points</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }

            {/* ══════════════════════════════════════════════════════ */}
            {/* USER DETAIL MODAL */}
            {/* ══════════════════════════════════════════════════════ */}
            {
                selectedUser && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                                        {selectedUser.firstName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black theme-text-primary">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                        <p className="theme-text-secondary text-sm">@{selectedUser.username}</p>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${getRoleBadge(selectedUser.role)}`}>{selectedUser.role}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                            </div>

                            {/* User Details from MongoDB */}
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider">User Profile</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {[
                                        { label: 'Email', value: selectedUser.email },
                                        { label: 'Phone', value: selectedUser.phone || '—' },
                                        { label: 'College', value: selectedUser.college || '—' },
                                        { label: 'Course', value: selectedUser.course || '—' },
                                        { label: 'Branch', value: selectedUser.branch || '—' },
                                        { label: 'Org ID', value: selectedUser.organizationId || 'None' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                                            <p className="font-bold theme-text-primary truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Participation History from Supabase */}
                            <div className="bg-emerald-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">Participation History</p>
                                {userModalLoading ? (
                                    <div className="flex justify-center py-6">
                                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : userParticipations.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No participation records yet.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {userParticipations.map((p, i) => (
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
                                )}
                            </div>

                            {/* Firebase Auth Info */}
                            <div className="bg-orange-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-orange-600 mb-3 uppercase tracking-wider">🔥 Firebase — Auth Info</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Firebase UID</p>
                                        <p className="font-mono text-xs theme-text-primary truncate">{selectedUser.firebaseUid || 'Not linked'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Auth Provider</p>
                                        <p className="font-bold theme-text-primary">{selectedUser.firebaseUid ? 'Firebase' : 'Custom JWT'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ══════════════════════════════════════════════════════ */}
            {/* ORG DETAIL MODAL */}
            {/* ══════════════════════════════════════════════════════ */}
            {
                selectedOrg && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrg(null)}>
                        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                                        {selectedOrg.name?.[0]?.toUpperCase() || 'O'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black theme-text-primary">{selectedOrg.name}</h2>
                                        <p className="theme-text-secondary text-sm">@{selectedOrg.username}</p>
                                        <p className="text-xs theme-text-secondary">{selectedOrg.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrg(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                            </div>

                            {/* Org Members from MongoDB */}
                            <div className="bg-purple-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wider">Members</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl p-3 text-center">
                                        <p className="text-2xl font-black text-purple-700">{users.filter(u => u.organizationId === selectedOrg.id && u.role === 'ORG_ADMIN').length}</p>
                                        <p className="text-xs text-purple-600 font-medium">Admins</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center">
                                        <p className="text-2xl font-black text-blue-700">{users.filter(u => u.organizationId === selectedOrg.id).length}</p>
                                        <p className="text-xs text-blue-600 font-medium">Total Members</p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                                    {users.filter(u => u.organizationId === selectedOrg.id).map(member => (
                                        <div key={member.id} className="flex items-center gap-2 bg-white rounded-xl p-2">
                                            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {member.firstName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="text-sm font-medium theme-text-primary">{member.firstName} {member.lastName}</span>
                                            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${getRoleBadge(member.role)}`}>{member.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Org Participation History from Supabase */}
                            <div className="bg-emerald-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">Contest Participations</p>
                                {orgModalLoading ? (
                                    <div className="flex justify-center py-6">
                                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : orgParticipations.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No participation records for this organization yet.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {orgParticipations.map((p, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3">
                                                <span className="text-lg">{p.event_type === 'QUIZ' ? '📝' : '⚔️'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm theme-text-primary truncate">{p.event_title}</p>
                                                    <p className="text-xs text-gray-400">{p.user_name} · {new Date(p.participated_at).toLocaleDateString()}</p>
                                                </div>
                                                <p className="font-black text-green-600 text-sm">{p.score}/{p.max_score}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default SuperAdminDashboard;
