import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ManageQuestions = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkData, setBulkData] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, [eventId]);

    const fetchQuestions = async () => {
        try {
            const response = await apiService.quiz.getById(eventId);
            setQuestions(response.data.questions || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching questions:', error);

            // TEMPORARY: Load from localStorage for Guest Mode
            const localKey = `demo_questions_${eventId}`;
            const localQuestions = JSON.parse(localStorage.getItem(localKey) || '[]');
            setQuestions(localQuestions);
            setLoading(false);
        }
    };

    const deleteQuestion = async (qId) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await apiService.quiz.deleteQuestion(qId);
            toast.success('Question deleted');
            fetchQuestions();
        } catch (error) {
            console.error('Delete error:', error);

            // TEMPORARY: Delete from localStorage for Demo Mode
            const localKey = `demo_questions_${eventId}`;
            const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
            const filtered = existing.filter(q => q.id !== qId);
            localStorage.setItem(localKey, JSON.stringify(filtered));

            toast.success('Question removed (Demo Mode)');
            fetchQuestions();
        }
    };

    const handleBulkImport = async () => {
        let parsedData;
        try {
            parsedData = JSON.parse(bulkData);
        } catch (e) {
            toast.error('JSON Syntax Error: Please check for missing commas or brackets.');
            return;
        }

        try {
            await apiService.quiz.addBulkQuestions(eventId, parsedData);
            toast.success('Questions imported successfully!');
            setShowBulkModal(false);
            setBulkData('');
            fetchQuestions();
        } catch (error) {
            console.error('Import error:', error);
            const localKey = `demo_questions_${eventId}`;
            const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
            const newQuestions = parsedData.map(q => ({ ...q, id: `q_${Math.random().toString(36).substr(2, 9)}` }));
            localStorage.setItem(localKey, JSON.stringify([...existing, ...newQuestions]));
            toast.success(`Imported ${parsedData.length} questions (Demo Mode)!`);
            setShowBulkModal(false);
            setBulkData('');
            fetchQuestions();
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
            {/* ... rest of the code ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 mb-2">Question Studio</h1>
                    <p className="text-gray-500 font-medium">Manage and organize questions for your MCQ event</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="px-6 py-3 rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Bulk Import</span>
                    </button>
                    <button
                        onClick={() => navigate(`/event/${eventId}/add-question`)}
                        className="btn-primary flex items-center space-x-2 shadow-blue-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Single Question</span>
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                {questions.length > 0 ? (
                    questions.map((q, idx) => (
                        <div key={idx} className="card p-8 group hover:border-blue-500 transition-all glass-effect border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-4">
                                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-800">{q.questionText}</h3>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                    <button
                                        onClick={() => deleteQuestion(q.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${opt === q.correctAnswer
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-gray-50 bg-gray-50 text-gray-600'
                                        }`}>
                                        <span className="font-bold">{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                        {opt === q.correctAnswer && (
                                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-blue-50 p-6 rounded-full inline-block mb-6">
                            <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No questions added yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Start building your quiz by adding single questions or importing a JSON bundle.</p>
                        <button
                            onClick={() => navigate(`/event/${eventId}/add-question`)}
                            className="btn-primary px-10 shadow-blue-100"
                        >
                            Add Your First Question
                        </button>
                    </div>
                )}
            </div>

            {/* Bulk Import Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowBulkModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-3xl p-8 animate-scale-in">
                        <h2 className="text-3xl font-black text-gray-800 mb-4">Bulk Question Import</h2>
                        <p className="text-gray-500 mb-6 font-medium">Paste your array of question objects below. Each object should have <code className="text-blue-600 bg-blue-50 px-2 rounded">questionText</code>, <code className="text-blue-600 bg-blue-50 px-2 rounded">options</code> (Array), and <code className="text-blue-600 bg-blue-50 px-2 rounded">correctAnswer</code>.</p>

                        <textarea
                            className="w-full h-80 input-field font-mono text-sm mb-6 resize-none p-6"
                            placeholder='[{"questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]'
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                        ></textarea>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkImport}
                                disabled={!bulkData}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                            >
                                Start Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageQuestions;
