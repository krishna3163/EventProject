import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

const CodeArena = () => {
    const { id } = useParams(); // contestId
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [activeProblem, setActiveProblem] = useState(null);
    const [code, setCode] = useState('// Write your code here...');
    const [language, setLanguage] = useState('java');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);

    const isLight = theme === 'light';
    const monacoTheme = isLight ? 'light' : 'vs-dark';

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

    const handleRun = async () => {
        setSubmitting(true);
        setResults(null);
        try {
            const submission = {
                contestId: id,
                problemId: activeProblem.id,
                userId: JSON.parse(localStorage.getItem('user'))?.id,
                code: code,
                language: language,
            };
            // Map 'nodejs' to 'nodejs' or handle in backend if needed. Backend accepts 'python', 'java', 'c', 'cpp'.
            // Frontend 'nodejs' might fail if backend doesn't support it.
            // But let's assume 'nodejs' is not supported by backend yet (switch case only has c/cpp/java/python).

            const res = await apiService.submission.run(submission);
            setResults({ type: 'RUN', ...res.data });

            if (res.data.status === 'PASSED') {
                toast.success('Sample Test Case Passed!');
            } else {
                toast.warning('Sample Test Case Failed');
            }
        } catch (err) {
            console.error('Run error:', err);
            toast.error(err.response?.data?.message || 'Execution failed');
        } finally {
            setSubmitting(false);
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
                code: code, // Changed from sourceCode to code
                language: language,
            };
            const res = await apiService.submission.submit(submission);
            // Backend returns 'verdict' in SubmissionResponse, but 'status' in RunCode map.
            // Normalize to 'status' for frontend consistency.
            const resultData = {
                ...res.data,
                status: res.data.verdict || res.data.status // Fallback
            };
            setResults({ type: 'SUBMIT', ...resultData });

            if (resultData.status === 'ACCEPTED') {
                toast.success('Accepted! All test cases passed.');
            } else {
                toast.warning(`${resultData.status}: Execution failed`);
            }
        } catch (err) {
            console.error('Submission error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-mono selection:bg-accent-primary/30 transition-colors duration-300">
            {/* Contest Header */}
            <header className="h-16 border-b border-card-border bg-bg-secondary flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
                <div className="flex items-center space-x-6">
                    <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-2 rounded-lg shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-text-primary">{contest?.title}</h1>
                        {contest?.endTime && (
                            <div className="text-xs font-mono font-bold text-text-secondary flex items-center gap-2">
                                <span>Time Remaining:</span>
                                <ContestTimer endTime={contest.endTime} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-bg-tertiary border border-card-border rounded-lg text-xs font-bold px-4 py-2 outline-none focus:ring-2 focus:ring-accent-primary text-text-primary transition-colors duration-300"
                    >
                        <option value="java">Java 17</option>
                        <option value="python">Python 3</option>
                        <option value="c">C</option>
                        <option value="cpp">C++ 17</option>
                    </select>
                    <button
                        onClick={handleRun}
                        disabled={submitting}
                        className="px-6 py-2 bg-bg-tertiary hover:bg-card-bg border border-card-border rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2 text-text-primary"
                    >
                        {submitting ? '...' : 'Run Code'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 btn-primary rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                    >
                        {submitting ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Submit'}
                    </button>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Sidebar - Problems */}
                <div className="w-16 border-r border-card-border flex flex-col items-center py-6 space-y-4 shrink-0 bg-bg-secondary/50 backdrop-blur-sm transition-colors duration-300">
                    {problems.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProblem(p)}
                            className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${activeProblem?.id === p.id
                                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
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
                    <div className="w-1/3 border-r border-card-border p-8 overflow-y-auto bg-bg-primary transition-colors duration-300">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeProblem?.difficulty === 'EASY' ? 'text-green-500' :
                                    activeProblem?.difficulty === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'
                                    }`}>{activeProblem?.difficulty}</span>
                                <h2 className="text-2xl font-black text-text-primary">{activeProblem?.title}</h2>
                            </div>

                            <div className="prose prose-sm max-w-none text-text-secondary font-medium leading-relaxed">
                                {activeProblem?.description}
                            </div>

                            <div className="space-y-6 pt-6 border-t border-card-border">
                                {activeProblem?.constraints && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-70">Constraints</p>
                                        <pre className="bg-bg-tertiary p-4 rounded-xl text-xs text-text-secondary whitespace-pre-wrap border border-card-border">{activeProblem.constraints}</pre>
                                    </div>
                                )}
                                {activeProblem?.inputFormat && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-70">Input Format</p>
                                        <p className="text-xs text-text-secondary">{activeProblem.inputFormat}</p>
                                    </div>
                                )}
                                {activeProblem?.outputFormat && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-70">Output Format</p>
                                        <p className="text-xs text-text-secondary">{activeProblem.outputFormat}</p>
                                    </div>
                                )}
                            </div>

                            {/* Sample Test Case */}
                            {activeProblem?.testCases && activeProblem.testCases.filter(t => !t.isHidden).map((tc, j) => (
                                <div key={j} className="space-y-6 pt-8">
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-accent-primary uppercase">Sample Input {j + 1}</p>
                                        <pre className="bg-bg-tertiary border border-card-border p-4 rounded-xl text-xs text-text-primary font-mono">{tc.input}</pre>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-accent-primary uppercase">Sample Output {j + 1}</p>
                                        <pre className="bg-bg-tertiary border border-card-border p-4 rounded-xl text-xs text-text-primary font-mono">{tc.expectedOutput}</pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor & Console */}
                    <div className="flex-grow flex flex-col bg-bg-primary transition-colors duration-300">
                        <div className="flex-grow relative">
                            <Editor
                                height="100%"
                                theme={monacoTheme}
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
                        <div className="h-64 border-t border-card-border bg-bg-secondary flex flex-col shrink-0 transition-colors duration-300">
                            <div className="flex items-center justify-between px-6 py-3 border-b border-card-border bg-bg-tertiary bg-opacity-20">
                                <span className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Execution Result</span>
                                {results && (
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${results.status === 'ACCEPTED' || results.status === 'PASSED'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-red-500/20 text-red-500'
                                        }`}>{results.status}</span>
                                )}
                            </div>
                            <div className="flex-grow p-6 font-mono text-sm overflow-y-auto text-text-secondary">
                                {results ? (
                                    <div className="space-y-4">
                                        <div className="text-text-tertiary">
                                            Time: <span className="text-text-primary font-bold">{results.cpuTime || '0.0'}s</span> |
                                            Memory: <span className="text-text-primary font-bold">{results.memory || '0'}KB</span>
                                        </div>

                                        {results.type === 'RUN' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-bg-tertiary rounded-xl border border-card-border">
                                                    <p className="text-text-tertiary text-[10px] uppercase font-black mb-2 tracking-widest">Your Output</p>
                                                    <pre className="text-text-primary whitespace-pre-wrap">{results.output || 'No output'}</pre>
                                                </div>
                                                <div className="p-4 bg-bg-tertiary rounded-xl border border-card-border">
                                                    <p className="text-text-tertiary text-[10px] uppercase font-black mb-2 tracking-widest">Expected Output</p>
                                                    <pre className="text-text-primary whitespace-pre-wrap">{results.expectedOutput || '-'}</pre>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-bg-tertiary rounded-xl border border-card-border">
                                                <p className="text-text-tertiary text-[10px] uppercase font-black mb-2 tracking-widest">Verdict</p>
                                                <pre className={`whitespace-pre-wrap ${results.status === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}`}>{results.status}</pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-text-tertiary italic">
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

const ContestTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                setIsUrgent(false);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            setIsUrgent(diff < 300000); // Red if < 5 mins
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <span className={`tracking-wider ${isUrgent ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
            {timeLeft}
        </span>
    );
};

export default CodeArena;
