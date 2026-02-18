import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    // MongoDB data
    const [events, setEvents] = useState([]);
    const [contests, setContests] = useState([]);

    // Supabase data
    const [myParticipations, setMyParticipations] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('user_favorites') || '[]'));

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Read tab from URL query params (e.g., /?tab=contests)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['events', 'contests', 'history'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // Timer state to trigger re-renders every second
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, contestsRes] = await Promise.allSettled([
                apiService.quiz.getAll(),
                apiService.contest.getAll(),
            ]);

            if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data || []);
            if (contestsRes.status === 'fulfilled') setContests(contestsRes.value.data || []);

            // Supabase: personal participation history
            if (user?.id) {
                const [participations, stats] = await Promise.all([
                    supabaseService.getUserParticipations(user.id),
                    supabaseService.getUserStats(user.id),
                ]);
                setMyParticipations(participations);
                setMyStats(stats);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = (eventId) => {
        const newFavs = favorites.includes(eventId)
            ? favorites.filter(id => id !== eventId)
            : [...favorites, eventId];
        setFavorites(newFavs);
        localStorage.setItem('user_favorites', JSON.stringify(newFavs));
        toast.info(favorites.includes(eventId) ? 'Removed from favorites' : 'Added to favorites');
    };

    const getTimeRemaining = (targetDate) => {
        const total = Date.parse(targetDate) - Date.parse(now);
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return { total, days, hours, minutes, seconds };
    };

    const filteredEvents = events.filter(e =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const liveEvents = events.filter(e => e.status === 'LIVE');

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── HERO ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">🎓 Student</span>
                        {liveEvents.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                🔴 {liveEvents.length} LIVE
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black mb-3">
                        Hello, {user?.firstName || 'Student'}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl font-medium">
                        {events.length} events · {myStats?.totalParticipations || 0} participated · {myStats?.avgScore || 0} avg score
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button onClick={() => setActiveTab('events')}
                            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all">
                            Browse Events
                        </button>
                        <button onClick={() => setActiveTab('history')}
                            className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all">
                            My History
                        </button>
                        <Link to="/profile"
                            className="bg-white/20 text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all">
                            My Profile
                        </Link>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 opacity-20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            </div>

            {/* ── STATS GRID ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total Events', value: events.length, icon: '📋', g: 'from-blue-500 to-blue-600', action: () => setActiveTab('events') },
                    { label: 'Live Now', value: liveEvents.length, icon: '🔴', g: 'from-red-500 to-red-600', action: () => { setActiveTab('events'); setSearchTerm(''); } },
                    { label: 'My Participations', value: myStats?.totalParticipations || 0, icon: '🏆', g: 'from-green-500 to-green-600', action: () => setActiveTab('history') },
                    { label: 'Avg Score', value: myStats?.avgScore || 0, icon: '📊', g: 'from-purple-500 to-purple-600', action: () => setActiveTab('history') },
                    { label: 'Best Rank', value: myStats?.bestRank ? `#${myStats.bestRank}` : '—', icon: '🎖️', g: 'from-orange-500 to-orange-600', action: () => navigate('/profile') },
                ].map((stat, i) => (
                    <div key={i}
                        onClick={stat.action}
                        className={`rounded-2xl bg-gradient-to-br ${stat.g} p-4 text-white shadow-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95`}
                    >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-xs font-medium opacity-80">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-2 p-1 theme-bg-secondary rounded-2xl w-fit flex-wrap">
                {[
                    { id: 'events', label: '📋 Events' },
                    { id: 'contests', label: '⚔️ Contests' },
                    { id: 'history', label: '📈 My History' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'theme-text-secondary hover:theme-text-primary'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════ */}
            {/* EVENTS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'events' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold theme-text-primary text-lg">Available Events</h3>
                    </div>
                    <div className="relative max-w-md">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" className="input-field pl-11" placeholder="Search events..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    {/* Live Events Banner */}
                    {liveEvents.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                            <p className="text-red-500 font-bold text-sm mb-3">🔴 Live Now — Join before time runs out!</p>
                            <div className="flex flex-wrap gap-2">
                                {liveEvents.map(e => (
                                    <Link key={e.id} to={`/quiz/${e.id}`}
                                        className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors animate-pulse">
                                        {e.title} →
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map(event => {
                                const isUpcoming = event.status === 'UPCOMING';
                                const timeLeft = isUpcoming && event.startTime ? getTimeRemaining(event.startTime) : null;
                                const timeLeftStr = timeLeft && timeLeft.total > 0
                                    ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                                    : null;

                                return (
                                    <div key={event.id} className="relative transition-all duration-300 hover:scale-[1.01]">
                                        <EventCard
                                            event={{ ...event, category: 'mcq' }}
                                            isAdmin={false}
                                            onDelete={fetchData}
                                            isFavorite={favorites.includes(event.id)}
                                            onToggleFavorite={() => toggleFavorite(event.id)}
                                            timeLeft={timeLeftStr}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 theme-bg-secondary rounded-3xl border-2 border-dashed border-card-border">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold theme-text-primary mb-2">No events found</h3>
                            <p className="theme-text-secondary">Check back later for new events.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* CONTESTS TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'contests' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold theme-text-primary text-lg">Coding Contests ({contests.length})</h3>
                    </div>
                    {contests.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="text-6xl mb-4">⚔️</div>
                            <p className="theme-text-secondary">No coding contests available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contests.map(contest => {
                                const startTime = contest.startTime ? new Date(contest.startTime) : null;
                                const endTime = contest.endTime ? new Date(contest.endTime) : null;
                                const isLive = startTime && endTime && now >= startTime && now <= endTime;
                                const isUpcoming = startTime && now < startTime;

                                const timeRemaining = isUpcoming ? getTimeRemaining(startTime) : (isLive ? getTimeRemaining(endTime) : null);

                                return (
                                    <div key={contest.id} className="card p-5 hover:shadow-lg transition-shadow border border-card-border">
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg shadow-indigo-200">⚔️</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold theme-text-primary text-lg truncate pr-2">{contest.title || contest.name}</h4>
                                                    {isLive && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                                                    {isUpcoming && <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">UPCOMING</span>}
                                                </div>
                                                <p className="text-sm theme-text-secondary mt-1 line-clamp-2">{contest.description || 'Coding challenge to test your algorithms skills.'}</p>

                                                {/* Timer Display */}
                                                {(isUpcoming || isLive) && timeRemaining && (
                                                    <div className="mt-3 flex items-center gap-2 text-xs font-mono bg-bg-tertiary rounded-lg p-2 w-fit text-text-secondary">
                                                        <span>{isUpcoming ? 'Starts in:' : 'Ends in:'}</span>
                                                        <span className="font-bold text-accent-primary">
                                                            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Link to={`/contest/${contest.id}`}
                                                className={`flex-1 text-center text-sm font-bold py-2.5 rounded-xl transition-all shadow-md ${isUpcoming
                                                    ? 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                                    }`}
                                                onClick={isUpcoming ? (e) => e.preventDefault() : null}
                                            >
                                                {isUpcoming ? 'Starts Soon' : 'Enter Contest 🚀'}
                                            </Link>
                                            <Link to={`/contest/${contest.id}/leaderboard`}
                                                className="text-sm bg-bg-tertiary text-text-secondary font-bold px-4 py-2.5 rounded-xl hover:bg-bg-secondary transition-colors border border-card-border"
                                                title="View Leaderboard">
                                                🏆
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* HISTORY TAB */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === 'history' && (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Participated', value: myStats?.totalParticipations || 0, icon: '🏆', color: 'text-blue-600 bg-blue-500/10' },
                            { label: 'Quizzes', value: myStats?.quizCount || 0, icon: '📝', color: 'text-purple-600 bg-purple-500/10' },
                            { label: 'Contests', value: myStats?.contestCount || 0, icon: '⚔️', color: 'text-indigo-600 bg-indigo-500/10' },
                            { label: 'Avg Score', value: `${myStats?.avgScore || 0}%`, icon: '📊', color: 'text-green-600 bg-green-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className={`rounded-2xl p-4 text-center ${stat.color}`}>
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-xs font-medium opacity-80">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Participation History */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold theme-text-primary">Participation History</h3>
                        </div>
                        {myParticipations.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-3">📊</div>
                                <p className="theme-text-secondary">No participation history yet.</p>
                                <p className="text-sm theme-text-secondary mt-1">Join an event to see your stats here!</p>
                                <button onClick={() => setActiveTab('events')} className="btn-primary mt-4">Browse Events</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myParticipations.map((p, i) => {
                                    const pct = p.max_score > 0 ? Math.round((p.score / p.max_score) * 100) : 0;
                                    return (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-bg-tertiary/50 rounded-2xl hover:bg-bg-secondary transition-colors border border-transparent hover:border-card-border">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${p.event_type === 'QUIZ' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                {p.event_type === 'QUIZ' ? '📝' : '⚔️'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold theme-text-primary truncate">{p.event_title}</p>
                                                <p className="text-xs theme-text-secondary">{new Date(p.participated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                <div className="mt-1.5 h-1.5 bg-bg-tertiary rounded-full overflow-hidden w-full max-w-xs border border-card-border/50">
                                                    <div className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-xl font-black ${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {p.score}/{p.max_score}
                                                </p>
                                                <p className="text-xs theme-text-secondary">{pct}%</p>
                                                {p.rank && <p className="text-xs font-bold text-purple-600">Rank #{p.rank}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
