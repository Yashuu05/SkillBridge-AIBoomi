// src/pages/TestDatabase.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { saveAthleteProfile, getAthleteProfile, testConnection } from '../services/profileDatabaseService';
import { SAMPLE_PROFILES } from '../utils/initDatabase';

const TestDatabase = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnectionHandler = async () => {
    setLoading(true);
    try {
      const isConnected = await testConnection();
      setResult(isConnected ? '✅ Database connection successful!' : '❌ Connection failed');
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSaveProfile = async (type) => {
    setLoading(true);
    const user = auth.currentUser;
    
    if (!user) {
      setResult('❌ No user logged in');
      setLoading(false);
      return;
    }

    try {
      const sampleData = SAMPLE_PROFILES[type];
      const result = await saveAthleteProfile(user.uid, sampleData, type);
      
      setResult(`
        ✅ Profile saved successfully!
        User ID: ${result.profileId}
        Type: ${type}
        Timestamp: ${result.timestamp}
      `);
    } catch (error) {
      setResult(`❌ Error saving profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetProfile = async () => {
    setLoading(true);
    const user = auth.currentUser;
    
    if (!user) {
      setResult('❌ No user logged in');
      setLoading(false);
      return;
    }

    try {
      const result = await getAthleteProfile(user.uid);
      
      if (result.exists) {
        setResult(`
          ✅ Profile found!
          Exists: ${result.exists}
          Athlete Type: ${result.data.athleteType}
          Completion: ${result.data.metadata?.profileCompletion}%
          Data: ${JSON.stringify(result.data, null, 2)}
        `);
      } else {
        setResult('📭 No profile found for this user');
      }
    } catch (error) {
      setResult(`❌ Error getting profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (