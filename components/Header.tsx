
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                <path d="M14.5 9.5a1 1 0 0 1-1-1.5 1 1 0 0 1 2 0 1 1 0 0 1-1 1.5z"></path>
                <path d="m8.5 13.5 2 2 4-4"></path>
            </svg>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Image Generator</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
