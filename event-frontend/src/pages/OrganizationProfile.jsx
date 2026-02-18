import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Loader from '../components/Loader';

const OrganizationProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [org, setOrg] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [orgRes, eventsRes] = await Promise.all([
                apiService.organization.getPublicProfile(id),
                apiService.organization.getPublicEvents(id)
            ]);
            setOrg(orgRes.data);
            setEvents(eventsRes.data);
        } catch (error) {
            console.error('Error fetching org profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!org) return <div className="text-center py-20 text-gray-500 font-bold">Organization Not Found</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in">
            {/* Header / Banner */}
            <div className="relative mb-16 rounded-[3rem] overflow-hidden shadow-2xl theme-bg-secondary h-80 flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                <div className="absolute inset-0 bg-pattern opacity-20"></div>
                <div className="relative z-10 text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center text-4xl font-black text-indigo-900 shadow-xl border-4 border-indigo-200">
                        {org.logoUrl ? <img src={org.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover" /> : org.name[0]}
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight">{org.name}</h1>
                    <p className="text-indigo-200 text-lg font-medium max-w-2xl mx-auto">{org.description || 'Welcome to our official event page. Join our contests and prove your skills!'}</p>

                    {org.website && (
                        <a href={org.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold hover:bg-white/20 transition-all border border-white/20">
                            Visit Website →
                        </a>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="card p-8 space-y-6 glass-effect border-indigo-100">
                        <h3 className="text-xl font-black theme-text-primary border-l-4 border-indigo-500 pl-4">About Us</h3>
                        <div className="space-y-4 text-sm font-medium theme-text-secondary">
                            <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                                <span>{org.email || 'Contact Hidden'}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></span>
                                <span>{org.contactNumber || 'No Phone'}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span>
                                <span>Joined {new Date(org.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black theme-text-primary">Hosted Events</h2>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                            {events.length} Events
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.length > 0 ? events.map(event => (
                            <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="cursor-pointer group relative p-8 rounded-[2rem] theme-bg-secondary border border-gray-100 hover:border-indigo-200 transition-all hover:shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-9xl theme-text-primary pointer-events-none group-hover:scale-110 transition-transform">#</div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${event.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                                                event.status === 'LIVE' ? 'bg-red-50 text-red-600 animate-pulse' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {event.status}
                                        </span>
                                        <span className="text-xs font-bold theme-text-secondary">{Math.floor(event.durationInMinutes)} mins</span>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black theme-text-primary mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                        <p className="text-sm theme-text-secondary line-clamp-2">{event.description || 'No description provided.'}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="text-xs font-black uppercase theme-text-secondary">
                                            {new Date(event.startTime).toLocaleDateString()}
                                        </div>
                                        <span className="text-indigo-600 font-black text-xs tracking-widest flex items-center group-hover:translate-x-1 transition-transform">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center theme-bg-tertiary rounded-[2rem] border-2 border-dashed border-gray-200">
                                <p className="theme-text-secondary font-black text-lg">No public events listed yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfile;
