// src/components/EsportsProfileForm.jsx
// src/components/EsportsProfileForm.jsx - UPDATED WITH NULL CHECKS
import React, { useState } from 'react';

const EsportsProfileForm = ({ userId, initialData = {}, onSave }) => {
  // Add safe default values with null checks
  const safeInitialData = initialData || {};
  
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: safeInitialData.basicInfo?.fullName || '',
      dateOfBirth: safeInitialData.basicInfo?.dateOfBirth || '',
      nationality: safeInitialData.basicInfo?.nationality || '',
      gamingAlias: safeInitialData.basicInfo?.gamingAlias || '',
      streamingPlatforms: safeInitialData.basicInfo?.streamingPlatforms || []
    },
    esportsDetails: {
      primaryGame: safeInitialData.esportsDetails?.primaryGame || '',
      secondaryGames: safeInitialData.esportsDetails?.secondaryGames || [],
      inGameRole: safeInitialData.esportsDetails?.inGameRole || '',
      currentTeam: safeInitialData.esportsDetails?.currentTeam || '',
      yearsGaming: safeInitialData.esportsDetails?.yearsGaming || '',
      hoursPerWeek: safeInitialData.esportsDetails?.hoursPerWeek || ''
    },
    performanceMetrics: {
      currentRank: safeInitialData.performanceMetrics?.currentRank || '',
      peakRank: safeInitialData.performanceMetrics?.peakRank || '',
      winRate: safeInitialData.performanceMetrics?.winRate || '',
      averageKDA: safeInitialData.performanceMetrics?.averageKDA || '',
      headshotPercentage: safeInitialData.performanceMetrics?.headshotPercentage || '',
      reactionTime: safeInitialData.performanceMetrics?.reactionTime || ''
    },
    gamingSetup: {
      gamingPC: safeInitialData.gamingSetup?.gamingPC || '',
      mouse: safeInitialData.gamingSetup?.mouse || '',
      keyboard: safeInitialData.gamingSetup?.keyboard || '',
      monitor: safeInitialData.gamingSetup?.monitor || '',
      headset: safeInitialData.gamingSetup?.headset || '',
      dpiSettings: safeInitialData.gamingSetup?.dpiSettings || ''
    },
    careerGoals: {
      targetRank: safeInitialData.careerGoals?.targetRank || '',
      tournamentGoals: safeInitialData.careerGoals?.tournamentGoals || '',
      streamingGoals: safeInitialData.careerGoals?.streamingGoals || '',
      teamAspirations: safeInitialData.careerGoals?.teamAspirations || ''
    }
  });

  // ... rest of the component remains the same
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
      if (onSave) onSave(formData);
    } finally {
      setLoading(false);
    }
  };
  const GAMES_LIST = [
    'Valorant', 'CS:GO', 'League of Legends', 'Dota 2', 'Fortnite',
    'Apex Legends', 'Overwatch 2', 'Rocket League', 'PUBG', 'Call of Duty',
    'Rainbow Six Siege', 'Minecraft', 'FIFA', 'NBA 2K', 'Street Fighter',
    'Super Smash Bros', 'Starcraft II', 'Heartlistone', 'Teamfight Tactics'
  ];

  const GAME_ROLES = {
    'Valorant': ['Duelist', 'Controller', 'Initiator', 'Sentinel'],
    'CS:GO': ['Entry Fragger', 'Support', 'AWPer', 'IGL', 'Lurker'],
    'League of Legends': ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
    'Dota 2': ['Carry', 'Mid', 'Offlane', 'Soft Support', 'Hard Support'],
    'Overwatch 2': ['Tank', 'Damage', 'Support'],
    'default': ['Flex', 'Captain', 'Shot Caller', 'Support']
  };

  const RANK_TIERS = [
    'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum',
    'Diamond', 'Ascendant', 'Immortal', 'Radiant',
    'Unranked'
  ];

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
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gaming Alias/Username *</label>
            <input
              type="text"
              value={formData.basicInfo.gamingAlias}
              onChange={(e) => handleInputChange('basicInfo', 'gamingAlias', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              placeholder="Your in-game name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.basicInfo.dateOfBirth}
              onChange={(e) => handleInputChange('basicInfo', 'dateOfBirth', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
            <input
              type="text"
              value={formData.basicInfo.nationality}
              onChange={(e) => handleInputChange('basicInfo', 'nationality', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Indian, American"
            />
          </div>
        </div>
      </div>

      {/* Esports Details */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">🎮</span> Esports Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Game *</label>
            <select
              value={formData.esportsDetails.primaryGame}
              onChange={(e) => handleInputChange('esportsDetails', 'primaryGame', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select your main game</option>
              {GAMES_LIST.map(game => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">In-Game Role</label>
            <input
              type="text"
              value={formData.esportsDetails.inGameRole}
              onChange={(e) => handleInputChange('esportsDetails', 'inGameRole', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={formData.esportsDetails.primaryGame ? 
                `e.g., ${GAME_ROLES[formData.esportsDetails.primaryGame]?.[0] || 'Flex'}` : 
                'e.g., Duelist, Support'
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Years Gaming</label>
            <select
              value={formData.esportsDetails.yearsGaming}
              onChange={(e) => handleInputChange('esportsDetails', 'yearsGaming', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Hours per Week</label>
            <input
              type="number"
              value={formData.esportsDetails.hoursPerWeek}
              onChange={(e) => handleInputChange('esportsDetails', 'hoursPerWeek', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 25"
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">📊</span> Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Rank</label>
            <select
              value={formData.performanceMetrics.currentRank}
              onChange={(e) => handleInputChange('performanceMetrics', 'currentRank', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select rank</option>
              {RANK_TIERS.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Peak Rank</label>
            <select
              value={formData.performanceMetrics.peakRank}
              onChange={(e) => handleInputChange('performanceMetrics', 'peakRank', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select highest rank</option>
              {RANK_TIERS.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Win Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.performanceMetrics.winRate}
              onChange={(e) => handleInputChange('performanceMetrics', 'winRate', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 55"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Average K/D Ratio</label>
            <input
              type="text"
              value={formData.performanceMetrics.averageKDA}
              onChange={(e) => handleInputChange('performanceMetrics', 'averageKDA', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 1.5"
            />
          </div>
        </div>
      </div>

      {/* Gaming Setup */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">🖥️</span> Gaming Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gaming PC Specs</label>
            <input
              type="text"
              value={formData.gamingSetup.gamingPC}
              onChange={(e) => handleInputChange('gamingSetup', 'gamingPC', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., RTX 3080, Ryzen 7, 32GB RAM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mouse</label>
            <input
              type="text"
              value={formData.gamingSetup.mouse}
              onChange={(e) => handleInputChange('gamingSetup', 'mouse', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Logitech G Pro Wireless"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Keyboard</label>
            <input
              type="text"
              value={formData.gamingSetup.keyboard}
              onChange={(e) => handleInputChange('gamingSetup', 'keyboard', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Razer Huntsman"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Monitor</label>
            <input
              type="text"
              value={formData.gamingSetup.monitor}
              onChange={(e) => handleInputChange('gamingSetup', 'monitor', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 240Hz, 27 inch"
            />
          </div>
        </div>
      </div>

      {/* Career Goals */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <span className="mr-2">🎯</span> Career Goals
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Rank</label>
            <input
              type="text"
              value={formData.careerGoals.targetRank}
              onChange={(e) => handleInputChange('careerGoals', 'targetRank', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Reach Radiant/Immortal"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tournament Goals</label>
            <textarea
              value={formData.careerGoals.tournamentGoals}
              onChange={(e) => handleInputChange('careerGoals', 'tournamentGoals', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Which tournaments do you want to compete in? Any specific achievements?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Team Aspirations</label>
            <textarea
              value={formData.careerGoals.teamAspirations}
              onChange={(e) => handleInputChange('careerGoals', 'teamAspirations', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              placeholder="Do you want to join a professional team? Start your own team? Streaming goals?"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            'Save Esports Profile'
          )}
        </button>
      </div>
    </form>
  );
};

export default EsportsProfileForm;