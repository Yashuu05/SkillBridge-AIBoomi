import React, { useState } from 'react';

const TrainingPlan = () => {
  const [weeks] = useState([
    {
      week: 1,
      focus: "Fundamentals & Aim Training",
      sessions: [
        "Daily aim training (30 mins)",
        "Crosshair placement drills",
        "Movement mechanics practice",
        "Basic positioning study"
      ]
    },
    {
      week: 2,
      focus: "Strategy Development",
      sessions: [
        "Map knowledge deep dive",
        "Team role understanding",
        "Economy management",
        "VOD review sessions"
      ]
    },
    {
      week: 3,
      focus: "Advanced Techniques",
      sessions: [
        "Advanced positioning",
        "Counter-stratting",
        "Mindset training",
        "Stress management"
      ]
    },
    {
      week: 4,
      focus: "Competitive Prep",
      sessions: [
        "Scrimmage matches",
        "Tournament preparation",
        "Performance review",
        "Goal setting for next phase"
      ]
    }
  ]);

  const [completedSessions, setCompletedSessions] = useState({});

  const toggleSession = (weekIndex, sessionIndex) => {
    const key = `${weekIndex}-${sessionIndex}`;
    setCompletedSessions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Your AI Training Plan</h2>
          <p className="text-gray-400">4-week personalized training program based on your assessment</p>
        </div>
        
        <div className="space-y-6">
          {weeks.map((week, weekIndex) => (
            <div key={week.week} className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Week {week.week}</h3>
                  <p className="text-gray-400">Focus: {week.focus}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {week.sessions.filter((_, i) => completedSessions[`${weekIndex}-${i}`]).length}/{week.sessions.length}
                  </div>
                  <div className="text-sm text-gray-400">Sessions</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {week.sessions.map((session, sessionIndex) => {
                  const key = `${weekIndex}-${sessionIndex}`;
                  const isCompleted = completedSessions[key];
                  
                  return (
                    <div 
                      key={sessionIndex}
                      onClick={() => toggleSession(weekIndex, sessionIndex)}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                        isCompleted 
                          ? 'bg-green-900/20 border-green-700' 
                          : 'bg-gray-900/30 border-gray-700 hover:bg-gray-800/50'
                      } border`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-500'
                      }`}>
                        {isCompleted && '✓'}
                      </div>
                      <span className={`${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {session}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Training Progress Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4</div>
              <div className="text-gray-400">Weeks Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">16</div>
              <div className="text-gray-400">Training Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Object.values(completedSessions).filter(Boolean).length}
              </div>
              <div className="text-gray-400">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPlan;