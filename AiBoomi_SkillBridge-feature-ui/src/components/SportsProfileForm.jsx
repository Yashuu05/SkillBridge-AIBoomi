// src/components/SportsProfileForm.jsx - UPDATED WITH NULL CHECKS
import React, { useState } from 'react';

const SportsProfileForm = ({ userId, initialData = {}, onSave }) => {
  // Add safe default values with null checks
  const safeInitialData = initialData || {};
  
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: safeInitialData.basicInfo?.fullName || '',
      dateOfBirth: safeInitialData.basicInfo?.dateOfBirth || '',
      nationality: safeInitialData.basicInfo?.nationality || '',
      height: safeInitialData.basicInfo?.height || '',
      weight: safeInitialData.basicInfo?.weight || '',
      position: safeInitialData.basicInfo?.position || ''
    },
    sportsDetails: {
      primarySport: safeInitialData.sportsDetails?.primarySport || '',
      secondarySports: safeInitialData.sportsDetails?.secondarySports || [],
      yearsPlaying: safeInitialData.sportsDetails?.yearsPlaying || '',
      currentTeam: safeInitialData.sportsDetails?.currentTeam || '',
      coachName: safeInitialData.sportsDetails?.coachName || '',
      trainingHoursPerWeek: safeInitialData.sportsDetails?.trainingHoursPerWeek || ''
    },
    physicalMetrics: {
      staminaLevel: safeInitialData.physicalMetrics?.staminaLevel || 5,
      speed100m: safeInitialData.physicalMetrics?.speed100m || '',
      verticalJump: safeInitialData.physicalMetrics?.verticalJump || '',
      benchPress: safeInitialData.physicalMetrics?.benchPress || '',
      flexibilityScore: safeInitialData.physicalMetrics?.flexibilityScore || 5,
      injuryHistory: safeInitialData.physicalMetrics?.injuryHistory || ''
    },
    performanceGoals: {
      shortTermGoal: safeInitialData.performanceGoals?.shortTermGoal || '',
      longTermGoal: safeInitialData.performanceGoals?.longTermGoal || '',
      targetCompetition: safeInitialData.performanceGoals?.targetCompetition || '',
      desiredImprovement: safeInitialData.performanceGoals?.desiredImprovement || ''
    }
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would call your save function
      if (onSave) onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const SPORTS_LIST = [
    'Football', 'Basketball', 'Cricket', 'Tennis', 'Badminton', 
    'Swimming', 'Athletics', 'Volleyball', 'Boxing', 'Martial Arts',
    'Gymnastics', 'Cycling', 'Golf', 'Hockey', 'Rugby'
  ];

  const POSITIONS = {
    'Football': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker'],
    'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    'Cricket': ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    'Tennis': ['Singles Player', 'Doubles Player'],
    'Swimming': ['Freestyle', 'Breaststroke', 'Butterfly', 'Backstroke'],
    'default': ['Player', 'Captain', 'Specialist']
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">👤</span> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.basicInfo.fullName}
              onChange={(e) => handleInputChange('basicInfo', 'fullName', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.basicInfo.dateOfBirth}
              onChange={(e) => handleInputChange('basicInfo', 'dateOfBirth', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
            <input
              type="number"
              value={formData.basicInfo.height}
              onChange={(e) => handleInputChange('basicInfo', 'height', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 180"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={formData.basicInfo.weight}
              onChange={(e) => handleInputChange('basicInfo', 'weight', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 75"
            />
          </div>
        </div>
      </div>

      {/* Sports Details */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">⚽</span> Sports Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Sport *</label>
            <select
              value={formData.sportsDetails.primarySport}
              onChange={(e) => handleInputChange('sportsDetails', 'primarySport', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your sport</option>
              {SPORTS_LIST.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <input
              type="text"
              value={formData.basicInfo.position}
              onChange={(e) => handleInputChange('basicInfo', 'position', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.sportsDetails.primarySport ? 
                `e.g., ${POSITIONS[formData.sportsDetails.primarySport]?.[0] || 'Player'}` : 
                'e.g., Midfielder, Forward'
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Years Playing</label>
            <select
              value={formData.sportsDetails.yearsPlaying}
              onChange={(e) => handleInputChange('sportsDetails', 'yearsPlaying', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select experience</option>
              <option value="0-1">Less than 1 year</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Training Hours/Week</label>
            <input
              type="number"
              value={formData.sportsDetails.trainingHoursPerWeek}
              onChange={(e) => handleInputChange('sportsDetails', 'trainingHoursPerWeek', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 15"
            />
          </div>
        </div>
      </div>

      {/* Physical Metrics */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">💪</span> Physical Metrics
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stamina Level: {formData.physicalMetrics.staminaLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.physicalMetrics.staminaLevel}
              onChange={(e) => handleInputChange('physicalMetrics', 'staminaLevel', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">100m Sprint Time (seconds)</label>
              <input
                type="number"
                step="0.1"
                value={formData.physicalMetrics.speed100m}
                onChange={(e) => handleInputChange('physicalMetrics', 'speed100m', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vertical Jump (cm)</label>
              <input
                type="number"
                value={formData.physicalMetrics.verticalJump}
                onChange={(e) => handleInputChange('physicalMetrics', 'verticalJump', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 60"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Injury History</label>
            <textarea
              value={formData.physicalMetrics.injuryHistory}
              onChange={(e) => handleInputChange('physicalMetrics', 'injuryHistory', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="List any past injuries, recovery time, and current limitations"
            />
          </div>
        </div>
      </div>

      {/* Performance Goals */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">🎯</span> Performance Goals
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Short-term Goal (Next 3 months)</label>
            <input
              type="text"
              value={formData.performanceGoals.shortTermGoal}
              onChange={(e) => handleInputChange('performanceGoals', 'shortTermGoal', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Improve sprint time by 0.5 seconds"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Long-term Goal (Next year)</label>
            <input
              type="text"
              value={formData.performanceGoals.longTermGoal}
              onChange={(e) => handleInputChange('performanceGoals', 'longTermGoal', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Qualify for national championships"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Competition</label>
            <input
              type="text"
              value={formData.performanceGoals.targetCompetition}
              onChange={(e) => handleInputChange('performanceGoals', 'targetCompetition', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., State Championships, College Tournament"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Sports Profile'
          )}
        </button>
      </div>
    </form>
  );
};

export default SportsProfileForm;