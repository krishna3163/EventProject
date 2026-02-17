import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import EventForm from '../components/EventForm';
import { toast } from 'react-toastify';

const CreateEvent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateEvent = async (data, category) => {
        setIsLoading(true);
        try {
            if (category === 'mcq') {
                await apiService.quiz.create(data);
                toast.success('MCQ Quiz created successfully!');
            } else {
                await apiService.contest.create(data);
                toast.success('Coding Contest created successfully!');
            }
            navigate('/');
        } catch (error) {
            console.error('Error creating event:', error);

            // TEMPORARY: Session persistence for Guest Mode
            const localKey = category === 'mcq' ? 'demo_quizzes' : 'demo_contests';
            const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
            const newEvent = {
                ...data,
                id: `demo_${Date.now()}`,
                status: 'LIVE',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(localKey, JSON.stringify([newEvent, ...existing]));

            toast.success(`${category === 'mcq' ? 'MCQ Quiz' : 'Coding Contest'} created (Session Saved)!`);
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Page Header */}
            <div className="mb-12 text-center">
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Host New Challenge
                </h1>
                <p className="text-gray-500 text-xl font-medium">Define parameters and launch your competition to the community</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <EventForm onSubmit={handleCreateEvent} isLoading={isLoading} />
                </div>

                {/* Info/Help Section */}
                <div className="space-y-6">
                    <div className="card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
                        <div className="bg-blue-600 p-3 rounded-2xl w-fit mb-4 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Quiz Setup</h3>
                        <p className="text-blue-800/70 text-sm font-medium">For MCQ events, specify duration and marks. You can add questions after creating the event.</p>
                    </div>

                    <div className="card p-6 bg-gradient-to-br from-fuchsia-50 to-purple-50 border-purple-100">
                        <div className="bg-purple-600 p-3 rounded-2xl w-fit mb-4 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-purple-900 mb-2">Contest Setup</h3>
                        <p className="text-purple-800/70 text-sm font-medium">For Coding contests, select problems from the repository. Hidden test cases will verify participant solutions.</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl overflow-hidden relative">
                        <h3 className="text-lg font-black text-gray-800 mb-4 relative z-10">Best Practices</h3>
                        <ul className="space-y-4 relative z-10">
                            {['Set clear titles', 'Check time zones', 'Balanced difficulty', 'Verify problems'].map((item, i) => (
                                <li key={i} className="flex items-center space-x-3 text-sm font-bold text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
