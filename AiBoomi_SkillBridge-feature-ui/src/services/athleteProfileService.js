// src/services/athleteProfileService.js
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { createEmptyAthleteProfile, calculateAthleteScore } from '../utils/athleteData';

const ATHLETE_PROFILES_COLLECTION = 'athleteProfiles';

// Save athlete profile
export const saveAthleteProfile = async (userId, profileData) => {
  try {
    const profileRef = doc(db, ATHLETE_PROFILES_COLLECTION, userId);
    
    // Calculate athlete score
    const athleteScore = calculateAthleteScore(profileData);
    
    const dataToSave = {
      ...profileData,
      athleteScore,
      metadata: {
        ...profileData.metadata,
        updatedAt: serverTimestamp(),
        profileCompletion: calculateProfileCompletion(profileData),
        dataPointsCollected: countDataPoints(profileData)
      }
    };
    
    await setDoc(profileRef, dataToSave, { merge: true });
    console.log('✅ Athlete profile saved:', userId);
    return { success: true, profile: dataToSave, athleteScore };
  } catch (error) {
    console.error('❌ Error saving athlete profile:', error);
    throw error;
  }
};

// Get athlete profile
export const getAthleteProfile = async (userId) => {
  try {
    const profileRef = doc(db, ATHLETE_PROFILES_COLLECTION, userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data();
    } else {
      console.log('Creating empty athlete profile');
      const emptyProfile = createEmptyAthleteProfile(userId, '');
      await saveAthleteProfile(userId, emptyProfile);
      return emptyProfile;
    }
  } catch (error) {
    console.error('Error getting athlete profile:', error);
    throw error;
  }
};

// Update performance metrics
export const updatePerformanceMetrics = async (userId, metrics) => {
  try {
    const profileRef = doc(db, ATHLETE_PROFILES_COLLECTION, userId);
    
    await updateDoc(profileRef, {
      'performanceMetrics': metrics,
      'metadata.updatedAt': serverTimestamp()
    });
    
    console.log('✅ Performance metrics updated');
    return { success: true };
  } catch (error) {
    console.error('Error updating metrics:', error);
    throw error;
  }
};

// Update skills assessment
export const updateSkillsAssessment = async (userId, assessmentData) => {
  try {
    const profileRef = doc(db, ATHLETE_PROFILES_COLLECTION, userId);
    
    const updateData = {
      'skillsAssessment': assessmentData,
      'metadata.lastAssessmentDate': serverTimestamp(),
      'metadata.updatedAt': serverTimestamp()
    };
    
    await updateDoc(profileRef, updateData);
    
    // Trigger AI analysis
    await triggerAthleteAIAnalysis(userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating skills assessment:', error);
    throw error;
  }
};

// Get athletes by skill level (for team matching)
export const getAthletesBySkill = async (skillType, minLevel = 7) => {
  try {
    const profilesRef = collection(db, ATHLETE_PROFILES_COLLECTION);
    const fieldPath = skillType === 'esports' 
      ? 'skillsAssessment.esportsSkills.mechanicalSkill.level'
      : 'skillsAssessment.sportsSkills.technique.level';
    
    const q = query(profilesRef, where(fieldPath, '>=', minLevel));
    const snapshot = await getDocs(q);
    
    const athletes = [];
    snapshot.forEach(doc => {
      athletes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return athletes;
  } catch (error) {
    console.error('Error getting athletes by skill:', error);
    throw error;
  }
};

// Get top athletes for leaderboard
export const getTopAthletes = async (category = 'esports', limit = 10) => {
  try {
    const profilesRef = collection(db, ATHLETE_PROFILES_COLLECTION);
    const q = query(
      profilesRef,
      where('category.type', '==', category)
    );
    
    const snapshot = await getDocs(q);
    const athletes = [];
    
    snapshot.forEach(doc => {
      athletes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by athlete score
    athletes.sort((a, b) => (b.athleteScore || 0) - (a.athleteScore || 0));
    
    return athletes.slice(0, limit);
  } catch (error) {
    console.error('Error getting top athletes:', error);
    throw error;
  }
};

// Helper functions
const calculateProfileCompletion = (profile) => {
  let completed = 0;
  let total = 0;
  
  // Check basic info
  Object.values(profile.basicInfo).forEach(value => {
    total++;
    if (value && value.toString().trim() !== '') completed++;
  });
  
  // Check category info
  Object.values(profile.category).forEach(value => {
    total++;
    if (value && value.toString().trim() !== '') completed++;
  });
  
  // Check goals
  if (profile.goals.shortTerm && profile.goals.shortTerm.length > 0) completed++;
  total++;
  
  return Math.round((completed / total) * 100);
};

const countDataPoints = (profile) => {
  let count = 0;
  
  // Count performance metrics
  if (profile.category.type === 'esports') {
    count += Object.keys(profile.performanceMetrics.esports).length;
  } else {
    count += Object.keys(profile.performanceMetrics.sports).length;
  }
  
  // Count skills assessment
  count += Object.keys(profile.skillsAssessment.esportsSkills || {}).length;
  count += Object.keys(profile.skillsAssessment.sportsSkills || {}).length;
  
  return count;
};

// AI Analysis Function
const triggerAthleteAIAnalysis = async (userId) => {
  console.log('🤖 Starting AI analysis for athlete:', userId);
  
  // Mock AI analysis (replace with actual AI service)
  setTimeout(async () => {
    try {
      const profileRef = doc(db, ATHLETE_PROFILES_COLLECTION, userId);
      
      const aiAnalysis = {
        skillGapAnalysis: {
          criticalGaps: ['Positioning', 'Communication'],
          strengths: ['Mechanical Skill', 'Reaction Time'],
          improvementPriority: ['Team Coordination', 'Map Awareness']
        },
        trainingRecommendations: [
          { area: 'Aim Training', duration: '30 min/day', tools: ['Aim Lab', 'Kovaak'] },
          { area: 'VOD Review', duration: '1 hour/week', focus: 'Positioning Mistakes' }
        ],
        coachMatches: [
          { coachId: 'coach_esports1', matchScore: 92, specialization: 'FPS Games' },
          { coachId: 'coach_esports2', matchScore: 87, specialization: 'Team Strategy' }
        ],
        performancePredictions: {
          nextMonth: { rankImprovement: '+2 tiers', winRate: '+5%' },
          nextSixMonths: { potentialRank: 'Professional', tournamentReadiness: 'High' }
        },
        lastAnalyzed: serverTimestamp()
      };
      
      await updateDoc(profileRef, {
        'aiAnalysis': aiAnalysis
      });
      
      console.log('✅ AI analysis completed for:', userId);
    } catch (error) {
      console.error('❌ AI analysis error:', error);
    }
  }, 2000);
};