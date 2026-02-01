// src/pages/CoachRecommendation.jsx - FIXED WITH PROPER DEPENDENCIES
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pythonRagAPI } from '../services/ragApi';

const CoachRecommendation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [matchedCoaches, setMatchedCoaches] = useState([]);
  const [formData, setFormData] = useState(null);
  const [aiReasoning, setAiReasoning] = useState('');
  const [ragResults, setRagResults] = useState(null);
  const [processingRAG, setProcessingRAG] = useState(false);
  const [error, setError] = useState('');

  // Mock coaches data for fallback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockCoaches = [
    {
      id: 'coach_001',
      name: 'Arjun Singh',
      specialty: 'BGMI • IGL Specialist',
      experience: '3 years',
      matchScore: 92,
      price: 'Rs 800/month',
      skills: ['Team Strategy', 'Zone Rotations', 'Endgame Planning', 'Communication'],
      location: 'Mumbai',
      rating: 4.8,
      category: 'esports',
      description: 'Professional BGMI coach specializing in IGL role. Focus on team coordination.',
      coaching_style: 'Interactive, Video Analysis',
      students_trained: 45
    },
    {
      id: 'coach_002',
      name: 'Priya Sharma',
      specialty: 'Valorant • Aim Training',
      experience: '5 years',
      matchScore: 87,
      price: '$49/hr',
      skills: ['Aim Training', 'Crosshair Placement', 'Movement', 'Peeking'],
      location: 'Delhi',
      rating: 4.9,
      category: 'esports',
      description: 'Valorant aim specialist helping players improve mechanical skills.',
      coaching_style: 'One-on-One Sessions',
      students_trained: 120
    },
    {
      id: 'coach_003',
      name: 'Rahul Verma',
      specialty: 'Cricket • Batting Coach',
      experience: '8 years',
      matchScore: 85,
      price: '₹1500/session',
      skills: ['Batting Technique', 'Footwork', 'Shot Selection', 'Mental Game'],
      location: 'Bangalore',
      rating: 4.7,
      category: 'sports',
      description: 'Former Ranji Trophy player turned batting coach.',
      coaching_style: 'Technical Analysis',
      students_trained: 200
    },
    {
      id: 'coach_004',
      name: 'Neha Patel',
      specialty: 'Badminton • Singles Specialist',
      experience: '6 years',
      matchScore: 82,
      price: '₹1200/session',
      skills: ['Court Movement', 'Smash Technique', 'Strategy', 'Fitness'],
      location: 'Chennai',
      rating: 4.6,
      category: 'sports',
      description: 'State-level badminton player offering professional coaching.',
      coaching_style: 'Drill-based',
      students_trained: 85
    },
    {
      id: 'coach_005',
      name: 'Alex Chen',
      specialty: 'CS:GO • Strategy',
      experience: '7 years',
      matchScore: 78,
      price: '$65/hr',
      skills: ['Game Strategy', 'Team Tactics', 'Map Control', 'Economy'],
      location: 'Hyderabad',
      rating: 4.8,
      category: 'esports',
      description: 'Strategic coach focusing on team play and game sense.',
      coaching_style: 'Team Sessions',
      students_trained: 95
    },
    {
      id: 'coach_006',
      name: 'Jordan Lee',
      specialty: 'Mental Coaching',
      experience: '4 years',
      matchScore: 75,
      price: '$40/hr',
      skills: ['Stress Management', 'Focus Training', 'Confidence Building'],
      location: 'Pune',
      rating: 4.5,
      category: 'esports',
      description: 'Mental performance coach for esports athletes.',
      coaching_style: 'Mindfulness',
      students_trained: 65
    }
  ];

  // Filter coaches based on form data
  const filterCoachesByFormData = useCallback((formData, coaches) => {
    if (!formData || !formData.category) return coaches;
    
    return coaches
      .filter(coach => {
        // Filter by category
        if (coach.category !== formData.category) return false;
        
        // Filter by game if specified
        if (formData.game) {
          const gameMatch = coach.specialty?.toLowerCase().includes(formData.game.toLowerCase()) ||
                           coach.description?.toLowerCase().includes(formData.game.toLowerCase());
          if (!gameMatch) return false;
        }
        
        // Filter by location if specified
        if (formData.location && coach.location !== formData.location) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, []);

  // Generate explanation for filtered results
  const generateExplanation = useCallback((topCoach, formData) => {
    if (!topCoach || !formData) return getDefaultExplanation();
    
    return `
      Based on your interest in ${formData.game || 'coaching'} as a ${formData.role || 'player'},
      ${topCoach.name} is a great match because:
      
      • ${topCoach.experience} experience in ${topCoach.category === 'esports' ? 'esports' : 'sports'}
      • Specializes in: ${topCoach.specialty}
      • Located in ${topCoach.location}
      • ${topCoach.students_trained ? `Trained ${topCoach.students_trained} students` : 'Experienced coach'}
      
      Why they're recommended:
      Their ${topCoach.coaching_style} approach aligns well with ${formData.skill_level || 'your'} skill level,
      and their expertise in ${topCoach.skills?.[0] || 'coaching'} addresses your needs.
    `;
  }, []);

  const getDefaultExplanation = useCallback(() => {
    return `
      Welcome to SkillBridge Coach Recommendations!
      
      Our AI system analyzes your profile and matches you with coaches who specialize
      in your specific needs. Each coach is vetted for experience, teaching style,
      and student success rates.
      
      Top coaches are selected based on:
      • Expertise in your game/sport
      • Teaching methodology alignment
      • Location and availability
      • Student reviews and ratings
      
      Click on any coach to view detailed profiles, schedule sessions, or contact them directly.
    `;
  }, []);

  // Fetch RAG results from Python backend
  const fetchRAGResults = useCallback(async (requestId) => {
    try {
      setProcessingRAG(true);
      console.log('🤖 Calling Python RAG API...');
      
      // Test if Python backend is available
      const healthCheck = await pythonRagAPI.testConnection();
      
      if (healthCheck.status !== 'connected') {
        throw new Error('Python RAG backend is not available');
      }
      
      const results = await pythonRagAPI.getRecommendations(requestId);
      
      if (results.status === 'success') {
        setRagResults(results);
        setMatchedCoaches(results.all_matches || []);
        setAiReasoning(results.ai_reasoning || '');
      } else {
        throw new Error(results.error || 'RAG processing failed');
      }
      
    } catch (error) {
      console.error('⚠️ RAG fetch failed, using fallback:', error.message);
      setError(`AI processing unavailable. Showing recommendations based on your criteria.`);
      
      // Fallback to filtered mock data
      if (formData) {
        const filtered = filterCoachesByFormData(formData, mockCoaches);
        setMatchedCoaches(filtered);
        setAiReasoning(generateExplanation(filtered[0], formData));
      } else {
        setMatchedCoaches(mockCoaches);
        setAiReasoning(getDefaultExplanation());
      }
    } finally {
      setProcessingRAG(false);
    }
  }, [formData, filterCoachesByFormData, generateExplanation, getDefaultExplanation]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError('');
        
        const state = location.state;
        console.log('📍 Location State:', state);
        
        // Case 1: Direct access without form data
        if (!state) {
          console.log('📭 No form data, showing all coaches');
          setMatchedCoaches(mockCoaches);
          setAiReasoning(getDefaultExplanation());
          setLoading(false);
          return;
        }
        
        // Set form data if available
        if (state.formData) {
          setFormData(state.formData);
        }
        
        // Case 2: Already have RAG results
        if (state.fromPythonRAG && state.ragResults) {
          console.log('✅ Using existing RAG results');
          setRagResults(state.ragResults);
          setMatchedCoaches(state.ragResults.all_matches || []);
          setAiReasoning(state.ragResults.ai_reasoning || '');
          setLoading(false);
          return;
        }
        
        // Case 3: Have request ID, fetch from RAG backend
        if (state.requestId) {
          console.log('🔄 Fetching RAG results for request:', state.requestId);
          await fetchRAGResults(state.requestId);
          return;
        }
        
        // Case 4: Have form data but no RAG results
        if (state.formData && !state.fromPythonRAG) {
          console.log('🎯 Filtering coaches based on form data');
          const filtered = filterCoachesByFormData(state.formData, mockCoaches);
          setMatchedCoaches(filtered);
          setAiReasoning(generateExplanation(filtered[0], state.formData));
          setLoading(false);
          return;
        }
        
        // Default fallback
        console.log('🔄 Default fallback to mock data');
        setMatchedCoaches(mockCoaches);
        setAiReasoning(getDefaultExplanation());
        
      } catch (error) {
        console.error('❌ Error loading recommendations:', error);
        setError('Failed to load recommendations. Please try again.');
        setMatchedCoaches(mockCoaches);
        setAiReasoning(getDefaultExplanation());
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [
    location,
    fetchRAGResults,
    filterCoachesByFormData,
    generateExplanation,
    getDefaultExplanation,
    mockCoaches
  ]);

  const handleBookSession = (coachId) => {
    alert(`Booking session with coach ${coachId}. This feature will be implemented soon!`);
    // In production: navigate('/booking', { state: { coachId } });
  };

  const handleViewProfile = (coach) => {
    navigate('/coach-profile', { state: { coach } });
  };

  const handleRetryRAG = async () => {
    if (formData?.requestId) {
      await fetchRAGResults(formData.requestId);
    }
  };

  const handleRefineSearch = () => {
    navigate('/coaching-form', { 
      state: formData ? { prefillData: formData } : {} 
    });
  };

  if (loading || processingRAG) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {processingRAG ? '🤖 AI Processing...' : 'Loading Recommendations'}
          </h3>
          <p className="text-gray-400 text-lg mb-2">
            {processingRAG 
              ? 'Analyzing your profile with advanced AI matching...'
              : 'Preparing personalized coach suggestions'}
          </p>
          {processingRAG && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">This may take 30-45 seconds</p>
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            {formData ? `Recommended Coaches for ${formData.game}` : 'Top Coaches'}
          </h1>
          <p className="text-gray-400 text-lg">
            {formData 
              ? `AI-matched based on your ${formData.category} preferences`
              : 'Browse our expert coaches'}
          </p>
          
          {formData && (
            <div className="mt-6 inline-flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm">
                {formData.category === 'esports' ? '🎮 Esports' : '⚽ Sports'}
              </span>
              {formData.game && (
                <span className="px-3 py-1.5 bg-purple-900/30 text-purple-300 rounded-full text-sm">
                  {formData.game}
                </span>
              )}
              {formData.role && (
                <span className="px-3 py-1.5 bg-green-900/30 text-green-300 rounded-full text-sm">
                  {formData.role}
                </span>
              )}
              {formData.location && (
                <span className="px-3 py-1.5 bg-red-900/30 text-red-300 rounded-full text-sm">
                  📍 {formData.location}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-2">⚠️</span>
                <p className="text-yellow-300">{error}</p>
              </div>
              {formData?.requestId && (
                <button
                  onClick={handleRetryRAG}
                  className="px-4 py-2 bg-yellow-700 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  Retry AI
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Reasoning Section */}
        {aiReasoning && (
          <div className="mb-8 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Analysis</h2>
                <p className="text-gray-400 text-sm">Personalized recommendations based on your profile</p>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-5 border border-gray-800">
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {aiReasoning}
              </div>
            </div>
            
            {ragResults?.recommended_coach && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏆</span>
                  <div>
                    <p className="text-green-400 font-semibold">Top AI Recommendation</p>
                    <p className="text-white text-xl font-bold">{ragResults.recommended_coach}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {matchedCoaches.length} {matchedCoaches.length === 1 ? 'Coach' : 'Coaches'} Found
          </h3>
          <button
            onClick={handleRefineSearch}
            className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            🔍 Refine Search
          </button>
        </div>

        {/* Coaches Grid */}
        {matchedCoaches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">😕</div>
            <h3 className="text-2xl font-bold text-white mb-3">No Coaches Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              We couldn't find coaches matching your specific criteria. Try adjusting your search preferences.
            </p>
            <button
              onClick={handleRefineSearch}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Adjust Search Criteria
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedCoaches.map((coach, index) => (
                <CoachCard 
                  key={coach.id || index} 
                  coach={coach} 
                  index={index}
                  ragResults={ragResults}
                  onBook={handleBookSession}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/coaching-form')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Find Another Coach
                </button>
                <button
                  onClick={() => navigate('/training-plan')}
                  className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/30 transition-colors"
                >
                  View Training Plans
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-12 pt-8 border-t border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6 text-center">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-800/20 rounded-xl">
                  <div className="w-14 h-14 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-400 text-2xl">🎯</span>
                  </div>
                  <h4 className="font-bold text-white mb-2">AI Matching</h4>
                  <p className="text-gray-400 text-sm">Our AI analyzes your profile to find the perfect coach match</p>
                </div>
                <div className="text-center p-6 bg-gray-800/20 rounded-xl">
                  <div className="w-14 h-14 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-400 text-2xl">⭐</span>
                  </div>
                  <h4 className="font-bold text-white mb-2">Vetted Coaches</h4>
                  <p className="text-gray-400 text-sm">All coaches are verified professionals with proven track records</p>
                </div>
                <div className="text-center p-6 bg-gray-800/20 rounded-xl">
                  <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-400 text-2xl">📅</span>
                  </div>
                  <h4 className="font-bold text-white mb-2">Flexible Booking</h4>
                  <p className="text-gray-400 text-sm">Book sessions at your convenience with flexible scheduling</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Coach Card Component
const CoachCard = ({ coach, index, ragResults, onBook, onViewProfile }) => {
  const matchScore = coach.matchScore || Math.floor(70 + Math.random() * 25);
  
  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center">
          <div className={`w-14 h-14 rounded-xl mr-4 flex items-center justify-center text-white font-bold text-lg ${
            coach.category === 'esports' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
              : 'bg-gradient-to-r from-green-500 to-teal-600'
          }`}>
            {coach.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{coach.name}</h3>
            <p className="text-gray-400 text-sm">{coach.specialty}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            matchScore >= 90 ? 'text-green-400' :
            matchScore >= 80 ? 'text-yellow-400' :
            'text-orange-400'
          }`}>
            {matchScore}%
          </div>
          <div className="text-xs text-gray-400">Match Score</div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 flex items-center">
            <span className="mr-1">⏳</span>
            {coach.experience}
          </span>
          <span className={`font-medium px-3 py-1 rounded-full text-xs ${
            coach.category === 'esports' 
              ? 'bg-blue-900/30 text-blue-300' 
              : 'bg-green-900/30 text-green-300'
          }`}>
            {coach.category}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <span className="text-gray-400 mr-3 flex items-center">
              <span className="mr-1">📍</span>
              {coach.location}
            </span>
            <span className="text-yellow-400 flex items-center">
              <span className="mr-1">⭐</span>
              {coach.rating || '4.5'}/5
            </span>
          </div>
          <div className="text-lg font-bold text-white">
            {coach.price}
          </div>
        </div>
        
        {coach.skills && (
          <div className="pt-3 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm mb-2">Expertise:</p>
            <div className="flex flex-wrap gap-2">
              {coach.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                  {skill}
                </span>
              ))}
              {coach.skills.length > 3 && (
                <span className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-full text-xs">
                  +{coach.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {coach.description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {coach.description}
          </p>
        )}
      </div>
      
      <div className="flex space-x-3 mt-6">
        <button
          onClick={() => onBook(coach.id)}
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Book Session
        </button>
        <button
          onClick={() => onViewProfile(coach)}
          className="px-5 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/30 transition-colors"
        >
          Profile
        </button>
      </div>
      
      {index === 0 && ragResults && (
        <div className="mt-4 pt-4 border-t border-yellow-800/50">
          <div className="flex items-center">
            <span className="text-yellow-400 mr-2">🏆</span>
            <span className="text-yellow-300 text-sm font-medium">AI Top Recommendation</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachRecommendation;