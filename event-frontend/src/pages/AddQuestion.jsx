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
        correctOptions: [],
        isMultipleChoice: false,
        marks: 5,
        negativeMarks: 0,
    });

    const handleOptionChange = (idx, value) => {
        const newOptions = [...formData.options];
        newOptions[idx] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const toggleCorrectOption = (idx) => {
        if (formData.isMultipleChoice) {
            const newCorrect = formData.correctOptions.includes(idx)
                ? formData.correctOptions.filter(i => i !== idx)
                : [...formData.correctOptions, idx];
            setFormData({ ...formData, correctOptions: newCorrect });
        } else {
            setFormData({ ...formData, correctOptions: [idx] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.correctOptions.length === 0) {
            toast.error('Please select at least one correct answer');
            return;
        }

        const dataToSubmit = {
            ...formData,
            correctOption: formData.correctOptions[0], // backward compatibility
        };

        setLoading(true);
        try {
            await apiService.quiz.addQuestion(eventId, dataToSubmit);
            toast.success('Question added successfully!');
            navigate(`/event/${eventId}/questions`);
        } catch (error) {
            console.error('Error adding question:', error);
            toast.error('Failed to save question');
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
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Question Type</label>
                            <div className="flex gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isMultipleChoice: false, correctOptions: [] })}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!formData.isMultipleChoice ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Single Choice
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isMultipleChoice: true, correctOptions: [] })}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.isMultipleChoice ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Multiple Select
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Marks</label>
                                <input
                                    type="number"
                                    className="w-20 px-3 py-2 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none font-bold"
                                    value={formData.marks}
                                    onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Negative</label>
                                <input
                                    type="number"
                                    className="w-20 px-3 py-2 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none font-bold"
                                    value={formData.negativeMarks}
                                    onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

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
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Define Options</label>
                            <span className="text-xs font-bold text-gray-400 italic">Click the checkmarks to mark correct answers</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.options.map((opt, idx) => {
                                const isCorrect = formData.correctOptions.includes(idx);
                                return (
                                    <div key={idx} className="relative group">
                                        <div className={`absolute -left-3 -top-3 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center font-black text-xs z-10 transition-colors ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className={`flex bg-gray-50 rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent focus-within:border-blue-500'}`}>
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
                                                onClick={() => toggleCorrectOption(idx)}
                                                className={`px-4 border-l-2 border-gray-100 hover:bg-emerald-50 transition-colors ${isCorrect ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
