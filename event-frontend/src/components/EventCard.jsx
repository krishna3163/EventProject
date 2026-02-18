import React from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const EventCard = ({ event, isAdmin, onDelete, isFavorite, onToggleFavorite, viewMode = 'grid', timeLeft }) => {
    const { id, title, type, startTime, endTime, category } = event;

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                if (id.startsWith('demo_')) {
                    const localKey = isMcq ? 'demo_quizzes' : 'demo_contests';
                    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
                    const filtered = existing.filter(ev => ev.id !== id);
                    localStorage.setItem(localKey, JSON.stringify(filtered));
                    toast.success('Demo event removed');
                } else {
                    if (category === 'mcq') {
                        await apiService.quiz.delete(id);
                    } else {
                        await apiService.contest.delete(id);
                    }
                    toast.success('Event deleted successfully');
                }
                onDelete && onDelete();
            } catch (error) {
                console.error('Delete error:', error);
                // Even if backend fails, if it's a real item we might want to simulate success for the demo
                if (error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
                    toast.info('Item removed from view (Demo Mode)');
                    onDelete && onDelete();
                }
            }
        }
    };

    const isMcq = category === 'mcq';

    if (viewMode === 'list') {
        return (
            <div className="group relative bg-bg-secondary rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-card-border flex items-center p-4 gap-6 animate-fade-in hover:bg-bg-tertiary/50">
                <div className={`w-2 h-24 rounded-full ${isMcq ? 'bg-accent-primary' : 'bg-accent-secondary'}`}></div>

                <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isMcq ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                            {type || (isMcq ? 'MCQ' : 'Coding')}
                        </span>
                        <span className="text-xs text-text-secondary font-medium">{formatDate(startTime)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">{title}</h3>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={(e) => { e.preventDefault(); onToggleFavorite && onToggleFavorite(); }}
                        className={`p-2 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-text-secondary hover:text-red-400 hover:bg-bg-tertiary'}`}
                    >
                        <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    <Link
                        to={`/event/${id}?category=${category}`}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${isMcq ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-purple-600 to-purple-500'}`}
                    >
                        View
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative bg-bg-secondary rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-card-border flex flex-col h-full transform hover:-translate-y-2 card-hover">
            {/* Visual Header */}
            <div className={`h-40 bg-gradient-to-br ${isMcq ? 'from-blue-600 via-indigo-700 to-indigo-800' : 'from-purple-600 via-purple-700 to-fuchsia-800'} p-6 relative overflow-hidden`}>
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-sm">
                        {type || (isMcq ? 'MCQ' : 'Coding')}
                    </span>
                </div>

                {/* Favorite Button - Repositioned to avoid overlap */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={(e) => { e.preventDefault(); onToggleFavorite && onToggleFavorite(); }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-sm ${isFavorite ? 'bg-red-500 text-white border-red-400' : 'bg-white/20 text-white hover:bg-white/40'
                            }`}
                    >
                        <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Title */}
                <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-2xl font-black text-white line-clamp-2 leading-tight group-hover:drop-shadow-lg transition-all">
                        {title}
                    </h3>
                    {timeLeft && (
                        <div className="mt-2 inline-flex items-center gap-2 bg-yellow-400/90 text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                            Starts in: {timeLeft}
                        </div>
                    )}
                </div>

                {/* Abstract pattern */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col bg-bg-secondary transition-colors duration-300">
                <div className="space-y-4 flex-grow">
                    {/* Timeline */}
                    <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-bg-tertiary transition-colors ${isMcq ? 'text-accent-primary' : 'text-accent-secondary'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">Starts</p>
                            <p className="text-sm font-bold text-text-primary">{formatDate(startTime)}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-bg-tertiary transition-colors ${isMcq ? 'text-accent-primary' : 'text-accent-secondary'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">Ends</p>
                            <p className="text-sm font-bold text-text-primary">{formatDate(endTime)}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-between">
                    <Link
                        to={`/event/${id}?category=${category}`}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-white ${isMcq
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/30'
                            : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:shadow-purple-500/30'
                            }`}
                    >
                        Enter {isMcq ? 'Quiz' : 'Contest'}
                    </Link>

                    {isAdmin && (
                        <div className="flex items-center space-x-2">
                            <Link
                                to={`/event/${id}/analytics`}
                                className="p-2.5 text-text-secondary hover:text-status-success hover:bg-status-success/10 rounded-xl transition-all"
                                title="Analytics"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </Link>
                            <Link
                                to={`/edit/${id}?category=${category}`}
                                className="p-2.5 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-xl transition-all"
                                title="Edit"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="p-2.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-xl transition-all"
                                title="Delete"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
