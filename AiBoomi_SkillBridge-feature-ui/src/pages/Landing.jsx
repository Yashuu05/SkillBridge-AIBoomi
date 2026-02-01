import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-4xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4"></div>
          <h1 className="text-5xl font-bold text-white">SkillBridge</h1>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          AI-powered guidance for 
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            esports & sports athletes
          </span>
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Advanced skill assessment, personalized coach matching, and AI-driven training guidance to maximize your potential.
        </p>
        
        <button
          onClick={handleGetStarted}
          className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-semibold rounded-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
        >
          Start Skill Assessment
        </button>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Skill Assessment", desc: "AI analysis of performance metrics" },
            { title: "Coach Matching", desc: "Find perfect coach for your goals" },
            { title: "Training Plans", desc: "Personalized AI-driven guidance" },
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;