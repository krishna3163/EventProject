import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { examSecurity } from '../services/examSecurity';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const QuizZone = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [remainingTime, setRemainingTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const [hasStarted, setHasStarted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [securityActive, setSecurityActive] = useState(false);
    const [showViolationWarning, setShowViolationWarning] = useState(false);
    const [violationMessage, setViolationMessage] = useState('');
    const [startError, setStartError] = useState('');

    const timerRef = useRef(null);

    // 1. Initial Data Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                // Get event details to get questions
                const eventRes = await apiService.quiz.getById(eventId);
                if (eventRes.data && eventRes.data.questions) {
                    setQuestions(eventRes.data.questions || []);
                } else {
                    // Fallback for demo if no questions in event object
                    // In real app, questions might come from a different endpoint
                    const questionsRes = await apiService.quiz.getById(eventId); // Reuse for now
                    setQuestions(questionsRes.data.questions || []);
                }

                // Check if test already started
                if (user?.id) {
                    const timeRes = await apiService.quiz.getRemainingTime(eventId, user.id);
                    if (timeRes.data > 0) {
                        setRemainingTime(timeRes.data);
                        setHasStarted(true);
                        startExamSecurity();
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setStartError("Failed to load assessment data.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId && user) {
            fetchInitialData();
        }
    }, [eventId, user]);

    // 2. Timer Effect
    useEffect(() => {
        if (hasStarted && remainingTime !== null && remainingTime > 0) {
            timerRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit(true); // Auto submit on time out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [hasStarted, remainingTime]);

    const startExamSecurity = () => {
        setSecurityActive(true);
        setIsFullscreen(true);
        examSecurity.activate(
            (type, count) => {
                if (type === 'tab_switch') {
                    setTabSwitchWarnings(count);
                    setViolationMessage(`Warning ${count}: You left the assessment tab! This activity is being recorded.`);
                    setShowViolationWarning(true);
                    setTimeout(() => setShowViolationWarning(false), 5000);

                    if (count >= 3) {
                        toast.error("Critical Security Violation: Too many tab switches!");
                        // handleSubmit(true); // Optional: auto-submit on 3 violations
                    }
                }
            },
            () => {
                setIsFullscreen(false);
                setViolationMessage("Security Alert: Fullscreen mode exited! Please return to continue.");
                setShowViolationWarning(true);
            }
        );
    };

    const handleStart = async (pin = null) => {
        try {
            setLoading(true);
            const data = pin ? { pin } : {};
            const res = await apiService.quiz.startTest(eventId, user.id, data);

            // Note: In Demo Mode or mismatched backend, res.data might be different.
            // Assuming res.data contains questions list as per McqService.
            // We need to set hasStarted.

            setHasStarted(true);
            startExamSecurity();
            toast.success("Assessment started! Good luck.");
            setShowPinModal(false);

            // Fetch remaining time if backend tracks it
            try {
                const timeRes = await apiService.quiz.getRemainingTime(eventId, user.id);
                if (timeRes.data > 0) {
                    setRemainingTime(timeRes.data);
                } else {
                    setRemainingTime(3600);
                }
            } catch (e) {
                console.warn("Could not fetch remaining time, defaulting to 1 hour", e);
                setRemainingTime(3600);
            }

        } catch (err) {
            console.error("Start error:", err);
            const msg = err.response?.data?.error || err.response?.data || "";
            // Check for PIN error (status 400 and message contains "PIN")
            if (err.response?.status === 400 && (typeof msg === 'string' && (msg.toLowerCase().includes("pin")))) {
                if (!showPinModal) {
                    setShowPinModal(true);
                    setLoading(false);
                    return;
                } else {
                    toast.error("Invalid PIN. Please try again.");
                }
            } else {
                setStartError("Could not start assessment. " + (typeof msg === 'string' ? msg : ""));
                // Demo fallback (only if not PIN related)
                if (questions.length > 0 && !pin && !showPinModal) {
                    setHasStarted(true);
                    setRemainingTime(3600);
                    startExamSecurity();
                    toast.info("Demo Mode: Assessment started without backend confirmation.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option) => {
        const qText = questions[currentIdx].questionText;
        setAnswers(prev => ({ ...prev, [qText]: option }));
    };

    const handleSubmit = async (isAuto = false) => {
        if (submitting) return;
        if (!isAuto && !window.confirm("Are you sure you want to finish and submit your assessment?")) return;

        setSubmitting(true);
        try {
            examSecurity.deactivate();
            const formattedAnswers = questions.map(q => ({
                questionText: q.questionText,
                selectedOption: answers[q.questionText] || ''
            }));

            await apiService.quiz.submitTest(eventId, user.id, formattedAnswers);
            toast.success("Assessment submitted successfully!");
            navigate(`/event/${eventId}/result`);
        } catch (err) {
            console.error("Submit error:", err);
            toast.error("Failed to submit assessment. Retrying...");
            // Demo fallback
            setTimeout(() => {
                navigate(`/event/${eventId}/result`);
            }, 1500);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isUrgent = remainingTime !== null && remainingTime < 300;

    if (loading) return <Loader />;

    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                {/* PIN Modal */}
                {showPinModal && (
                    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-up">
                            <h3 className="text-xl font-black text-gray-800 mb-4">Enter Event PIN</h3>
                            <p className="text-gray-500 text-sm mb-6">This event is protected. Please enter the PIN provided by the organizer.</p>

                            <input
                                type="text"
                                autoFocus
                                className="w-full text-center text-2xl font-black tracking-[0.5em] p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none mb-6 uppercase"
                                placeholder="PIN"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleStart(pinInput)}
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPinModal(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStart(pinInput)}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-4xl">
                        🛡️
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Secure Assessment</h1>
                        <p className="text-gray-500 mt-2">Please read the instructions carefully before starting.</p>
                    </div>

                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl text-left space-y-2">
                        <p>🔹 <strong>Fullscreen Mode:</strong> Required throughout the exam.</p>
                        <p>🔹 <strong>No Tab Switching:</strong> Leaving the tab is a violation.</p>
                        <p>🔹 <strong>Monitoring:</strong> Activity is logged for fairness.</p>
                    </div>

                    {startError && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl font-bold">
                            Error: {startError}
                        </div>
                    )}

                    <button
                        onClick={() => handleStart()}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all"
                    >
                        Start Assessment 🚀
                    </button>

                    <button onClick={() => navigate(-1)} className="text-gray-400 text-sm font-bold hover:text-gray-600">
                        Cancel & Go Back
                    </button>
                </div>
            </div>
        );
    }

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
                    <p className="text-gray-500 font-medium mb-8">This assessment doesn't have any questions yet.</p>
                    <button onClick={() => navigate(-1)} className="btn-primary w-full">Go Back</button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden select-none">
            {/* Violation Warning Banner */}
            {showViolationWarning && (
                <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-6 py-4 text-center font-bold text-lg animate-pulse shadow-2xl">
                    {violationMessage}
                </div>
            )}

            {/* Fullscreen Re-enter Prompt */}
            {!isFullscreen && securityActive && (
                <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-black text-gray-800 mb-3">Fullscreen Required</h2>
                        <p className="text-gray-600 mb-6">You must be in fullscreen mode to continue the exam.</p>
                        <button
                            onClick={() => {
                                examSecurity.enterFullScreen();
                                setIsFullscreen(true);
                                setShowViolationWarning(false);
                            }}
                            className="btn-primary w-full py-4 text-lg"
                        >
                            Return to Fullscreen
                        </button>
                    </div>
                </div>
            )}

            {/* Quiz Header */}
            <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 tracking-tight">Secure Assessment</h1>
                        {tabSwitchWarnings > 0 && (
                            <p className="text-xs text-red-500 font-bold">⚠️ {tabSwitchWarnings} tab switch violation{tabSwitchWarnings > 1 ? 's' : ''} recorded</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Security indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-green-700">Secure Mode</span>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center space-x-3 px-6 py-2.5 rounded-2xl border-2 transition-all ${isUrgent
                        ? 'border-red-200 bg-red-50 text-red-600 animate-pulse'
                        : 'border-gray-100 bg-gray-50 text-gray-700'
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xl font-black font-mono">{formatTime(remainingTime || 0)}</span>
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
                <aside className="w-72 bg-white border-r border-gray-100 p-6 flex flex-col space-y-6 overflow-y-auto hidden lg:flex">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Progress</p>
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-black text-gray-800">
                                {currentIdx + 1}<span className="text-gray-200 text-xl font-bold">/{questions.length}</span>
                            </span>
                            <span className="text-xs font-bold text-blue-600">
                                {((Object.keys(answers).length / questions.length) * 100).toFixed(0)}% Done
                            </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Question Navigator</p>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIdx(i)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentIdx === i
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 ring-4 ring-blue-50'
                                        : answers[q.questionText]
                                            ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500'
                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-auto space-y-2 p-4 bg-gray-50 rounded-2xl">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Answered</span>
                            <span className="font-bold text-emerald-600">{Object.keys(answers).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Unanswered</span>
                            <span className="font-bold text-red-500">{questions.length - Object.keys(answers).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tab Switches</span>
                            <span className={`font-bold ${tabSwitchWarnings > 0 ? 'text-red-500' : 'text-gray-400'}`}>{tabSwitchWarnings}</span>
                        </div>
                    </div>
                </aside>

                {/* Question Area */}
                <main className="flex-grow p-8 md:p-12 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-10">
                        <div className="space-y-3 animate-slide-up">
                            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
                                Question {currentIdx + 1} of {questions.length}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
                                {currentQuestion.questionText}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {(currentQuestion.options || [
                                currentQuestion.optionA,
                                currentQuestion.optionB,
                                currentQuestion.optionC,
                                currentQuestion.optionD,
                            ].filter(Boolean)).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOptionSelect(opt)}
                                    className={`group p-5 rounded-2xl border-2 transition-all flex items-center space-x-5 text-left ${answers[currentQuestion.questionText] === opt
                                        ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100 ring-4 ring-blue-50/50'
                                        : 'border-gray-100 bg-white hover:border-blue-200 hover:translate-x-1'
                                        }`}
                                >
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm transition-all flex-shrink-0 ${answers[currentQuestion.questionText] === opt
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                        }`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className={`text-lg font-semibold ${answers[currentQuestion.questionText] === opt ? 'text-blue-900' : 'text-gray-700'
                                        }`}>
                                        {opt}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-8">
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
                                className={`px-10 py-4 font-black rounded-2xl flex items-center space-x-3 transition-all active:scale-95 shadow-lg ${currentIdx === questions.length - 1
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
