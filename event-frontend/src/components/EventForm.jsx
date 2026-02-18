import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

const EventForm = ({ initialData, onSubmit, isLoading, category: initialCategory }) => {
    const [category, setCategory] = useState(initialCategory || 'mcq');
    const [problems, setProblems] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        type: 'MCQ',
        startTime: '',
        endTime: '',
        durationInMinutes: 60,
        totalMarks: 100,
        status: 'UPCOMING',
        problemIds: [],
        ...initialData,
    });

    useEffect(() => {
        if (category === 'coding') {
            fetchProblems();
        }
    }, [category]);

    const fetchProblems = async () => {
        try {
            const response = await apiService.problem.getAll();
            setProblems(response.data || []);
        } catch (error) {
            console.error('Error fetching problems:', error);
            // TEMPORARY: Mock problems for Guest Mode
            setProblems([
                { id: 'p1', title: 'Binary Search Implementation', difficulty: 'EASY' },
                { id: 'p2', title: 'Reverse Linked List', difficulty: 'MEDIUM' },
                { id: 'p3', title: 'Dijkstra Algorithm', difficulty: 'HARD' }
            ]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleProblemToggle = (id) => {
        setFormData((prev) => ({
            ...prev,
            problemIds: prev.problemIds.includes(id)
                ? prev.problemIds.filter((pId) => pId !== id)
                : [...prev.problemIds, id],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            toast.error('Start time must be before end time');
            return;
        }

        if (category === 'coding' && formData.problemIds.length === 0) {
            toast.error('Please select at least one problem for the contest');
            return;
        }

        // Convert to ISO if necessary (backend expects Instant)
        const submissionData = {
            ...formData,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
        };

        onSubmit(submissionData, category);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            {/* Category Toggle */}
            {!initialData && (
                <div className="bg-bg-tertiary p-1.5 rounded-2xl flex space-x-1 border border-card-border">
                    <button
                        type="button"
                        onClick={() => { setCategory('mcq'); setFormData(p => ({ ...p, type: 'MCQ' })); }}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${category === 'mcq' ? 'bg-bg-secondary text-accent-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        MCQ Quiz
                    </button>
                    <button
                        type="button"
                        onClick={() => { setCategory('coding'); setFormData(p => ({ ...p, type: 'CODING' })); }}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${category === 'coding' ? 'bg-bg-secondary text-accent-secondary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Coding Contest
                    </button>
                </div>
            )}

            {/* Basic Info */}
            <div className="card space-y-6">
                <h3 className="text-xl font-black text-text-primary border-l-4 border-accent-primary pl-4">Basic Information</h3>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary ml-1">Event Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="input-field"
                        placeholder="e.g. Advanced Java Mock Test"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">Start Date & Time</label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            required
                            className="input-field"
                            value={formData.startTime ? formData.startTime.substring(0, 16) : ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary ml-1">End Date & Time</label>
                        <input
                            type="datetime-local"
                            name="endTime"
                            required
                            className="input-field"
                            value={formData.endTime ? formData.endTime.substring(0, 16) : ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {category === 'mcq' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary ml-1">Duration (Minutes)</label>
                            <input
                                type="number"
                                name="durationInMinutes"
                                required
                                className="input-field"
                                value={formData.durationInMinutes}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary ml-1">Total Marks</label>
                            <input
                                type="number"
                                name="totalMarks"
                                required
                                className="input-field"
                                value={formData.totalMarks}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Problem Selection for Contests */}
            {category === 'coding' && (
                <div className="card space-y-6 min-h-[300px]">
                    <h3 className="text-xl font-black text-text-primary border-l-4 border-accent-secondary pl-4">Manage Problems</h3>
                    <p className="text-text-secondary text-sm font-medium -mt-4">Select the problems for this contest</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {problems.length > 0 ? problems.map(prob => (
                            <div
                                key={prob.id}
                                onClick={() => handleProblemToggle(prob.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${formData.problemIds.includes(prob.id)
                                    ? 'border-accent-secondary bg-accent-secondary/5 ring-2 ring-accent-secondary/20'
                                    : 'border-card-border bg-bg-tertiary/30 hover:border-accent-secondary/50'
                                    }`}
                            >
                                <div>
                                    <p className="font-bold text-text-primary">{prob.title}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${prob.difficulty === 'EASY' ? 'text-status-success' :
                                        prob.difficulty === 'MEDIUM' ? 'text-status-warning' : 'text-status-error'
                                        }`}>{prob.difficulty}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.problemIds.includes(prob.id) ? 'bg-accent-secondary border-accent-secondary' : 'border-text-secondary'
                                    }`}>
                                    {formData.problemIds.includes(prob.id) && (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center py-12 text-text-secondary font-medium italic">
                                No problems available. Please create potential problems first!
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl text-xl font-black text-white shadow-lg transform transition-all active:scale-[0.98] btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{
                    background: category === 'mcq'
                        ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                        : 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))'
                }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Event...
                    </span>
                ) : (initialData ? 'Update Event' : `Create ${category === 'mcq' ? 'Quiz' : 'Contest'}`)}
            </button>
        </form>
    );
};

export default EventForm;
