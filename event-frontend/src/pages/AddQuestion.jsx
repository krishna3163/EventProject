import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const AddQuestion = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
    });

    const handleOptionChange = (idx, value) => {
        const newOptions = [...formData.options];
        newOptions[idx] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.correctAnswer) {
            toast.error('Please select the correct answer');
            return;
        }

        setLoading(true);
        try {
            await apiService.quiz.addQuestion(eventId, formData);
            toast.success('Question added successfully!');
            navigate(`/event/${eventId}/questions`);
        } catch (error) {
            console.error('Error adding question:', error);

            // TEMPORARY: Save to localStorage for demo
            const localKey = `demo_questions_${eventId}`;
            const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
            localStorage.setItem(localKey, JSON.stringify([...existing, { ...formData, id: `q_${Date.now()}` }]));

            toast.success('Question saved (Demo Mode)!');
            navigate(`/event/${eventId}/questions`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-800 mb-2">Add New Question</h1>
                <p className="text-gray-500 font-medium tracking-tight">Craft a precise question and its possible outcomes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="card p-8 space-y-8 glass-effect shadow-2xl border-gray-100">
                    <div className="space-y-4">
                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">The Question</label>
                        <textarea
                            required
                            rows={4}
                            className="input-field resize-none text-lg font-bold"
                            placeholder="Enter your question here..."
                            value={formData.questionText}
                            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="space-y-6">
                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Define Options</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.options.map((opt, idx) => (
                                <div key={idx} className="relative group">
                                    <div className={`absolute -left-3 -top-3 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center font-black text-xs z-10 transition-colors ${formData.correctAnswer === opt && opt !== '' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <div className="flex bg-gray-50 rounded-2xl overflow-hidden border-2 border-transparent focus-within:border-blue-500 transition-all shadow-sm">
                                        <input
                                            type="text"
                                            required
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 bg-transparent p-4 font-bold text-gray-700 outline-none"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, correctAnswer: opt })}
                                            className={`px-4 border-l-2 border-gray-100 hover:bg-emerald-50 transition-colors ${formData.correctAnswer === opt && opt !== '' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 py-5 rounded-[2rem] border-2 border-gray-100 font-black text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                    >
                        Go Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Save Question'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddQuestion;
