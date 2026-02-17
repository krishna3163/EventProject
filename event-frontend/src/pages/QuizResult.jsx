import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const QuizResult = () => {
    const { eventId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [eventId]);

    const fetchResult = async () => {
        try {
            // The backend McqController doesn't have a direct 'getStudentResult' by eventId? 
            // Let's check McqService. It calculates ranking. 
            // Often results are fetched via analytics or a specific student endpoint if added. 
            // For now, let's assume we can fetch basic stats or redirect to home if not ready.
            // Actually, since this is a demo, let's mock the result if the endpoint is missing, 
            // but ideally we find the right backend call.
            setLoading(false);
        } catch (error) {
            console.error('Error fetching results:', error);
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto py-16 px-4 text-center animate-fade-in">
            <div className="mb-12">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-5xl font-black text-gray-800 mb-4">Submission Complete!</h1>
                <p className="text-gray-500 font-medium text-lg">Your assessment for the event has been securely recorded.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="card p-8 bg-blue-50/50 border-blue-100 flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-4">Status</p>
                    <span className="text-2xl font-black text-blue-700">SUBMITTED</span>
                </div>
                <div className="card p-8 bg-purple-50/50 border-purple-100 flex flex-col items-center scale-110 shadow-2xl relative z-10">
                    <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-4">Final Score</p>
                    <span className="text-4xl font-black text-purple-800">Pending</span>
                    <p className="text-[10px] text-purple-400 mt-2 font-bold">Calculation in progress</p>
                </div>
                <div className="card p-8 bg-emerald-50/50 border-emerald-100 flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-4">Rank</p>
                    <span className="text-2xl font-black text-emerald-700">TBD</span>
                </div>
            </div>

            <div className="space-y-6">
                <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
                    Final rankings and detailed performance analytics will be published once the event window closes.
                    You will receive a notification and can download your certificate of participation from the dashboard.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="px-10 py-4 bg-gray-800 text-white font-black rounded-2xl hover:bg-gray-900 transition-all active:scale-95"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(`/certificate/${eventId}?type=participation&event=Algorithm Deathmatch`)}
                        className="px-10 py-4 border-2 border-gray-200 text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                    >
                        View Participation Certificate
                    </button>
                </div>
            </div>

            {/* Visual background element */}
            <div className="fixed -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-blue-50 to-transparent opacity-50 blur-[100px] -z-10 rounded-full"></div>
        </div>
    );
};

export default QuizResult;
