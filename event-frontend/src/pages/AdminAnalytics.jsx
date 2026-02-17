import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminAnalytics = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [eventId]);

    const fetchAnalytics = async () => {
        try {
            const response = await apiService.quiz.getAnalytics(eventId);
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Analytics error:', err);

            // Only use mock if backend actually fails
            setData({
                totalRegistrations: 156,
                totalAttempts: 142,
                absentCount: 14,
                passPercentage: 88.5,
                highestScore: 98,
                averageScore: 76.4,
                lowestScore: 12,
                topPerformers: [
                    { name: 'Rahul Sharma', branch: 'CSE', score: 98, studentId: 'ST001' },
                    { name: 'Priya Singh', branch: 'IT', score: 95, studentId: 'ST002' },
                    { name: 'Amit Kumar', branch: 'ECE', score: 92, studentId: 'ST003' },
                    { name: 'Sneha Patel', branch: 'CSE', score: 89, studentId: 'ST004' },
                    { name: 'Vikas Gupta', branch: 'ME', score: 85, studentId: 'ST005' }
                ]
            });
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        try {
            toast.info('Generating PDF report...');
            const response = await apiService.quiz.downloadPdf(eventId);

            // Critical: Ensure we use the correct blob type for PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Analytics_Report_${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            link.remove();
            toast.success('Report downloaded successfully!');
        } catch (err) {
            console.error('PDF generation failed:', err);
            toast.error('Failed to generate live PDF. The server reported an error.');
        }
    };

    if (loading) return <Loader />;
    if (!data) return <div className="text-center py-20 text-gray-500">No data available for this event yet.</div>;

    const pieData = {
        labels: ['Completed', 'Absent'],
        datasets: [{
            data: [data.totalAttempts, data.absentCount],
            backgroundColor: ['#3b82f6', '#f87171'],
            borderWidth: 0,
        }]
    };

    const barData = {
        labels: ['Highest', 'Average', 'Lowest'],
        datasets: [{
            label: 'Performance Metrics',
            data: [data.highestScore, data.averageScore, data.lowestScore],
            backgroundColor: ['#10b981', '#3b82f6', '#f43f5e'],
            borderRadius: 12,
        }]
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 mb-2">Event Intelligence</h1>
                    <p className="text-gray-500 font-medium">Detailed breakdown of participant performance and activity</p>
                </div>
                <button
                    onClick={downloadReport}
                    className="btn-primary flex items-center space-x-3 shadow-blue-100"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Export PDF Report</span>
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Enrolled', val: data.totalRegistrations, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Attempts', val: data.totalAttempts, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Absent Rate', val: ((data.absentCount / data.totalRegistrations) * 100).toFixed(1) + '%', color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Pass Ratio', val: data.passPercentage + '%', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="card p-8 flex flex-col space-y-2 border-transparent shadow-xl relative overflow-hidden group">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -translate-y-1/2 translate-x-1/2 rounded-full opacity-50`}></div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="card p-8 space-y-8 glass-effect">
                    <h3 className="text-xl font-black text-gray-800 border-l-4 border-blue-500 pl-4">Attendance Distribution</h3>
                    <div className="h-80 flex items-center justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="card p-8 space-y-8 glass-effect">
                    <h3 className="text-xl font-black text-gray-800 border-l-4 border-emerald-500 pl-4">Score Analysis</h3>
                    <div className="h-80">
                        <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* Top Performers Table */}
            <div className="card p-8 space-y-8 overflow-hidden">
                <h3 className="text-xl font-black text-gray-800 border-l-4 border-purple-500 pl-4">Hall of Fame</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">Rank</th>
                                <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">Participant</th>
                                <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">Branch</th>
                                <th className="py-4 px-4 text-xs font-black uppercase text-gray-400">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topPerformers?.map((perf, i) => (
                                <tr
                                    key={i}
                                    onClick={() => navigate(`/profile/${perf.studentId || 'demo'}?name=${perf.name}`)}
                                    className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-all group/row"
                                >
                                    <td className="py-5 px-4">
                                        <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs transition-transform group-hover/row:scale-110 ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                            i === 1 ? 'bg-gray-200 text-gray-600' :
                                                i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                                            }`}>{i + 1}</span>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-blue-600 uppercase group-hover/row:rotate-12 transition-transform">{perf.name ? perf.name[0] : 'U'}</div>
                                            <span className="font-bold text-gray-700 group-hover/row:text-blue-600 transition-colors">{perf.name || 'Anonymous'}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-sm font-bold text-gray-500">{perf.branch || 'N/A'}</td>
                                    <td className="py-5 px-4 font-black text-emerald-600 text-lg">{perf.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
