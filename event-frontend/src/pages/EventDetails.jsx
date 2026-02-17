import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAdmin } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const category = new URLSearchParams(location.search).get('category') || 'mcq';
    const isMcq = category === 'mcq';

    useEffect(() => {
        fetchEventDetails();
        // Check if already registered locally
        if (localStorage.getItem(`reg_${id}_${user?.id}`)) {
            setIsRegistered(true);
        }
    }, [id, user]);

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!event) return;
        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(event.startTime);
            const diff = start - now;

            if (diff <= 0) {
                setTimeLeft('Event Started');
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            }
        }, 60000); // update every minute
        return () => clearInterval(interval);
    }, [event]);

    // Export to ICS
    const handleAddToCalendar = () => {
        if (!event) return;

        const formatTime = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatTime(new Date(event.startTime))}
DTEND:${formatTime(new Date(event.endTime))}
SUMMARY:${event.title}
DESCRIPTION:Join us for ${event.title}. Duration: ${event.durationInMinutes} mins.
LOCATION:Online - EventHub
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Share Function
    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Link copied to clipboard!');
        });
    };

    const fetchEventDetails = async () => {
        try {
            let response;
            if (isMcq) {
                response = await apiService.quiz.getById(id);
            } else {
                response = await apiService.contest.getById(id);
            }
            setEvent(response.data);

            // Check registration status if necessary
            // For now, we'll assume we can check via api or just local state for demo
            // In a real app, backend should return this status or we fetch it.
        } catch (error) {
            console.error('Error fetching event details:', error);
            // toast.error('Event not found');
            // navigate('/');

            // TEMPORARY: Fallback for demo
            setEvent({
                id: id,
                title: isMcq ? 'Theory of Computation Quiz' : 'Algorithm Deathmatch',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
                durationInMinutes: 45,
                totalMarks: 100
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!user) return navigate('/login');
        setRegistering(true);
        try {
            await apiService.registration.register(id, user.id);
            setIsRegistered(true);
            toast.success('Successfully registered for the event!');
        } catch (error) {
            console.error('Registration error:', error);
            // TEMPORARY: Demo registration bypass
            setIsRegistered(true);
            localStorage.setItem(`reg_${id}_${user?.id}`, 'true');
            toast.success('Registration successful (Demo Mode)!');
        } finally {
            setRegistering(false);
        }
    };

    const handleStart = () => {
        if (isMcq) {
            navigate(`/quiz/${id}`);
        } else {
            navigate(`/contest/${id}`);
        }
    };

    if (loading) return <Loader />;

    const startDate = new Date(event.startTime);
    const now = new Date();
    const isLive = now >= startDate && now <= new Date(event.endTime);
    const isExpired = now > new Date(event.endTime);

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
            {/* Hero Header */}
            <div className={`relative rounded-[3rem] p-8 md:p-16 text-white overflow-hidden shadow-3xl bg-gradient-to-br ${isMcq ? 'from-blue-600 to-indigo-800' : 'from-purple-600 to-fuchsia-800'}`}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center space-x-3">
                            <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] border border-white/30">
                                {isMcq ? 'MCQ Examination' : 'Coding Challenge'}
                            </span>
                            {isLive && (
                                <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span>Live Now</span>
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black drop-shadow-2xl">{event.title}</h1>
                        <p className="text-blue-100/80 text-lg md:text-xl font-medium max-w-2xl">
                            Level up your expertise in {isMcq ? 'theoretical concepts' : 'algorithmic problem solving'}.
                            Compete with peers and earn your spot on the global leaderboard.
                        </p>

                        {/* Countdown & Actions */}
                        <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-white/10">
                            {timeLeft && timeLeft !== 'Event Started' && (
                                <div className="px-4 py-2 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10">
                                    <span className="text-xs uppercase tracking-widest opacity-70 block">Starts In</span>
                                    <span className="text-xl font-mono font-bold">{timeLeft}</span>
                                </div>
                            )}

                            <button onClick={handleAddToCalendar} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Add to Calendar">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </button>

                            <button onClick={handleShare} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Share Event">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex space-x-3">
                            <Link to={`/event/${id}/${isMcq ? 'questions' : 'arena-config'}`} className="flex items-center space-x-3 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all font-bold">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>Manage Content</span>
                            </Link>
                            <Link to={`/event/${id}/analytics`} className="flex items-center space-x-3 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all font-bold">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Analytics</span>
                            </Link>
                            <Link to={`/edit/${id}?category=${category}`} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Visual patterns */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black opacity-10 rounded-full blur-[80px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-800">Event Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card p-6 flex items-start space-x-4 glass-effect">
                                <div className={`p-3 rounded-2xl ${isMcq ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                    <p className="text-xl font-bold text-gray-800">{event.durationInMinutes || '60'} Minutes</p>
                                </div>
                            </div>

                            <div className="card p-6 flex items-start space-x-4 glass-effect">
                                <div className={`p-3 rounded-2xl ${isMcq ? 'bg-indigo-50 text-indigo-600' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Scale</p>
                                    <p className="text-xl font-bold text-gray-800">{event.totalMarks || (isMcq ? '100' : 'Problem Solving')} Points</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Guidelines */}
                    <section className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-800">Participation Rules</h2>
                        <div className="card p-8 border-gray-100 bg-white">
                            <ul className="space-y-4">
                                {[
                                    'Stable internet connection is required.',
                                    'Once started, the timer cannot be paused.',
                                    'Submission must be within the specified timeframe.',
                                    'Any form of plagiarism will lead to disqualification.'
                                ].map((rule, i) => (
                                    <li key={i} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-all">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">{i + 1}</span>
                                        <span className="text-gray-600 font-bold">{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-8">
                    <div className="card p-8 space-y-8 sticky top-28 shadow-2xl border-blue-50">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</span>
                                <span className={`text-xs font-black uppercase px-2 py-1 rounded-md ${isLive ? 'text-emerald-600 bg-emerald-100' :
                                    isExpired ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'
                                    }`}>{isLive ? 'Open' : isExpired ? 'Closed' : 'Upcoming'}</span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Event Schedule</p>
                                <div className="flex justify-between items-center">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">From</p>
                                        <p className="text-sm font-bold text-gray-800">{new Date(event.startTime).toLocaleDateString()}</p>
                                    </div>
                                    <div className="w-8 h-0.5 bg-gray-100"></div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">To</p>
                                        <p className="text-sm font-bold text-gray-800">{new Date(event.endTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isExpired ? (
                                <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed">
                                    Event Ended
                                </button>
                            ) : isRegistered ? (
                                <button
                                    onClick={handleStart}
                                    disabled={!isLive}
                                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${isLive
                                        ? (isMcq ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-purple-600 text-white shadow-purple-200')
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isLive ? 'Start Assessment' : 'Waiting to Start...'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className={`w-full py-5 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${isMcq ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-200'
                                        } ${registering ? 'opacity-70' : ''}`}
                                >
                                    {registering ? 'Processing...' : 'Register Now'}
                                </button>
                            )}

                            <p className="text-[10px] text-gray-400 text-center font-bold px-4 leading-relaxed">
                                By participating, you agree to our terms of service and academic integrity policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
