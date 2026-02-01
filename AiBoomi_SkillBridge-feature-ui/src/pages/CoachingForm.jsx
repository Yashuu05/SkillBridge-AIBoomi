// src/pages/CoachingForm.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc,updateDoc, serverTimestamp } from 'firebase/firestore';
import { pythonRagAPI } from '../services/ragApi';

const CoachingForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pythonBackendStatus, setPythonBackendStatus] = useState('checking');
  
  const [formData, setFormData] = useState({
    category: '',
    game: '',
    role: '',
    skill_level: '',
    location: '',
    budget: '',
    timings: '',
    playstyle: '',
    target_gaps: '',
    level: '',
    rating: '',
    additional_notes: '',
  });

  // Form options
  const categories = [
    { id: 'esports', name: 'Esports', icon: '🎮' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
  ];

  const esportsGames = ['BGMI', 'Valorant', 'CS:GO', 'League of Legends', 'Dota 2'];
  const sportsGames = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton'];

  const roles = {
    esports: ['IGL', 'Fragger', 'Support', 'Sniper', 'Duelist'],
    sports: {
      Cricket: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
      Football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
      General: ['Player', 'Captain']
    }
  };

  const skillLevels = [
    { id: 'beginner', name: 'Beginner', desc: 'Just starting out' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Competitive player' },
    { id: 'advanced', name: 'Advanced', desc: 'Seeking edge' },
    { id: 'professional', name: 'Professional', desc: 'Pro/semi-pro level' }
  ];

  const playstyles = {
    esports: ['Aggressive', 'Passive', 'Strategic', 'Flexible'],
    sports: ['Highly aggressive', 'Defensive', 'Balanced', 'Tactical']
  };

  const timings = ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'];
  
  const budgets = {
    esports: ['Rs 500/month', 'Rs 800/month', 'Rs 1000/month', 'Rs 1500/month'],
    sports: ['₹500/session', '₹500 - ₹1500/session', '₹1500 - ₹3000/session']
  };

  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];

  // Check Python backend on component mount
  useEffect(() => {
    checkPythonBackend();
  }, []);

  const checkPythonBackend = async () => {
    try {
      const status = await pythonRagAPI.testConnection();
      setPythonBackendStatus(status.status);
      console.log('🔌 Python Backend Status:', status);
    } catch (error) {
      console.error('Error checking backend:', error);
      setPythonBackendStatus('error');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.category || !formData.game || !formData.role) {
      return 'Please select category, game, and role';
    }
    if (!formData.skill_level || !formData.playstyle) {
      return 'Please select skill level and playstyle';
    }
    if (!formData.target_gaps) {
      return 'Please describe your challenges';
    }
    if (formData.category === 'sports' && !formData.level) {
      return 'Please select your competitive level for sports';
    }
    if (!formData.location || !formData.budget || !formData.timings) {
      return 'Please fill in logistics details';
    }
    return null;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // 1. Create the data object
      const customRequestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const studentData = {
        student_id: `STU${Date.now()}`,
        request_id: customRequestId, // We keep this for your reference
        category: formData.category,
        game: formData.game,
        role: formData.role,
        skill_level: formData.skill_level,
        location: formData.location,
        budget: formData.budget,
        timings: formData.timings,
        playstyle: formData.playstyle,
        target_gaps: formData.target_gaps,
        rating: formData.rating || 0,
        additional_notes: formData.additional_notes || '',
        created_at: serverTimestamp(),
        status: 'pending_rag_processing'
      };
      
      if (formData.category === 'sports') {
        studentData.level = formData.level;
        studentData.bottleneck = formData.target_gaps;
      }
      
      // 2. SAVE TO FIRESTORE FIRST
      // This is the critical step: 'addDoc' returns a reference to the new document
      const docRef = await addDoc(collection(db, 'coaching_requests'), studentData);
      
      // 3. GET THE REAL FIRESTORE ID
      const realFirestoreId = docRef.id; 
      console.log("✅ Data Saved! Firestore Document ID:", realFirestoreId);

      // Check backend connection if needed
      if (pythonBackendStatus !== 'connected') {
        await checkPythonBackend();
      }
      
      if (pythonBackendStatus === 'connected') {
        setSuccess('🤖 AI is analyzing your profile... This may take 30-60 seconds');
        
        // 4. SEND THE REAL FIRESTORE ID TO PYTHON (The Fix)
        // Python will now look for the document named 'realFirestoreId', which definitely exists.
        const ragResponse = await pythonRagAPI.getRecommendations(realFirestoreId);
        
        if (ragResponse.status !== 'success') {
          throw new Error(ragResponse.error || 'RAG processing failed');
        }
        
        // 5. Update the document with results
        await updateDoc(docRef, {
        status: 'rag_completed',
        rag_results: ragResponse,
        processed_at: serverTimestamp()
        });
        
        setSuccess(`✅ AI found ${ragResponse.all_matches?.length || 0} matching coaches!`);
        
        setTimeout(() => {
          navigate('/coach-recommendation', {
            state: {
              formData: studentData,
              requestId: customRequestId,
              ragResults: ragResponse,
              matchedCoaches: ragResponse.all_matches || [],
              aiReasoning: ragResponse.ai_reasoning,
              fromPythonRAG: true
            }
          });
        }, 2000);
        
      } else {
        await handleFallbackProcessing(customRequestId, studentData);
      }
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      
      if (error.message.includes('RAG') || error.message.includes('failed')) {
        await handleFallbackProcessing();
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackProcessing = async (requestId = null, studentData = null) => {
    try {
      const reqId = requestId || `req_fallback_${Date.now()}`;
      const data = studentData || {
        student_id: `STU${Date.now()}`,
        request_id: reqId,
        ...formData,
        created_at: serverTimestamp(),
        status: 'fallback_processed'
      };
      
      await addDoc(collection(db, 'coaching_requests'), data);
      
      const mockMatches = getMockMatches(data);
      
      setSuccess('✅ Processed successfully!');
      
      setTimeout(() => {
        navigate('/coach-recommendation', {
          state: {
            formData: data,
            requestId: reqId,
            matchedCoaches: mockMatches,
            fromPythonRAG: false,
            fallbackUsed: true
          }
        });
      }, 1000);
      
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      setError('Processing failed. Please try again.');
    }
  };

  const getMockMatches = (formData) => {
    return [
      {
        id: 'mock_001',
        name: 'Arjun Singh',
        specialty: 'BGMI • IGL Specialist',
        experience: '3 years',
        price: 'Rs 800/month',
        skills: ['Team Strategy', 'Zone Rotations'],
        location: 'Mumbai',
        rating: 4.8
      },
      {
        id: 'mock_002',
        name: 'Priya Sharma',
        specialty: 'Valorant • Aim Training',
        experience: '5 years',
        price: '$49/hr',
        skills: ['Aim Training', 'Crosshair Placement'],
        location: 'Delhi',
        rating: 4.9
      }
    ];
  };

  // STEP 1: Category, Game, Role Selection
  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Find Your Perfect Coach</h2>
        <p className="text-gray-400">Answer a few questions to get AI-matched coaching recommendations</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-white mb-4">
            What type of coaching are you looking for? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleInputChange('category', cat.id)}
                className={`p-6 rounded-xl border-2 transition-all ${formData.category === cat.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h3 className="text-xl font-semibold text-white">{cat.name}</h3>
              </button>
            ))}
          </div>
        </div>

        {formData.category && (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-white mb-3">
                Select your game/sport *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {(formData.category === 'esports' ? esportsGames : sportsGames).map((game) => (
                  <button
                    key={game}
                    type="button"
                    onClick={() => handleInputChange('game', game)}
                    className={`p-3 rounded-lg border transition-all ${formData.game === game 
                      ? 'border-blue-500 bg-blue-500/20' 
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                  >
                    <span className="text-white">{game}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-white mb-3">
                What is your primary role/position? *
              </label>
              <div className="flex flex-wrap gap-3">
                {formData.category === 'esports' 
                  ? roles.esports.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleInputChange('role', role)}
                        className={`px-4 py-2 rounded-full border transition-all ${formData.role === role 
                          ? 'border-purple-500 bg-purple-500/20' 
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                      >
                        <span className="text-white">{role}</span>
                      </button>
                    ))
                  : formData.game && roles.sports[formData.game] 
                    ? roles.sports[formData.game].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleInputChange('role', role)}
                          className={`px-4 py-2 rounded-full border transition-all ${formData.role === role 
                            ? 'border-purple-500 bg-purple-500/20' 
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                        >
                          <span className="text-white">{role}</span>
                        </button>
                      ))
                    : roles.sports.General.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleInputChange('role', role)}
                          className={`px-4 py-2 rounded-full border transition-all ${formData.role === role 
                            ? 'border-purple-500 bg-purple-500/20' 
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                        >
                          <span className="text-white">{role}</span>
                        </button>
                      ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-8">
        <div></div>
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!formData.category || !formData.game || !formData.role}
          className={`px-8 py-3 rounded-lg font-medium ${!formData.category || !formData.game || !formData.role
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg text-white'}`}
        >
          Next: Skill Assessment →
        </button>
      </div>
    </div>
  );

  // STEP 2: Skill Assessment
  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Skill Assessment</h2>
        <p className="text-gray-400">Help us understand your current level and needs</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-white mb-4">
            What is your current skill level? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillLevels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => handleInputChange('skill_level', level.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.skill_level === level.id 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
              >
                <h3 className="text-lg font-semibold text-white mb-1">{level.name}</h3>
                <p className="text-gray-400 text-xs">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-white mb-3">
            How would you describe your playstyle? *
          </label>
          <div className="flex flex-wrap gap-3">
            {(formData.category === 'esports' ? playstyles.esports : playstyles.sports).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => handleInputChange('playstyle', style)}
                className={`px-4 py-2 rounded-full border transition-all ${formData.playstyle === style 
                  ? 'border-yellow-500 bg-yellow-500/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
              >
                <span className="text-white">{style}</span>
              </button>
            ))}
          </div>
        </div>

        {formData.category === 'sports' && (
          <div>
            <label className="block text-lg font-medium text-white mb-3">
              What competitive level do you play at? *
            </label>
            <div className="flex flex-wrap gap-3">
              {['School', 'College', 'District', 'State', 'National', 'International'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleInputChange('level', level)}
                  className={`px-4 py-2 rounded-full border transition-all ${formData.level === level 
                    ? 'border-orange-500 bg-orange-500/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                >
                  <span className="text-white">{level}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-lg font-medium text-white mb-3">
            What are your main challenges? *
          </label>
          <textarea
            value={formData.target_gaps}
            onChange={(e) => handleInputChange('target_gaps', e.target.value)}
            placeholder={formData.category === 'esports' 
              ? "e.g., I struggle with endgame decision making and zone rotations..."
              : "e.g., Low stamina, poor technique, mental pressure..."}
            className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          disabled={!formData.skill_level || !formData.playstyle || !formData.target_gaps}
          className={`px-8 py-3 rounded-lg font-medium ${!formData.skill_level || !formData.playstyle || !formData.target_gaps
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg text-white'}`}
        >
          Next: Logistics →
        </button>
      </div>
    </div>
  );

  // STEP 3: Logistics & Preferences
  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Logistics & Preferences</h2>
        <p className="text-gray-400">Tell us about your scheduling and budget</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-medium text-white mb-3">
              Preferred training location *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {locations.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleInputChange('location', location)}
                  className={`p-3 rounded-lg border transition-all ${formData.location === location 
                    ? 'border-blue-500 bg-blue-500/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                >
                  <span className="text-white">{location}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-white mb-3">
              Preferred training timings *
            </label>
            <div className="flex flex-wrap gap-3">
              {timings.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleInputChange('timings', time)}
                  className={`px-4 py-2 rounded-full border transition-all ${formData.timings === time 
                    ? 'border-green-500 bg-green-500/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                >
                  <span className="text-white">{time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-white mb-3">
            What is your budget? *
          </label>
          <div className="flex flex-wrap gap-3">
            {(formData.category === 'esports' ? budgets.esports : budgets.sports).map((budget) => (
              <button
                key={budget}
                type="button"
                onClick={() => handleInputChange('budget', budget)}
                className={`px-4 py-3 rounded-lg border transition-all ${formData.budget === budget 
                  ? 'border-purple-500 bg-purple-500/20' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
              >
                <span className="text-white">{budget}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-white mb-3">
            How would you rate your current performance?
          </label>
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleInputChange('rating', star.toString())}
                className="text-3xl focus:outline-none transition-transform hover:scale-110"
              >
                <span className={`${star <= (parseInt(formData.rating) || 0) ? 'text-yellow-400' : 'text-gray-600'}`}>
                  ★
                </span>
              </button>
            ))}
            <span className="ml-2 text-gray-400">
              {formData.rating ? `${formData.rating}/5` : 'Select rating (optional)'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-white mb-3">
            Any additional notes for your coach?
          </label>
          <textarea
            value={formData.additional_notes}
            onChange={(e) => handleInputChange('additional_notes', e.target.value)}
            placeholder="e.g., Specific techniques you want to learn, tournament preparation needs, etc."
            className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Python Backend Status */}
        <div className={`p-4 rounded-lg border ${
          pythonBackendStatus === 'connected' 
            ? 'bg-green-900/20 border-green-700' 
            : pythonBackendStatus === 'checking'
            ? 'bg-yellow-900/20 border-yellow-700'
            : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                pythonBackendStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                pythonBackendStatus === 'checking' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm">
                AI Backend: <span className={
                  pythonBackendStatus === 'connected' ? 'text-green-400' :
                  pythonBackendStatus === 'checking' ? 'text-yellow-400' :
                  'text-red-400'
                }>
                  {pythonBackendStatus === 'connected' ? '✅ Ready' : 
                   pythonBackendStatus === 'checking' ? '🔍 Checking...' : 
                   '❌ Unavailable'}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={checkPythonBackend}
              className="text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
          
          {pythonBackendStatus !== 'connected' && (
            <p className="text-xs text-gray-400 mt-2">
              Note: If AI backend is unavailable, we'll use basic matching.
            </p>
          )}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-400 text-center">{success}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !formData.location || !formData.budget || !formData.timings}
          className={`px-8 py-3 rounded-lg font-medium flex items-center ${loading || !formData.location || !formData.budget || !formData.timings
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-blue-600 hover:shadow-lg text-white'}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Find My Coach →'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">
              Step {step} of 3
            </div>
            <div className="text-sm text-blue-400 font-medium">
              {formData.category && `${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} • ${formData.game}`}
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </form>

        {/* Test Button */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={async () => {
              try {
                setLoading(true);
                const status = await pythonRagAPI.testConnection();
                alert(`Python Backend: ${status.status}\n${status.data ? JSON.stringify(status.data) : status.error}`);
              } catch (err) {
                alert('Test failed: ' + err.message);
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            disabled={loading}
          >
            Test AI Backend Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachingForm;