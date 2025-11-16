
import React from 'react';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <ImageGenerator />
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
