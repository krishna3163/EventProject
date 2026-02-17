import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import EventForm from '../components/EventForm';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Extract category from URL params
    const category = new URLSearchParams(location.search).get('category') || 'mcq';

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            let response;
            if (category === 'mcq') {
                response = await apiService.quiz.getById(id);
            } else {
                response = await apiService.contest.getById(id);
            }
            setEvent(response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);

            // TEMPORARY: Fallback for demo
            const localQuizzes = JSON.parse(localStorage.getItem('demo_quizzes') || '[]');
            const localContests = JSON.parse(localStorage.getItem('demo_contests') || '[]');
            const allItems = [...localQuizzes, ...localContests];
            const existing = allItems.find(item => item.id === id);

            setEvent(existing || {
                id: id,
                title: category === 'mcq' ? 'Demo MCQ Quiz' : 'Demo Contest',
                startTime: new Date().toISOString(),
                durationInMinutes: 30,
                totalMarks: 100
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data) => {
        setSubmitting(true);
        try {
            if (category === 'mcq') {
                // Backend update endpoint: PUT /api/events/updateEvent/{id}
                // Note: api.js might need this mapped correctly
                await apiService.quiz.update(id, data);
                toast.success('MCQ Quiz updated successfully!');
            } else {
                await apiService.contest.update(id, data);
                toast.success('Coding Contest updated successfully!');
            }
            navigate(`/event/${id}?category=${category}`);
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-12 text-center">
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Refine Challenge
                </h1>
                <p className="text-gray-500 text-xl font-medium">Update the parameters for "{event?.title}"</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <EventForm
                        initialData={event}
                        onSubmit={handleUpdate}
                        isLoading={submitting}
                        category={category}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl overflow-hidden relative">
                        <h3 className="text-lg font-black text-gray-800 mb-4 tracking-tight">Configuration Audit</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold">Category</span>
                                <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${category === 'mcq' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                    }`}>{category}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold">ID</span>
                                <span className="font-mono text-[10px] text-gray-400">#{id.substring(0, 8)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
                                Last modified: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 rounded-bl-[100px]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEvent;
