// src/components/SkillTracker.jsx
import React, { useState } from 'react';
import { updateSkillsAssessment } from '../services/athleteProfileService';

const SkillTracker = ({ userId, athleteType, initialSkills }) => {
  const [skills, setSkills] = useState(initialSkills || {});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Esports skills
  const esportsSkills = [
    { id: 'mechanicalSkill', label: 'Mechanical Skill', description: 'Aim, movement, execution' },
    { id: 'gameSense', label: 'Game Sense', description: 'Map awareness, predictions' },
    { id: 'positioning', label: 'Positioning', description: 'Optimal positioning in game' },
    { id: 'communication', label: 'Communication', description: 'Team communication clarity' },
    { id: 'decisionMaking', label: 'Decision Making', description: 'In-game decision speed & quality' },
    { id: 'adaptability', label: 'Adaptability', description: 'Adjusting to meta/changes' },
    { id: 'clutchPerformance', label: 'Clutch Performance', description: 'Performance under pressure' },
    { id: 'leadership', label: 'Leadership', description: 'Team leadership & shot calling' }
  ];

  // Sports skills
  const sportsSkills = [
    { id: 'technique', label: 'Technique', description: 'Form and execution' },
    { id: 'tacticalAwareness', label: 'Tactical Awareness', description: 'Game strategy understanding' },
    { id: 'physicalFitness', label: 'Physical Fitness', description: 'Strength, speed, endurance' },
    { id: 'mentalToughness', label: 'Mental Toughness', description: 'Focus and resilience' },
    { id: 'teamwork', label: 'Teamwork', description: 'Coordination with team' },
    { id: 'consistency', label: 'Consistency', description: 'Performance consistency' },
    { id: 'injuryPrevention', label: 'Injury Prevention', description: 'Injury awareness & prevention' },
    { id: 'recoveryAbility', label: 'Recovery Ability', description: 'Post-exercise recovery' }
  ];

  const commonSkills = [
    { id: 'discipline', label: 'Discipline', description: 'Training discipline' },
    { id: 'focus', label: 'Focus', description: 'Concentration ability' },
    { id: 'stressManagement', label: 'Stress Management', description: 'Handling pressure' },
    { id: 'learningAbility', label: 'Learning Ability', description: 'Learning new skills' }
  ];

  const currentSkills = athleteType === 'esports' ? esportsSkills : sportsSkills;

  const handleSkillChange = (category, skillId, field, value) => {
    setSkills(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skillId]: {
          ...prev[category]?.[skillId],
          [field]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    setMessage('');
    
    try {
      await updateSkillsAssessment(userId, skills);
      setMessage('Skills assessment saved! AI analysis will begin shortly.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving skills assessment');
    } finally {
      setSaving(false);
    }
  };

  const SkillSlider = ({ category, skill }) => {
    const skillData = skills[category]?.[skill.id] || { level: 0, confidence: 0 };
    
    return (
      <div className="p-4 bg-gray-800/30 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="text-white font-medium">{skill.label}</h4>
            <p className="text-gray-400 text-xs">{skill.description}</p>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">{skillData.level}/10</div>
            <div className="text-gray-400 text-xs">Confidence: {skillData.confidence}/10</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Skill Level</span>
              <span>{skillData.level}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={skillData.level}
              onChange={(e) => handleSkillChange(category, skill.id, 'level', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Confidence</span>
              <span>{skillData.confidence}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={skillData.confidence}
              onChange={(e) => handleSkillChange(category, skill.id, 'confidence', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 bg-green-900/30 border border-green-700 text-green-300 rounded-lg">
          {message}
        </div>
      )}

      {/* Primary Skills */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">
          {athleteType === 'esports' ? '🎮 Esports Skills' : '⚽ Sports Skills'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSkills.map(skill => (
            <SkillSlider 
              key={skill.id}
              category={athleteType === 'esports' ? 'esportsSkills' : 'sportsSkills'}
              skill={skill}
            />
          ))}
        </div>
      </div>

      {/* Common Skills */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">🌟 Common Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonSkills.map(skill => (
            <SkillSlider 
              key={skill.id}
              category="commonSkills"
              skill={skill}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
            saving
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
          }`}
        >
          {saving ? 'Saving...' : 'Save Skills Assessment'}
        </button>
      </div>
    </div>
  );
};

export default SkillTracker;