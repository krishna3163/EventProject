import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const Leaderboard = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // Real-time update every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [contestId]);

    const fetchData = async () => {
        try {
            const [contestRes, leaderboardRes] = await Promise.all([
                apiService.contest.getById(contestId),
                apiService.leaderboard.get(contestId)
            ]);
            setContest(contestRes.data);
            setLeaderboard(leaderboardRes.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Leaderboard error:', err);
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-amber-50 rounded-3xl border-2 border-amber-100 mb-4 animate-bounce">
                    <svg className="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <h1 className="text-5xl font-black text-gray-800 tracking-tight">Clash of Titans</h1>
                <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
                    Live rankings for <span className="text-purple-600 font-bold">{contest?.title}</span>.
                    The board refreshes automatically as submissions are processed.
                </p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto">
                {/* 2nd Place */}
                {leaderboard[1] && (
                    <div className="order-2 md:order-1 card p-8 bg-white border-blue-50 flex flex-col items-center space-y-6 transform hover:scale-105 transition-all">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-black text-2xl text-blue-600 border-4 border-white shadow-xl">
                                {leaderboard[1].username[0]}
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-200 border-4 border-white rounded-full flex items-center justify-center font-black text-gray-600 text-sm">2</span>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-gray-800 text-lg">{leaderboard[1].username}</p>
                            <p className="text-blue-500 font-black text-2xl mt-1">{leaderboard[1].totalScore < 0 ? 0 : leaderboard[1].totalScore} <span className="text-xs uppercase opacity-50">PTS</span></p>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {leaderboard[0] && (
                    <div className="order-1 md:order-2 card p-10 bg-gradient-to-b from-amber-50 to-white border-amber-200 flex flex-col items-center space-y-6 scale-125 relative z-10 shadow-3xl">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-4xl text-white border-4 border-white shadow-2xl">
                                {leaderboard[0].username[0]}
                            </div>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-pulse">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0v-7.268a2 2 0 000-3.464V4zM16 4a1 1 0 10-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4z" /></svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-gray-800 text-2xl">{leaderboard[0].username}</p>
                            <p className="text-amber-600 font-black text-4xl mt-1">{leaderboard[0].totalScore < 0 ? 0 : leaderboard[0].totalScore} <span className="text-xs uppercase opacity-50">PTS</span></p>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {leaderboard[2] && (
                    <div className="order-3 card p-8 bg-white border-orange-50 flex flex-col items-center space-y-6 transform hover:scale-105 transition-all">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center font-black text-xl text-orange-600 border-4 border-white shadow-xl">
                                {leaderboard[2].username[0]}
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-9 h-9 bg-orange-100 border-4 border-white rounded-full flex items-center justify-center font-black text-orange-600 text-sm">3</span>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-gray-800 text-lg">{leaderboard[2].username}</p>
                            <p className="text-orange-600 font-black text-xl mt-1">{leaderboard[2].totalScore < 0 ? 0 : leaderboard[2].totalScore} <span className="text-xs uppercase opacity-50">PTS</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Rankings */}
            <div className="card p-0 overflow-hidden shadow-2xl border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="py-6 px-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Global Rank</th>
                            <th className="py-6 px-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">Contestant</th>
                            <th className="py-6 px-8 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, i) => (
                            <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50/30 transition-all ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}>
                                <td className="py-6 px-8">
                                    <div className="flex items-center space-x-4">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${i < 3 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                                            }`}>{i + 1}</span>
                                        {i < 3 && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                                    </div>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 uppercase">{entry.username[0]}</div>
                                        <div>
                                            <p className="font-black text-gray-800">{entry.username}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Verified Participant</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-6 px-8 text-center">
                                    <span className="text-2xl font-black text-gray-800">{entry.totalScore < 0 ? 0 : entry.totalScore}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leaderboard.length === 0 && (
                    <div className="py-32 text-center text-gray-400 font-medium italic">
                        No submissions yet. Be the first to claim the throne!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
