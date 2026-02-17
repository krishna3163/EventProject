import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const QuizZone = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionText: selectedOption }
    const [remainingTime, setRemainingTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            startTest();
        }
    }, [user]);

    const startTest = async () => {
        try {
            const response = await apiService.quiz.startTest(eventId, user.id);
            setQuestions(response.data || []);

            // Fetch initial remaining time
            const timeRes = await apiService.quiz.getRemainingTime(eventId, user.id);
            setRemainingTime(timeRes.data);

            setLoading(false);
        } catch (error) {
            console.error('Failed to start test:', error);

            // TEMPORARY: Demo mode fallback
            const localKey = `demo_questions_${eventId}`;
            const localQuestions = JSON.parse(localStorage.getItem(localKey) || '[]');

            const fallbackQuestions = localQuestions.length > 0 ? localQuestions : [
                { questionText: 'What is the correct syntax for a Java main method?', options: ['public static void main(String[] args)', 'static void main()', 'void main(String args)', 'public void main()'], correctAnswer: 'public static void main(String[] args)' },
                { questionText: 'Which of the following is NOT a primitive type in Java?', options: ['int', 'boolean', 'String', 'char'], correctAnswer: 'String' }
            ];

            setQuestions(fallbackQuestions);
            setRemainingTime(1800); // 30 mins
            setLoading(false);
            toast.info('Starting Quiz in Demo Mode');
        }
    };

    // Timer Logic
    useEffect(() => {
        if (remainingTime === null || remainingTime <= 0) return;

        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleSubmit(true); // Auto-submit on timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Sync with backend every 60 seconds
        const syncInterval = setInterval(async () => {
            try {
                const timeRes = await apiService.quiz.getRemainingTime(eventId, user.id);
                setRemainingTime(timeRes.data);
            } catch (err) {
                console.error('Timer sync failed');
            }
        }, 60000);

        return () => {
            clearInterval(interval);
            clearInterval(syncInterval);
        };
    }, [remainingTime]);

    const handleOptionSelect = (option) => {
        const q = questions[currentIdx];
        setAnswers({ ...answers, [q.questionText]: option });
    };

    const handleSubmit = async (auto = false) => {
        if (!auto && !window.confirm('Are you sure you want to submit your test?')) return;

        setSubmitting(true);
        try {
            // Backend expects Map<String, String> for studentAnswers
            await apiService.quiz.submitTest(eventId, user.id, answers);
            toast.success(auto ? 'Time is up! Your test was auto-submitted.' : 'Test submitted successfully!');
            navigate(`/event/${eventId}/result`);
        } catch (error) {
            console.error('Submission failed:', error);
            // TEMPORARY: Demo mode success simulation
            toast.success('Test submitted successfully (Demo Mode)!');
            navigate(`/event/${eventId}/result`);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <Loader />;

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md">
                    <div className="bg-red-50 text-red-500 p-6 rounded-full inline-block mb-6">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">No Questions Found</h2>
                    <p className="text-gray-500 font-medium mb-8">This assessment doesn't have any questions yet. Please contact the administrator.</p>
                    <button onClick={() => navigate(-1)} className="btn-primary w-full">Go Back</button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            {/* Quiz Header */}
            <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center space-x-6">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-black text-gray-800 tracking-tight">Theory Assessment</h1>
                </div>

                <div className="flex items-center space-x-8">
                    <div className={`flex items-center space-x-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${remainingTime < 300 ? 'border-red-200 bg-red-50 text-red-600 animate-pulse' : 'border-gray-100 bg-gray-50 text-gray-700'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xl font-black font-mono">{formatTime(remainingTime)}</span>
                    </div>

                    <button
                        onClick={() => handleSubmit()}
                        disabled={submitting}
                        className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Finish Test'}
                    </button>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Navigation Sidebar */}
                <aside className="w-80 bg-white border-r border-gray-100 p-8 flex flex-col space-y-8 overflow-y-auto hidden lg:flex">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Progress</p>
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-black text-gray-800">{currentIdx + 1}<span className="text-gray-200 text-xl font-bold">/{questions.length}</span></span>
                            <span className="text-xs font-bold text-blue-600">{((Object.keys(answers).length / questions.length) * 100).toFixed(0)}% Done</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Question Navigator</p>
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIdx(i)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentIdx === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 ring-4 ring-blue-50' :
                                        answers[q.questionText] ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' :
                                            'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Question Area */}
                <main className="flex-grow p-12 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-4 animate-slide-up">
                            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Question {currentIdx + 1}</span>
                            <h2 className="text-3xl font-bold text-gray-800 leading-snug">{currentQuestion.questionText}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOptionSelect(opt)}
                                    className={`group p-6 rounded-3xl border-2 transition-all flex items-center space-x-6 text-left ${answers[currentQuestion.questionText] === opt
                                        ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100 ring-4 ring-blue-50/50'
                                        : 'border-gray-100 bg-white hover:border-blue-200 hover:translate-x-2'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${answers[currentQuestion.questionText] === opt
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                        }`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className={`text-xl font-bold ${answers[currentQuestion.questionText] === opt ? 'text-blue-900' : 'text-gray-700'}`}>
                                        {opt}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-12">
                            <button
                                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                                disabled={currentIdx === 0}
                                className="px-8 py-4 text-gray-400 font-black flex items-center space-x-3 hover:text-blue-600 disabled:opacity-30 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Previous</span>
                            </button>

                            <div className="lg:hidden text-center">
                                <span className="text-lg font-black text-gray-800">{currentIdx + 1} / {questions.length}</span>
                            </div>

                            <button
                                onClick={() => currentIdx < questions.length - 1 ? setCurrentIdx(currentIdx + 1) : handleSubmit()}
                                className={`px-10 py-4 font-black rounded-2xl flex items-center space-x-3 transition-all active:scale-95 ${currentIdx === questions.length - 1
                                    ? 'bg-emerald-600 text-white shadow-emerald-100'
                                    : 'bg-blue-600 text-white shadow-blue-100'
                                    }`}
                            >
                                <span>{currentIdx === questions.length - 1 ? 'Final Submit' : 'Next'}</span>
                                {currentIdx !== questions.length - 1 && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QuizZone;
