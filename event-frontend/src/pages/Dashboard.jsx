import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('mcq'); // 'mcq' or 'coding'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'live', 'past', 'favorites'
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'duration_asc', 'duration_desc'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [favorites, setFavorites] = useState([]);
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(savedFavorites);
    }, []);

    const toggleFavorite = (eventId) => {
        let newFavorites;
        if (favorites.includes(eventId)) {
            newFavorites = favorites.filter(id => id !== eventId);
            toast.info('Removed from favorites');
        } else {
            newFavorites = [...favorites, eventId];
            toast.success('Added to favorites');
        }
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, contestsRes] = await Promise.all([
                apiService.quiz.getAll(),
                apiService.contest.getAll()
            ]);
            setEvents(eventsRes.data || []);
            setContests(contestsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);

            // TEMPORARY: Load from localStorage + Fallback mock data
            const localQuizzes = JSON.parse(localStorage.getItem('demo_quizzes') || '[]');
            const localContests = JSON.parse(localStorage.getItem('demo_contests') || '[]');

            setEvents([
                ...localQuizzes,
                { id: 'm1', title: 'Full Stack Java Quiz', durationInMinutes: 30, totalMarks: 100, status: 'LIVE' },
                { id: 'm2', title: 'React Performance MCQ', durationInMinutes: 15, totalMarks: 50, status: 'UPCOMING' }
            ]);
            setContests([
                ...localContests,
                { id: 'c1', title: 'Valentine Code Bash', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), status: 'LIVE' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredAndSortedItems = () => {
        let items = activeTab === 'mcq' ? events : contests;

        // 1. Search
        items = items.filter(item =>
            item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Filter Status/Favorites
        const now = new Date();
        if (filterStatus === 'favorites') {
            items = items.filter(item => favorites.includes(item.id));
        } else if (filterStatus === 'live') {
            items = items.filter(item => {
                const start = new Date(item.startTime);
                const end = new Date(item.endTime);
                return now >= start && now <= end;
            });
        } else if (filterStatus === 'upcoming') {
            items = items.filter(item => new Date(item.startTime) > now);
        } else if (filterStatus === 'past') {
            items = items.filter(item => new Date(item.endTime) < now);
        }

        // 3. Sort
        items.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.startTime) - new Date(a.startTime);
            if (sortBy === 'oldest') return new Date(a.startTime) - new Date(b.startTime);
            if (sortBy === 'duration_asc') return (a.durationInMinutes || 0) - (b.durationInMinutes || 0);
            if (sortBy === 'duration_desc') return (b.durationInMinutes || 0) - (a.durationInMinutes || 0);
            return 0;
        });

        return items;
    };

    const filteredItems = getFilteredAndSortedItems();

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-700 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-4">
                        Hello, {user?.firstName || 'Innovator'}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl font-medium">
                        Explore {events.length + contests.length} active opportunities. Showcase your skills, compete with the best, and level up your career.
                    </p>

                    {isAdmin && (
                        <div className="mt-8 flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/create')}
                                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all flex items-center space-x-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Create New Event</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex p-1 bg-gray-100 rounded-xl space-x-1 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('mcq')}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'mcq' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        MCQ Quizzes ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('coding')}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'coding' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Coding Contests ({contests.length})
                    </button>
                </div>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="input-field pl-12"
                        placeholder={`Search ${activeTab === 'mcq' ? 'quizzes' : 'contests'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid/List */}
            {filteredItems.length > 0 ? (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12' : 'flex flex-col gap-4 pb-12'}`}>
                    {filteredItems.map((item) => (
                        <EventCard
                            key={item.id}
                            event={{ ...item, category: activeTab }}
                            isAdmin={isAdmin}
                            onDelete={fetchData}
                            isFavorite={favorites.includes(item.id)}
                            onToggleFavorite={() => toggleFavorite(item.id)}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-100 p-6 rounded-full inline-block mb-6">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No {activeTab === 'mcq' ? 'quizzes' : 'contests'} found</h3>
                    <p className="text-gray-500 mb-8">Try adjusting your search or check back later for new events.</p>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/create')}
                            className="btn-primary"
                        >
                            Post First {activeTab === 'mcq' ? 'Quiz' : 'Contest'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
