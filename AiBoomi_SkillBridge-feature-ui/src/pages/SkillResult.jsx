import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SkillResult = () => {
  const navigate = useNavigate();
  const [skillScores] = useState({
    "Aim/Accuracy": 78,
    "Strategy/Tactics": 65,
    "Reaction Time": 82,
    "Team Coordination": 71,
    "Mental Game": 59
  });

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Your Skill Analysis</h2>
          <p className="text-gray-400">AI-powered assessment of your current skill levels</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Skill Breakdown</h3>
          
          <div className="space-y-6">
            {Object.entries(skillScores).map(([skill, score]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{skill}</span>
                  <span className="text-white font-semibold">{score}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      score >= 80 ? 'bg-green-500' :
                      score >= 60 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h4 className="font-bold text-white mb-2">AI Recommendation:</h4>
            <p className="text-blue-300">
              Focus on improving Mental Game and Strategy/Tactics. Your physical skills are strong, but strategic thinking needs development.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/assessment')}
            className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800"
          >
            Retake Assessment
          </button>
          
          <button
            onClick={() => navigate('/coach-recommendation')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg"
          >
            Find Recommended Coaches →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillResult;