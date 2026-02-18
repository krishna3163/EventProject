import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Scroll-triggered fade-in hook ─── */
const useReveal = (threshold = 0.15) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, visible];
};

/* ─── Animated counter ─── */
const Counter = ({ end, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [ref, visible] = useReveal();
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [visible, end, duration]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Floating particles background ─── */
const ParticlesBg = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{
                left: `${15 + i * 14}%`,
                top: `${10 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.7}s`,
                width: `${60 + i * 20}px`,
                height: `${60 + i * 20}px`,
            }} />
        ))}
    </div>
);

/* ─── Feature icons (inline SVG) ─── */
const icons = {
    code: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    quiz: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    trophy: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 3h14l-1.5 6H6.5L5 3zm2 6v3a5 5 0 0010 0V9M12 17v4m-4 0h8" />
        </svg>
    ),
    shield: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
};

/* ════════════════════════════════════════════
   MAIN LANDING PAGE
   ════════════════════════════════════════════ */
const LandingPage = () => {
    const [heroRef, heroVis] = useReveal(0.05);
    const [featRef, featVis] = useReveal();
    const [howRef, howVis] = useReveal();
    const [dashRef, dashVis] = useReveal();
    const [testRef, testVis] = useReveal();
    const [ctaRef, ctaVis] = useReveal();

    return (
        <div className="landing-page">
            {/* ─────────────────────── HERO ─────────────────────── */}
            <section ref={heroRef} className="hero-section">
                <ParticlesBg />
                <div className="hero-gradient-orb hero-orb-1" />
                <div className="hero-gradient-orb hero-orb-2" />
                <div className="hero-gradient-orb hero-orb-3" />

                <div className={`hero-content ${heroVis ? 'animate-hero' : 'opacity-0'}`}>
                    <div className="hero-text">
                        <div className="hero-badge">
                            <span className="hero-badge-dot" />
                            <span>Now with Real-Time Leaderboards</span>
                        </div>

                        <h1 className="hero-title">
                            Build, Compete &<br />
                            <span className="hero-title-gradient">Win in Real-Time</span>
                        </h1>

                        <p className="hero-subtitle">
                            The all-in-one platform for coding contests, quizzes, and events.
                            Create, manage, and participate with a premium experience.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/signup" className="btn-hero-primary">
                                Start Competing
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link to="/login" className="btn-hero-secondary">
                                Explore Events
                            </Link>
                        </div>

                        {/* Stats row */}
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-number"><Counter end={5000} suffix="+" /></span>
                                <span className="hero-stat-label">Participants</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-number"><Counter end={200} suffix="+" /></span>
                                <span className="hero-stat-label">Events Hosted</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-number"><Counter end={50} suffix="+" /></span>
                                <span className="hero-stat-label">Organizations</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero mockup */}
                    <div className="hero-mockup">
                        <div className="mockup-window">
                            <div className="mockup-header">
                                <div className="mockup-dots">
                                    <span className="dot dot-red" />
                                    <span className="dot dot-yellow" />
                                    <span className="dot dot-green" />
                                </div>
                                <div className="mockup-title">EventProject Dashboard</div>
                                <div style={{ width: 48 }} />
                            </div>
                            <div className="mockup-body">
                                <div className="mockup-sidebar">
                                    {['Dashboard', 'Events', 'Contests', 'Leaderboard', 'Profile'].map((item, i) => (
                                        <div key={item} className={`mockup-sidebar-item ${i === 0 ? 'active' : ''}`}>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <div className="mockup-content">
                                    <div className="mockup-stat-row">
                                        {[
                                            { label: 'Active Events', value: '12', color: '#818cf8' },
                                            { label: 'My Rank', value: '#3', color: '#f472b6' },
                                            { label: 'Score', value: '2,450', color: '#34d399' },
                                        ].map((s) => (
                                            <div key={s.label} className="mockup-stat-card">
                                                <div className="mockup-stat-value" style={{ color: s.color }}>{s.value}</div>
                                                <div className="mockup-stat-label">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mockup-chart">
                                        <div className="mockup-chart-title">Performance Overview</div>
                                        <div className="mockup-chart-bars">
                                            {[65, 80, 45, 90, 70, 85, 60].map((h, i) => (
                                                <div key={i} className="mockup-bar-wrapper">
                                                    <div className="mockup-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────── FEATURES ─────────────────────── */}
            <section ref={featRef} className={`features-section section-padding ${featVis ? 'animate-section' : 'opacity-0'}`}>
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Features</span>
                        <h2 className="section-title">Everything You Need to<br /><span className="text-gradient">Host & Compete</span></h2>
                        <p className="section-subtitle">
                            From real-time coding battles to quiz management — all built with a modern, premium experience.
                        </p>
                    </div>

                    <div className="features-grid">
                        {[
                            { icon: icons.code, title: 'Real-Time Coding Contests', desc: 'Compete in live coding challenges with real-time code execution, custom test cases, and instant feedback.' },
                            { icon: icons.quiz, title: 'Quiz & Event Management', desc: 'Create and manage MCQ events with timed sessions, auto-grading, PIN protection, and attendance tracking.' },
                            { icon: icons.trophy, title: 'Leaderboards & Rankings', desc: 'Dynamic live leaderboards powered by WebSockets. Track your rank, scores, and performance over time.' },
                            { icon: icons.shield, title: 'Secure Authentication', desc: 'Firebase-powered auth with Google SSO, phone login, role-based access control, and organization management.' },
                        ].map((feat, i) => (
                            <div key={feat.title} className="feature-card" style={{ animationDelay: `${i * 0.12}s` }}>
                                <div className="feature-icon">{feat.icon}</div>
                                <h3 className="feature-title">{feat.title}</h3>
                                <p className="feature-desc">{feat.desc}</p>
                                <div className="feature-glow" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
            <section ref={howRef} className={`how-section section-padding ${howVis ? 'animate-section' : 'opacity-0'}`}>
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">How It Works</span>
                        <h2 className="section-title">Get Started in<br /><span className="text-gradient">Three Simple Steps</span></h2>
                    </div>

                    <div className="steps-row">
                        {[
                            { num: '01', title: 'Create an Account', desc: 'Sign up as a student or organization. Set up your profile in under a minute.', icon: '🚀' },
                            { num: '02', title: 'Join an Event', desc: 'Browse upcoming coding contests and quizzes. Register with one click.', icon: '🎯' },
                            { num: '03', title: 'Compete & Rank Up', desc: 'Solve problems, submit answers, and climb the leaderboard in real-time.', icon: '🏆' },
                        ].map((step, i) => (
                            <div key={step.num} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="step-number">{step.num}</div>
                                <div className="step-icon">{step.icon}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-desc">{step.desc}</p>
                                {i < 2 && <div className="step-connector" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────────── DASHBOARD PREVIEW ─────────────────────── */}
            <section ref={dashRef} className={`preview-section section-padding ${dashVis ? 'animate-section' : 'opacity-0'}`}>
                <div className="section-container preview-layout">
                    <div className="preview-text">
                        <span className="section-tag">Live Dashboard</span>
                        <h2 className="section-title" style={{ textAlign: 'left' }}>
                            A Dashboard That<br /><span className="text-gradient">Feels Like Magic</span>
                        </h2>
                        <p className="section-subtitle" style={{ textAlign: 'left', maxWidth: '100%' }}>
                            Monitor events, track participation, view analytics, and manage your organization — all from one beautiful interface.
                        </p>
                        <ul className="preview-features">
                            {['Real-time event monitoring', 'Participant analytics & charts', 'PDF report generation', 'Role-based dashboards'].map((f) => (
                                <li key={f} className="preview-feature-item">
                                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="preview-mockup">
                        <div className="preview-glass-card">
                            <div className="preview-mini-card">
                                <div className="pmc-header">
                                    <div className="pmc-dot" style={{ background: '#818cf8' }} />
                                    <span>Problem List</span>
                                </div>
                                {['Two Sum', 'Binary Search', 'Graph Traversal'].map((p, i) => (
                                    <div key={p} className="pmc-row">
                                        <span className="pmc-num">{i + 1}.</span>
                                        <span>{p}</span>
                                        <span className={`pmc-status ${i === 0 ? 'solved' : i === 1 ? 'attempted' : ''}`}>
                                            {i === 0 ? '✓' : i === 1 ? '…' : '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="preview-mini-card">
                                <div className="pmc-header">
                                    <div className="pmc-dot" style={{ background: '#f472b6' }} />
                                    <span>Timer</span>
                                </div>
                                <div className="pmc-timer">01:24:35</div>
                                <div className="pmc-timer-bar">
                                    <div className="pmc-timer-fill" />
                                </div>
                            </div>
                            <div className="preview-mini-card preview-mini-card-wide">
                                <div className="pmc-header">
                                    <div className="pmc-dot" style={{ background: '#34d399' }} />
                                    <span>Leaderboard</span>
                                </div>
                                {['Aarav S.', 'Priya M.', 'You'].map((n, i) => (
                                    <div key={n} className={`pmc-lb-row ${i === 2 ? 'you' : ''}`}>
                                        <span className="pmc-rank">#{i + 1}</span>
                                        <span className="pmc-name">{n}</span>
                                        <span className="pmc-score">{[980, 945, 920][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
            <section ref={testRef} className={`testimonials-section section-padding ${testVis ? 'animate-section' : 'opacity-0'}`}>
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Testimonials</span>
                        <h2 className="section-title">Loved by <span className="text-gradient">Students & Organizers</span></h2>
                    </div>

                    <div className="testimonials-grid">
                        {[
                            { name: 'Aarav Sharma', role: 'CS Student', text: 'EventProject made competitive coding so much more accessible. The real-time leaderboard keeps me motivated to push harder!', avatar: 'A' },
                            { name: 'Priya Mehta', role: 'Event Organizer', text: 'Managing quizzes for 500+ students used to be a nightmare. Now I create events in minutes with auto-grading. Absolute game changer.', avatar: 'P' },
                            { name: 'Rahul Verma', role: 'College Admin', text: 'The organization dashboard gives us complete control. Analytics, certificates, participant tracking — everything in one place.', avatar: 'R' },
                        ].map((t, i) => (
                            <div key={t.name} className="testimonial-card" style={{ animationDelay: `${i * 0.12}s` }}>
                                <div className="testimonial-stars">{'★'.repeat(5)}</div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.avatar}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────────── CTA ─────────────────────── */}
            <section ref={ctaRef} className={`cta-section ${ctaVis ? 'animate-section' : 'opacity-0'}`}>
                <div className="cta-bg" />
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Host or Join<br />Your Next Coding Event?</h2>
                    <p className="cta-subtitle">Join thousands of students and organizations on EventProject.</p>
                    <div className="cta-buttons">
                        <Link to="/signup" className="btn-hero-primary">
                            Get Started — It's Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link to="/login" className="btn-hero-secondary">Learn More</Link>
                    </div>
                </div>
            </section>

            {/* ─────────────────────── FOOTER ─────────────────────── */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="footer-logo-text">EventProject</span>
                        </div>
                        <p className="footer-desc">The modern platform for coding contests, quizzes, and campus events.</p>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Product</h4>
                        <Link to="/signup" className="footer-link">Features</Link>
                        <Link to="/login" className="footer-link">Events</Link>
                        <Link to="/signup" className="footer-link">Pricing</Link>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Account</h4>
                        <Link to="/login" className="footer-link">Login</Link>
                        <Link to="/signup" className="footer-link">Register</Link>
                        <Link to="/forgot-password" className="footer-link">Forgot Password</Link>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="footer-heading">Connect</h4>
                        <a href="https://github.com/krishna3163/EventProject" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
                        <a href="#" className="footer-link">Twitter</a>
                        <a href="#" className="footer-link">Discord</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} EventProject. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
