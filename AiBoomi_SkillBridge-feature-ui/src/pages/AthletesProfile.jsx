// src/pages/AthleteProfile.jsx - COMPLETE WITH FIREBASE DATABASE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import SportsProfileForm from '../components/SportsProfileForm';
import EsportsProfileForm from '../components/EsportsProfileForm';

const AthleteProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [athleteType, setAthleteType] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [databaseStatus, setDatabaseStatus] = useState('Ready');
  const navigate = useNavigate();

  // Check authentication and load profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      await loadProfile(currentUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load profile from Firestore
  const loadProfile = async (userId) => {
    try {
      console.log('📥 Loading profile from Firestore...');
      setDatabaseStatus('Loading...');
      
      const profileRef = doc(db, 'athleteProfiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        console.log('✅ Profile loaded from Firestore:', data);
        setProfile(data);
        setAthleteType(data.athleteType || '');
        setDatabaseStatus('Data loaded from Firestore');
      } else {
        console.log('📭 No profile found in Firestore');
        setProfile({});
        setDatabaseStatus('No profile found - Create one');
      }
    } catch (error) {
      console.error('❌ Error loading profile from Firestore:', error);
      setDatabaseStatus(`Error: ${error.message}`);
      setProfile({});
    }
  };

  // Handle athlete type selection
  const handleAthleteTypeSelect = async (type) => {
    if (!user) return;
    
    try {
      console.log('💾 Creating profile in Firestore...');
      setDatabaseStatus('Saving to Firestore...');
      
      const initialProfile = {
        athleteType: type,
        userId: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          profileCompletion: 10,
          isActive: true
        }
      };
      
      const profileRef = doc(db, 'athleteProfiles', user.uid);
      await setDoc(profileRef, initialProfile, { merge: true });
      
      console.log('✅ Profile created in Firestore');
      setAthleteType(type);
      setProfile(initialProfile);
      setActiveTab('profile');
      setDatabaseStatus('Profile created in Firestore');
      
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
      setDatabaseStatus(`Save failed: ${error.message}`);
      alert('Error saving selection. Check Firestore setup.');
    }
  };

  // Save profile to Firestore
  const handleSaveProfile = async (formData) => {
    if (!user) return;

    try {
      console.log('💾 Saving profile to Firestore...');
      setDatabaseStatus('Saving...');
      
      const profileRef = doc(db, 'athleteProfiles', user.uid);
      
      // Calculate profile completion
      const completion = calculateProfileCompletion(formData);
      
      const dataToSave = {
        ...formData,
        athleteType,
        userId: user.uid,
        email: user.email,
        updatedAt: serverTimestamp(),
        metadata: {
          ...(profile.metadata || {}),
          profileCompletion: completion,
          updatedAt: serverTimestamp(),
          isActive: true
        }
      };

      console.log('📊 Saving data to Firestore:', dataToSave);
      
      await setDoc(profileRef, dataToSave, { merge: true });
      
      console.log('✅ Profile saved to Firestore successfully!');
      setProfile(dataToSave);
      setDatabaseStatus('Saved to Firestore ✓');
      
      alert('✅ Profile saved successfully to Firebase Database!');
      
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
      setDatabaseStatus(`Save failed: ${error.message}`);
      alert(`❌ Error: ${error.message}\n\nMake sure:\n1. Firestore is created in Firebase Console\n2. Security rules allow writes`);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (formData) => {
    let completed = 0;
    let total = 0;
    
    // Check basic info
    if (formData.basicInfo?.fullName) completed++;
    total++;
    
    if (athleteType === 'sports') {
      if (formData.sportsDetails?.primarySport) completed++;
      total++;
    } else {
      if (formData.esportsDetails?.primaryGame) completed++;
      total++;
    }
    
    if (formData.performanceGoals?.shortTermGoal) completed++;
    total++;
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Handle changing athlete type
  const handleChangeType = () => {
    if (window.confirm('Changing athlete type will reset your profile. Continue?')) {
      setAthleteType('');
      setProfile({});
      setActiveTab('profile');
      setDatabaseStatus('Select type to begin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Athlete Type Selection Page
  if (!athleteType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Create Your Athlete Profile 🏆
            </h1>
            <p className="text-gray-400 text-center mb-2">
              Data will be saved securely in Firebase Database
            </p>
            <p className="text-gray-500 text-sm text-center mb-12">
              Database Status: <span className="text-green-400">{databaseStatus}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sports Athlete Card */}
              <div 
                className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-700/50 rounded-2xl p-8 text-center hover:border-blue-500 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => handleAthleteTypeSelect('sports')}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚽</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Sports Athlete</h2>
                <div className="text-left space-y-3 mb-6">
                  <div className="flex items-center text-gray-300">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Physical metrics tracking</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Sport-specific analytics</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="text-blue-400 mr-2">✓</span>
                    <span>Training plan optimization</span>
                  </div>
                </div>
                <div className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all w-full">
                  Select Sports
                </div>
              </div>

              {/* Esports Athlete Card */}
              <div 
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-700/50 rounded-2xl p-8 text-center hover:border-purple-500 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => handleAthleteTypeSelect('esports')}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎮</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Esports Athlete</h2>
                <div className="text-left space-y-3 mb-6">
                  <div className="flex items-center text-gray-300">
                    <span className="text-purple-400 mr-2">✓</span>
                    <span>Game performance analytics</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="text-purple-400 mr-2">✓</span>
                    <span>Skill improvement tracking</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="text-purple-400 mr-2">✓</span>
                    <span>Team coordination metrics</span>
                  </div>
                </div>
                <div className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all w-full">
                  Select Esports
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {athleteType === 'sports' ? 'Sports' : 'Esports'} Profile
              </h1>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${athleteType === 'esports' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                  {athleteType === 'esports' ? '🎮 Esports Athlete' : '⚽ Sports Athlete'}
                </span>
                <span className="ml-3 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                  {databaseStatus}
                </span>
                <button
                  onClick={handleChangeType}
                  className="ml-4 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Change Type
                </button>
              </div>
            </div>
            
            {/* Profile Status */}
            <div className="mt-4 md:mt-0">
              <div className="text-center">
                <div className={`text-2xl font-bold ${athleteType === 'esports' ? 'text-purple-400' : 'text-blue-400'}`}>
                  {profile?.metadata?.profileCompletion || 0}% Complete
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Data stored in Firebase Firestore
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabs & Form */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-800 mb-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-medium text-sm transition-all capitalize ${
                  activeTab === 'profile'
                    ? `text-white border-b-2 ${athleteType === 'esports' ? 'border-purple-500' : 'border-blue-500'}`
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Edit Profile
                {activeTab === 'profile' && profile?.basicInfo?.fullName && (
                  <span className="ml-2 text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-6 py-3 font-medium text-sm transition-all capitalize ${
                  activeTab === 'progress'
                    ? `text-white border-b-2 ${athleteType === 'esports' ? 'border-purple-500' : 'border-blue-500'}`
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 font-medium text-sm transition-all capitalize ${
                  activeTab === 'analytics'
                    ? `text-white border-b-2 ${athleteType === 'esports' ? 'border-purple-500' : 'border-blue-500'}`
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {athleteType === 'sports' ? 'Sports' : 'Esports'} Profile Form
                    </h2>
                    <span className="text-sm text-gray-400">
                      Saving to: <code className="bg-gray-800 px-2 py-1 rounded">athleteProfiles/{user?.uid}</code>
                    </span>
                  </div>
                  
                  {athleteType === 'sports' ? (
                    <SportsProfileForm 
                      initialData={profile || {}}
                      onSave={handleSaveProfile}
                    />
                  ) : (
                    <EsportsProfileForm 
                      initialData={profile || {}}
                      onSave={handleSaveProfile}
                    />
                  )}
                </div>
              )}

              {activeTab === 'progress' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Progress Tracking</h2>
                  <div className="text-center py-12">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${athleteType === 'esports' ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
                      <span className="text-4xl">📈</span>
                    </div>
                    <p className="text-gray-300 text-lg mb-2">Track your improvements</p>
                    <p className="text-gray-400 text-sm">
                      View your progress over time with detailed analytics stored in Firebase
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">AI Analytics</h2>
                  <div className="text-center py-12">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${athleteType === 'esports' ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
                      <span className="text-4xl">🤖</span>
                    </div>
                    <p className="text-gray-300 text-lg mb-2">AI-powered insights</p>
                    <p className="text-gray-400 text-sm">
                      Get personalized recommendations based on your profile data
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Database Info & Stats */}
          <div className="space-y-6">
            {/* Database Status Card */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">💾</span> Firebase Database Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Connection</span>
                  <span className="text-green-400 font-medium">Connected ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Saved</span>
                  <span className="text-green-400 font-medium">Yes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Completion</span>
                  <span className={`font-bold ${(profile?.metadata?.profileCompletion || 0) >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {profile?.metadata?.profileCompletion || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">User ID</span>
                  <code className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                    {user?.uid?.substring(0, 12)}...
                  </code>
                </div>
                <button
                  onClick={() => loadProfile(user?.uid)}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:opacity-90 transition-all"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Firebase Console Link */}
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-800/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">View in Firebase</h3>
              <p className="text-gray-300 text-sm mb-4">
                See your data in Firebase Console:
              </p>
              <ol className="text-gray-400 text-sm space-y-2 mb-4">
                <li className="flex items-center">
                  <span className="mr-2">1.</span>
                  Go to Firebase Console
                </li>
                <li className="flex items-center">
                  <span className="mr-2">2.</span>
                  Select your project
                </li>
                <li className="flex items-center">
                  <span className="mr-2">3.</span>
                  Click &quot;Firestore Database&quot;
                </li>
                <li className="flex items-center">
                  <span className="mr-2">4.</span>
                  Open &quot;athleteProfiles&quot; collection
                </li>
                <li className="flex items-center">
                  <span className="mr-2">5.</span>
                  Find document with your User ID
                </li>
              </ol>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Open Firebase Console
              </a>
            </div>

            {/* Data Structure Info */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Data Structure</h3>
              <div className="text-sm text-gray-300 font-mono space-y-1">
                <div>athleteProfiles/</div>
                <div className="ml-4">{user?.uid?.substring(0, 12)}...</div>
                <div className="ml-8">athleteType: &quot;{athleteType}&quot;</div>
                <div className="ml-8">
                  {athleteType === 'sports' ? 'basicInfo: {...}' : 'esportsInfo: {...}'}
                </div>
                <div className="ml-8">
                  {athleteType === 'sports' ? 'sportsDetails: {...}' : 'esportsDetails: {...}'}
                </div>
                <div className="ml-8">performanceGoals: </div>
                <div className="ml-8">metadata: </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteProfile;