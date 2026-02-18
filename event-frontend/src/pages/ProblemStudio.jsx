import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ProblemStudio = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProblem, setEditingProblem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'EASY',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        testCases: []
    });

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const response = await apiService.problem.getAll();
            setProblems(response.data || []);
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (prob) => {
        setEditingProblem(prob);
        setFormData({
            title: prob.title,
            description: prob.description,
            difficulty: prob.difficulty,
            inputFormat: prob.inputFormat || '',
            outputFormat: prob.outputFormat || '',
            constraints: prob.constraints || '',
            testCases: prob.testCases || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this problem permanently?')) {
            try {
                await apiService.problem.delete(id);
                toast.success('Problem deleted successfully');
                fetchProblems();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProblem) {
                await apiService.problem.update(editingProblem.id, formData);
                toast.success('Problem updated successfully');
            } else {
                await apiService.problem.create(formData);
                toast.success('New problem created!');
            }
            setShowForm(false);
            setEditingProblem(null);
            fetchProblems();
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const handleImportValues = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedData = JSON.parse(event.target.result);

                // Check if it's a bulk array or single item
                if (Array.isArray(importedData)) {
                    if (!window.confirm(`Found ${importedData.length} items. Import all?`)) return;

                    let successCount = 0;
                    let failCount = 0;

                    for (const item of importedData) {
                        try {
                            if (item.type === 'MCQ' || item.questionText) {
                                // Recommend ensure eventId is present
                                if (!item.eventId) throw new Error("MCQ requires eventId");
                                await apiService.quiz.addQuestion(item.eventId, item);
                            } else {
                                // Default to Coding Problem
                                await apiService.problem.create(item);
                            }
                            successCount++;
                        } catch (err) {
                            console.error("Item failed:", item, err);
                            failCount++;
                        }
                    }
                    toast.info(`Imported: ${successCount}, Failed: ${failCount}`);
                    fetchProblems(); // Refresh coding list
                } else {
                    // Single item fill form (Legacy behavior)
                    setFormData({
                        title: importedData.title || '',
                        description: importedData.description || '',
                        difficulty: importedData.difficulty || 'EASY',
                        inputFormat: importedData.inputFormat || '',
                        outputFormat: importedData.outputFormat || '',
                        constraints: importedData.constraints || '',
                        testCases: importedData.testCases || []
                    });
                    toast.success('Form filled from JSON');
                }
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const addTestCase = () => {
        setFormData({
            ...formData,
            testCases: [...formData.testCases, { input: '', expectedOutput: '', isHidden: false }]
        });
    };

    const updateTestCase = (idx, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[idx][field] = value;
        setFormData({ ...formData, testCases: newTestCases });
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">Problem Studio</h1>
                    <p className="text-gray-500 font-medium text-lg">Engineer high-quality coding challenges</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setShowForm(true); setEditingProblem(null); setFormData({
                                title: '', description: '', difficulty: 'EASY', inputFormat: '', outputFormat: '', constraints: '', testCases: []
                            });
                        }}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Create Problem</span>
                    </button>
                )}
            </div>

            {showForm ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Meta Card */}
                        <div className="card p-8 space-y-8 glass-effect border-purple-100 shadow-2xl">
                            <h3 className="text-2xl font-black theme-text-primary border-l-4 border-purple-500 pl-4 tracking-tight">Main Specifications</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black theme-text-secondary uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field text-xl font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Find Longest Palindromic Substring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        required
                                        rows={8}
                                        className="input-field resize-none leading-relaxed"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the problem, input/output requirements, and edge cases..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <label className="cursor-pointer text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-2 theme-bg-tertiary px-4 py-2 rounded-lg border border-purple-100 transition-all hover:shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    <span>Import from JSON</span>
                                    <input type="file" accept=".json" className="hidden" onChange={handleImportValues} />
                                </label>
                            </div>
                        </div>

                        {/* Constraints & Formats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="card p-6 space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Input Format</label>
                                <textarea className="input-field h-32 resize-none text-sm" value={formData.inputFormat} onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })} />
                            </div>
                            <div className="card p-6 space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Output Format</label>
                                <textarea className="input-field h-32 resize-none text-sm" value={formData.outputFormat} onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })} />
                            </div>
                        </div>

                        {/* Test Cases */}
                        <div className="card p-8 space-y-6 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black theme-text-primary">Test Cases</h3>
                                <button type="button" onClick={addTestCase} className="text-purple-600 font-black text-sm flex items-center space-x-1 hover:underline">
                                    <span>+ Add Case</span>
                                </button>
                            </div>
                            <div className="space-y-6">
                                {formData.testCases.map((tc, idx) => (
                                    <div key={idx} className="p-6 rounded-3xl theme-bg-tertiary border border-gray-100 space-y-4 relative group">
                                        <div className="absolute top-4 right-4 flex items-center space-x-4">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)} className="w-4 h-4 text-purple-600" />
                                                <span className="text-[10px] font-black uppercase theme-text-secondary">Hidden</span>
                                            </label>
                                            <button type="button" onClick={() => setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== idx) })} className="theme-text-secondary hover:text-red-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase theme-text-secondary">Input</span>
                                                <textarea className="w-full theme-bg-secondary border border-gray-100 rounded-xl p-3 font-mono text-xs theme-text-primary h-24 resize-none outline-none focus:border-purple-300 transition-all" value={tc.input} onChange={(e) => updateTestCase(idx, 'input', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase theme-text-secondary">Expected Output</span>
                                                <textarea className="w-full theme-bg-secondary border border-gray-100 rounded-xl p-3 font-mono text-xs theme-text-primary h-24 resize-none outline-none focus:border-purple-300 transition-all" value={tc.expectedOutput} onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Control Center */}
                        <div className="card p-8 space-y-6 sticky top-28 shadow-3xl">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Difficulty Level</label>
                                <select
                                    className="input-field font-black"
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                >
                                    <option value="EASY">EASY</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HARD">HARD</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Constraints</label>
                                <textarea className="input-field h-40 resize-none text-sm" value={formData.constraints} onChange={(e) => setFormData({ ...formData, constraints: e.target.value })} placeholder="e.g. 1 <= N <= 10^5" />
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <button type="submit" className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black text-xl hover:bg-purple-700 transition-all shadow-xl active:scale-95">
                                    {editingProblem ? 'Save Changes' : 'Publish Problem'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="w-full py-4 theme-bg-tertiary theme-text-secondary rounded-[2rem] font-bold text-sm hover:theme-bg-secondary">
                                    Discard Draft
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {problems.map(prob => (
                        <div key={prob.id} className="card p-8 group hover:shadow-2xl transition-all border-gray-100 flex flex-col transform hover:-translate-y-2">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${prob.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                    prob.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                        'bg-red-50 text-red-500 border-red-100'
                                    }`}>
                                    {prob.difficulty}
                                </span>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(prob)} className="p-2.5 theme-text-secondary theme-bg-tertiary hover:text-purple-600 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDelete(prob.id)} className="p-2.5 theme-text-secondary theme-bg-tertiary hover:text-red-500 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black theme-text-primary mb-4 line-clamp-2">{prob.title}</h3>
                            <p className="theme-text-secondary text-sm font-medium line-clamp-3 mb-8 leading-relaxed flex-grow">{prob.description}</p>
                            <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full theme-bg-tertiary flex items-center justify-center text-purple-600 font-black text-xs">{(prob.testCases || []).length}</div>
                                    <span className="text-[10px] font-black theme-text-secondary uppercase tracking-widest">Test Cases</span>
                                </div>
                                <button onClick={() => handleEdit(prob)} className="text-purple-600 font-black text-xs tracking-widest uppercase hover:underline">Configure →</button>
                            </div>
                        </div>
                    ))}

                    {problems.length === 0 && (
                        <div className="col-span-full py-24 text-center theme-bg-secondary rounded-[3rem] border-2 border-dashed border-gray-200">
                            <p className="theme-text-secondary font-black text-xl mb-4">The Repository is Empty</p>
                            <button onClick={() => setShowForm(true)} className="btn-primary">Initialize Problem Set</button>
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default ProblemStudio;
