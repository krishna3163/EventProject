import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';

const CodeArena = () => {
    const { id } = useParams(); // contestId
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [activeProblem, setActiveProblem] = useState(null);
    const [code, setCode] = useState('// Write your code here...');
    const [language, setLanguage] = useState('java');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        fetchContestData();
    }, [id]);

    const fetchContestData = async () => {
        try {
            const contestRes = await apiService.contest.getById(id);
            setContest(contestRes.data);

            // Fetch actual problem details for IDs in contest.problemIds
            const problemPromises = contestRes.data.problemIds.map(pId => apiService.problem.getById(pId));
            const problemRes = await Promise.all(problemPromises);
            const fetchedProblems = problemRes.map(r => r.data);
            setProblems(fetchedProblems);

            if (fetchedProblems.length > 0) {
                setActiveProblem(fetchedProblems[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to load contest:', err);
            toast.error('Contest not found or inaccessible');
            navigate('/');
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setResults(null);
        try {
            const submission = {
                contestId: id,
                problemId: activeProblem.id,
                userId: JSON.parse(localStorage.getItem('user'))?.id,
                sourceCode: code,
                language: language,
            };
            const res = await apiService.submission.submit(submission);
            setResults(res.data);

            if (res.data.status === 'ACCEPTED') {
                toast.success('Accepted! All test cases passed.');
            } else {
                toast.warning(`${res.data.status}: ${res.data.executionResult?.output || 'Execution failed'}`);
            }
        } catch (err) {
            console.error('Submission error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-mono selection:bg-purple-500/30">
            {/* Contest Header */}
            <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center space-x-6">
                    <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-2 rounded-lg shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-black tracking-tight">{contest?.title}</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-gray-800 border-none rounded-lg text-xs font-bold px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="java">Java 17</option>
                        <option value="python3">Python 3</option>
                        <option value="cpp">C++ 17</option>
                        <option value="nodejs">Node.js</option>
                    </select>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                    >
                        {submitting ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Submit Code'}
                    </button>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Sidebar - Problems */}
                <div className="w-16 border-r border-gray-800 flex flex-col items-center py-6 space-y-4 shrink-0 bg-gray-900/50">
                    {problems.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProblem(p)}
                            className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${activeProblem?.id === p.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:bg-gray-800'
                                }`}
                            title={p.title}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                {/* Content Split */}
                <div className="flex-grow flex">
                    {/* Problem Description */}
                    <div className="w-1/3 border-r border-gray-800 p-8 overflow-y-auto bg-gray-900">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeProblem?.difficulty === 'EASY' ? 'text-emerald-400' :
                                        activeProblem?.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                                    }`}>{activeProblem?.difficulty}</span>
                                <h2 className="text-2xl font-black">{activeProblem?.title}</h2>
                            </div>

                            <div className="prose prose-invert prose-sm max-w-none text-gray-400 font-medium leading-relaxed">
                                {activeProblem?.description}
                            </div>

                            <div className="space-y-6 pt-6 border-t border-gray-800">
                                {activeProblem?.constraints && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-50">Constraints</p>
                                        <pre className="bg-gray-800/50 p-4 rounded-xl text-xs text-gray-300 whitespace-pre-wrap">{activeProblem.constraints}</pre>
                                    </div>
                                )}
                                {activeProblem?.inputFormat && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-50">Input Format</p>
                                        <p className="text-xs text-gray-400">{activeProblem.inputFormat}</p>
                                    </div>
                                )}
                                {activeProblem?.outputFormat && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-50">Output Format</p>
                                        <p className="text-xs text-gray-400">{activeProblem.outputFormat}</p>
                                    </div>
                                )}
                            </div>

                            {/* Sample Test Case */}
                            {activeProblem?.testCases && activeProblem.testCases.filter(t => !t.isHidden).map((tc, j) => (
                                <div key={j} className="space-y-6 pt-8">
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-purple-400 uppercase">Sample Input {j + 1}</p>
                                        <pre className="bg-black p-4 rounded-xl text-xs text-blue-300 font-mono">{tc.input}</pre>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-purple-400 uppercase">Sample Output {j + 1}</p>
                                        <pre className="bg-black p-4 rounded-xl text-xs text-emerald-300 font-mono">{tc.expectedOutput}</pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor & Console */}
                    <div className="flex-grow flex flex-col bg-gray-950">
                        <div className="flex-grow relative">
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={language}
                                value={code}
                                onChange={setCode}
                                options={{
                                    fontSize: 14,
                                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    padding: { top: 20 },
                                    cursorSmoothCaretAnimation: 'on',
                                    smoothScrolling: true,
                                }}
                            />
                        </div>

                        {/* Console / Output */}
                        <div className="h-64 border-t border-gray-800 bg-gray-900 flex flex-col shrink-0">
                            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-800/20">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Execution Result</span>
                                {results && (
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${results.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        }`}>{results.status}</span>
                                )}
                            </div>
                            <div className="flex-grow p-6 font-mono text-sm overflow-y-auto">
                                {results ? (
                                    <div className="space-y-4">
                                        <div className="text-gray-400">Time: <span className="text-white font-bold">{results.executionResult?.cpuTime || '0.0'}s</span> | Memory: <span className="text-white font-bold">{results.executionResult?.memory || '0'}KB</span></div>
                                        <div className="p-4 bg-black rounded-xl border border-gray-800">
                                            <p className="text-gray-500 text-[10px] uppercase font-black mb-2 tracking-widest">Output</p>
                                            <pre className="text-blue-300 whitespace-pre-wrap">{results.executionResult?.output || 'No output produced'}</pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-600 italic">
                                        No recent execution. Run or submit code to see results.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeArena;
