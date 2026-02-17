import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Certificates = () => {
    const { eventId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type') || 'participation'; // 'participation' or 'rank'
    const rank = queryParams.get('rank') || '1';
    const eventTitle = queryParams.get('event') || 'Global Coding Challenge 2026';
    const score = queryParams.get('score') || '95';

    const handlePrint = () => {
        window.print();
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center print:p-0 print:bg-white">
            {/* Control Bar (Hidden on Print) */}
            <div className="max-w-4xl w-full mb-8 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-500 font-bold hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                </button>
                <button
                    onClick={handlePrint}
                    className="btn-primary flex items-center space-x-3 shadow-xl"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Download PDF Certificate</span>
                </button>
            </div>

            {/* Certificate Canvas */}
            <div id="certificate" className="relative w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden border-[20px] border-double border-blue-900 flex flex-col items-center justify-center p-20 text-center landscape print:shadow-none print:border-none">

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-900/5 rounded-br-full -translate-x-12 -translate-y-12"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-900/5 rounded-tl-full translate-x-12 translate-y-12"></div>

                {/* Elegant Border Pattern */}
                <div className="absolute inset-4 border-2 border-blue-200 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10 space-y-10 w-full max-w-4xl">
                    <div className="space-y-2">
                        <div className="flex justify-center mb-6">
                            <div className="bg-blue-900 p-4 rounded-2xl shadow-xl">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-black text-blue-900 uppercase tracking-[0.5em]">Event Hub Academy</h4>
                        <div className="h-1 w-32 bg-blue-900 mx-auto"></div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl font-serif font-bold text-gray-800 italic">Certificate of {type === 'rank' ? 'Excellence' : 'Participation'}</h1>
                        <p className="text-xl font-medium text-gray-500 uppercase tracking-widest">This prestigious award is presented to</p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-7xl font-serif font-black text-blue-900 py-4 border-b-2 border-gray-100 inline-block px-12 italic">
                            {user.firstName} {user.lastName}
                        </h2>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        {type === 'rank' ? (
                            <p className="text-2xl font-medium text-gray-600 leading-relaxed italic">
                                in recognition of outstanding performance, achieving <span className="text-blue-900 font-black">Rank #{rank}</span> with a remarkable score of <span className="text-blue-900 font-black">{score}%</span> in the <span className="font-black text-gray-800">"{eventTitle}"</span> held on this day.
                            </p>
                        ) : (
                            <p className="text-2xl font-medium text-gray-600 leading-relaxed italic">
                                for their active and dedicated participation in the <span className="font-black text-gray-800">"{eventTitle}"</span>. Their commitment to learning and excellence is truly commendable.
                            </p>
                        )}
                    </div>

                    <div className="pt-20 grid grid-cols-2 gap-40 w-full px-20">
                        <div className="flex flex-col items-center">
                            <div className="h-0.5 w-full bg-gray-300 mb-2"></div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Registrar Signature</p>
                        </div>
                        <div className="flex flex-col items-center relative">
                            {/* Seal */}
                            <div className="absolute -top-24 w-32 h-32 bg-blue-900 rounded-full border-4 border-double border-white shadow-2xl flex items-center justify-center rotate-12">
                                <div className="text-[10px] font-black text-white text-center uppercase tracking-tighter">
                                    Official<br />E-Seal<br />2026
                                </div>
                            </div>
                            <div className="h-0.5 w-full bg-gray-300 mb-2"></div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-white rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-900 overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-white rotate-45 -translate-x-1/2 translate-y-1/2"></div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    #certificate {
                        box-shadow: none !important;
                        border: 20px double #1e3a8a !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        margin: 0 !important;
                    }
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                }
            `}} />
        </div>
    );
};

export default Certificates;
