import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
                {/* Outer spinning ring */}
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                {/* Inner pulsing circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
