// src/services/assessmentService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase-config.js';

// Collection names
const ASSESSMENTS_COLLECTION = 'assessments';
const ASSESSMENT_RESULTS_COLLECTION = 'assessment_results';
const USER_METRICS_COLLECTION = 'user_metrics';
const AI_TRAINING_DATA_COLLECTION = 'ai_training_data';

/**
 * Main function to save assessment data
 * @param {string} userId - Firebase user ID
 * @param {Object} assessmentData - Assessment answers and metadata
 * @returns {Promise<Object>} Saved assessment result
 */
export const saveAssessmentData = async (userId, assessmentData) => {
  try {
    console.log('📝 Starting assessment save for user:', userId);
    
    // Validate data
    if (!userId || !assessmentData || !assessmentData.game || !assessmentData.answers) {
      throw new Error('Invalid assessment data');
    }

    // Step 1: Save raw assessment data
    const assessmentId = await saveAssessment(userId, assessmentData);
    
    // Step 2: Calculate scores and generate results
    const assessmentResults = await generateAssessmentResults(
      userId, 
      assessmentId, 
      assessmentData
    );
    
    // Step 3: Update user metrics
    await updateUserMetrics(userId, assessmentData, assessmentResults);
    
    // Step 4: Prepare data for AI training
    await prepareAITrainingData(userId, assessmentId, assessmentData, assessmentResults);
    
    console.log('✅ Assessment saved successfully:', assessmentId);
    
    return {
      success: true,
      assessmentId,
      resultsId: assessmentResults.id,
      overallScore: assessmentResults.overallScore,
      skillLevel: assessmentResults.skillLevel,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error saving assessment data:', error);
    throw new Error(`Failed to save assessment: ${error.message}`);
  }
};

/**
 * Save raw assessment data to Firestore
 */
const saveAssessment = async (userId, assessmentData) => {
  try {
    const assessmentRef = doc(collection(db, ASSESSMENTS_COLLECTION));
    
    const assessmentRecord = {
      id: assessmentRef.id,
      userId,
      username: assessmentData.username || 'Anonymous',
      email: assessmentData.email || '',
      category: assessmentData.category,
      game: assessmentData.game,
      answers: assessmentData.answers,
      totalQuestions: Object.keys(assessmentData.answers).length,
      completedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'completed',
      version: '1.0.0',
      platform: 'web',
      // Add metadata for tracking
      deviceInfo: {
        userAgent: navigator?.userAgent || 'unknown',
        screenSize: `${window?.screen?.width}x${window?.screen?.height}` || 'unknown',
        language: navigator?.language || 'en'
      }
    };

    await setDoc(assessmentRef, assessmentRecord);
    console.log('📄 Raw assessment saved:', assessmentRef.id);
    
    return assessmentRef.id;
  } catch (error) {
    console.error('Error saving raw assessment:', error);
    throw error;
  }
};

/**
 * Generate assessment results with scoring and insights
 */
const generateAssessmentResults = async (userId, assessmentId, assessmentData) => {
  try {
    const resultsRef = doc(collection(db, ASSESSMENT_RESULTS_COLLECTION));
    const game = assessmentData.game;
    const answers = assessmentData.answers;
    
    // Calculate scores for each parameter
    const parameterScores = calculateParameterScores(game, answers);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(parameterScores);
    
    // Generate insights based on answers
    const insights = generateGameInsights(game, answers, parameterScores);
    
    // Generate recommendations
    const recommendations = generateRecommendations(game, parameterScores, answers);
    
    // Determine skill level
    const skillLevel = determineSkillLevel(overallScore);
    
    // Identify strengths and weaknesses
    const strengths = identifyStrengths(parameterScores);
    const weaknesses = identifyWeaknesses(parameterScores);
    
    // Create results document
    const results = {
      id: resultsRef.id,
      assessmentId,
      userId,
      game,
      category: assessmentData.category,
      parameterScores,
      overallScore,
      skillLevel,
      strengths,
      weaknesses,
      insights,
      recommendations,
      skillBreakdown: getSkillBreakdown(game, answers),
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      metadata: {
        algorithmVersion: 'v1.2',
        processingTime: Date.now()
      }
    };

    await setDoc(resultsRef, results);
    console.log('📊 Assessment results generated:', resultsRef.id);
    
    return results;
  } catch (error) {
    console.error('Error generating assessment results:', error);
    throw error;
  }
};

/**
 * Calculate scores for each parameter based on answers
 */
const calculateParameterScores = (game, answers) => {
  const scores = {};
  const totalQuestions = 10;
  
  // Scoring weights for each question
  const questionWeights = {
    1: 1.2,  // Competitive Level - Higher weight
    2: 1.0,  // Role/Position
    3: 0.9,  // Experience Duration
    4: 1.1,  // Performance Output
    5: 1.0,  // Consistency
    6: 0.8,  // Strength Area
    7: 0.8,  // Weakness Area
    8: 1.3,  // Game Sense - Highest weight
    9: 0.7,  // Time Commitment
    10: 1.0  // Intent/Mindset
  };

  // Process each answer
  Object.entries(answers).forEach(([questionId, answer]) => {
    const questionNum = parseInt(questionId);
    const weight = questionWeights[questionNum] || 1.0;
    
    let score = 0;
    
    if (typeof answer === 'number') {
      // Rating scale answer (1-10)
      score = answer * 10; // Convert to 0-100 scale
    } else if (typeof answer === 'string') {
      // Text/select answer - game-specific scoring
      score = scoreSelectAnswer(game, questionNum, answer);
    }
    
    // Apply weight
    scores[`parameter_${questionId}`] = Math.min(100, Math.round(score * weight));
  });

  return scores;
};

/**
 * Score select/text answers based on game
 */
const scoreSelectAnswer = (game, questionId, answer) => {
  // Base scoring templates
  const baseScoring = {
    // Competitive Level scoring
    'Iron/Bronze (Beginner)': 20,
    'Silver/Gold (Intermediate)': 40,
    'Platinum/Diamond (Advanced)': 60,
    'Ascendant/Immortal (Expert)': 80,
    'Radiant (Professional)': 100,
    
    'Bronze/Silver (Beginner)': 20,
    'Gold/Platinum (Intermediate)': 40,
    'Diamond/Crown (Advanced)': 60,
    'Ace/Conqueror (Expert)': 80,
    'Top 500 Conqueror (Professional)': 100,
    
    'School/College Level': 30,
    'Club/City Level': 45,
    'District/State Level': 65,
    'National Level': 85,
    'International/Professional': 100,
    
    // Experience Duration scoring
    'Less than 6 months': 20,
    '6 months - 1 year': 40,
    '1-2 years': 60,
    '2-3 years': 80,
    '3+ years': 100,
    
    'Less than 2 years': 30,
    '2-5 years': 50,
    '5-10 years': 70,
    '10-15 years': 85,
    '15+ years': 100,
    
    // Performance Output scoring
    'Below 150 (Needs improvement)': 25,
    '150-200 (Average)': 45,
    '200-250 (Good)': 65,
    '250-300 (Excellent)': 85,
    '300+ (Exceptional)': 100,
    
    'Below 200 (Needs improvement)': 25,
    '200-400 (Average)': 45,
    '400-600 (Good)': 65,
    '600-800 (Excellent)': 85,
    '800+ (Exceptional)': 100,
    
    // Consistency scoring
    'Very inconsistent (up & down)': 20,
    'Somewhat inconsistent': 40,
    'Moderately consistent': 60,
    'Highly consistent': 80,
    'Extremely consistent (top level always)': 100,
    
    // Time Commitment scoring
    'Less than 5 hours': 20,
    '5-10 hours': 40,
    '10-15 hours': 60,
    '15-20 hours': 80,
    '20+ hours': 100,
    
    'Less than 10 hours': 30,
    '10-20 hours': 50,
    '20-30 hours': 70,
    '30-40 hours': 85,
    '40+ hours': 100,
    
    // Intent/Mindset scoring
    'Casual enjoyment with friends': 30,
    'Casual fun with friends': 30,
    'Recreational enjoyment': 30,
    'Recreational fitness': 30,
    
    'Improve personal skills': 50,
    'Improve personal rank': 50,
    'Improve skills': 50,
    
    'Reach higher rank': 70,
    'Build tournament experience': 70,
    'Represent higher level': 70,
    'Play at higher level': 70,
    
    'Join competitive team': 85,
    'Professional contract': 85,
    
    'Go professional': 100,
    'Professional esports career': 100,
    'National team selection': 100
  };

  // Check if answer exists in base scoring
  if (baseScoring[answer] !== undefined) {
    return baseScoring[answer];
  }

  // Game-specific scoring fallbacks
  const gameScoring = {
    valorant: {
      'Duelist Entry Fragger': 75,
      'Initiator Information Gatherer': 70,
      'Controller Site Anchor': 65,
      'Sentinel Defensive Anchor': 60,
      'Flexible Fill Player': 80
    },
    bgmi: {
      'Aggressive Rusher': 70,
      'Strategic Rotator': 75,
      'Support Player': 60,
      'Sniper/Long-range': 65,
      'Flexible Adaptor': 80
    },
    cricket: {
      'Opening Batsman': 75,
      'Middle Order Batsman': 70,
      'Bowler (Pace/Spin)': 75,
      'All-rounder': 85,
      'Wicket-keeper/Batsman': 80
    },
    football: {
      'Goalkeeper': 70,
      'Defender (CB/LB/RB)': 65,
      'Midfielder (CDM/CM/CAM)': 75,
      'Winger (LW/RW)': 70,
      'Striker/Forward': 80
    }
  };

  // Return game-specific score or default
  return gameScoring[game]?.[answer] || 50;
};

/**
 * Calculate overall score from parameter scores
 */
const calculateOverallScore = (parameterScores) => {
  const validScores = Object.values(parameterScores)
    .filter(score => typeof score === 'number' && !isNaN(score));
  
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((total, score) => total + score, 0);
  const average = sum / validScores.length;
  
  return Math.round(average);
};

/**
 * Generate game-specific insights
 */
const generateGameInsights = (game, answers, parameterScores) => {
  const insights = [];
  
  // Add general insights based on overall score
  const overallScore = calculateOverallScore(parameterScores);
  
  if (overallScore < 30) {
    insights.push("🚀 Beginner detected - Focus on foundational skills");
  } else if (overallScore < 60) {
    insights.push("📈 Intermediate level - Time to refine techniques");
  } else if (overallScore < 80) {
    insights.push("⭐ Advanced player - Polish specialized skills");
  } else {
    insights.push("🏆 Elite level - Master the nuances of the game");
  }
  
  // Game-specific insights
  switch(game) {
    case 'valorant':
      if (answers[1]?.includes('Radiant')) {
        insights.push("Professional level detected - Consider coaching opportunities");
      }
      if (answers[10] === 'Go professional') {
        insights.push("Professional aspirations - Structured training program needed");
      }
      break;
      
    case 'bgmi':
      if (answers[5]?.includes('Extremely consistent')) {
        insights.push("High consistency - Ready for tournament play");
      }
      if (answers[2] === 'Aggressive Rusher') {
        insights.push("Aggressive playstyle - Work on positioning and rotations");
      }
      break;
      
    case 'cricket':
      if (answers[4]?.includes('Batting Avg 50+')) {
        insights.push("Excellent batting average - Potential for higher levels");
      }
      if (answers[2] === 'All-rounder') {
        insights.push("Versatile player - Valuable asset for any team");
      }
      break;
      
    case 'football':
      if (answers[4]?.includes('Star player')) {
        insights.push("Key player detected - Leadership skills important");
      }
      if (answers[6]?.includes('Leadership/Communication')) {
        insights.push("Strong leadership skills - Captain material");
      }
      break;
  }
  
  // Add insights for low scoring parameters
  Object.entries(parameterScores).forEach(([param, score]) => {
    if (score < 40) {
      const paramNum = param.replace('parameter_', '');
      const paramName = getParameterName(paramNum);
      insights.push(`⚡ Focus needed on ${paramName} (Low score: ${score}/100)`);
    }
  });
  
  return insights.slice(0, 5); // Limit to 5 insights
};

/**
 * Generate personalized recommendations
 */
const generateRecommendations = (game, parameterScores, answers) => {
  const recommendations = [];
  
  // Find top 3 weakest areas
  const weakAreas = Object.entries(parameterScores)
    .filter(([key, score]) => key !== 'overallScore' && score < 70)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);
  
  weakAreas.forEach(([param, score]) => {
    const paramNum = param.replace('parameter_', '');
    const paramName = getParameterName(paramNum);
    recommendations.push({
      area: paramName,
      priority: 'high',
      action: getImprovementAction(game, paramNum, score),
      estimatedTime: '2-4 weeks',
      score: score
    });
  });
  
  // Game-specific recommendations
  const gameRecommendations = {
    valorant: [
      "Practice aim training for 30 minutes daily",
      "Review professional match VODs weekly",
      "Master 2-3 agents in your role",
      "Work on communication and callouts",
      "Study map callouts and rotations"
    ],
    bgmi: [
      "Practice loot management in early game",
      "Master 2-3 weapon combinations",
      "Work on zone prediction and rotations",
      "Improve close-range combat skills",
      "Practice vehicle control and positioning"
    ],
    cricket: [
      "Focus on technical skill refinement",
      "Practice specific shots/bowling variations",
      "Work on fitness and agility",
      "Study match situations and decision making",
      "Improve mental game and concentration"
    ],
    football: [
      "Work on weak foot accuracy",
      "Improve physical conditioning",
      "Practice positional awareness",
      "Study tactical formations",
      "Work on first touch and ball control"
    ]
  };
  
  gameRecommendations[game]?.forEach(rec => {
    recommendations.push({
      area: 'General',
      priority: 'medium',
      action: rec,
      estimatedTime: '1-2 weeks',
      score: 0
    });
  });
  
  return recommendations.slice(0, 8); // Limit to 8 recommendations
};

/**
 * Determine skill level based on score
 */
const determineSkillLevel = (score) => {
  if (score >= 90) return 'Elite';
  if (score >= 80) return 'Advanced';
  if (score >= 65) return 'Intermediate';
  if (score >= 45) return 'Beginner';
  return 'Novice';
};

/**
 * Identify top 3 strengths
 */
const identifyStrengths = (parameterScores) => {
  return Object.entries(parameterScores)
    .filter(([key, score]) => key !== 'overallScore' && score >= 75)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => {
      const paramNum = key.replace('parameter_', '');
      return getParameterName(paramNum);
    });
};

/**
 * Identify top 3 weaknesses
 */
const identifyWeaknesses = (parameterScores) => {
  return Object.entries(parameterScores)
    .filter(([key, score]) => key !== 'overallScore' && score < 60)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key]) => {
      const paramNum = key.replace('parameter_', '');
      return getParameterName(paramNum);
    });
};

/**
 * Get skill breakdown for the game
 */
const getSkillBreakdown = (game, answers) => {
  const breakdown = {
    technical: 0,
    tactical: 0,
    physical: 0,
    mental: 0
  };
  
  // Map questions to skill categories
  const categoryMapping = {
    1: 'technical',   // Competitive Level
    2: 'technical',   // Role/Position
    3: 'mental',      // Experience
    4: 'technical',   // Performance
    5: 'mental',      // Consistency
    6: 'technical',   // Strengths
    7: 'technical',   // Weaknesses
    8: 'tactical',    // Game Sense
    9: 'physical',    // Time Commitment
    10: 'mental'      // Intent
  };
  
  // Calculate category scores
  Object.entries(answers).forEach(([questionId, answer]) => {
    const category = categoryMapping[questionId];
    if (category) {
      let score = 0;
      
      if (typeof answer === 'number') {
        score = answer * 10;
      } else {
        score = scoreSelectAnswer(game, parseInt(questionId), answer);
      }
      
      breakdown[category] += score;
    }
  });
  
  // Normalize scores
  Object.keys(breakdown).forEach(category => {
    breakdown[category] = Math.round(breakdown[category] / 3); // Rough normalization
  });
  
  return breakdown;
};

/**
 * Update user metrics
 */
const updateUserMetrics = async (userId, assessmentData, assessmentResults) => {
  try {
    const metricsRef = doc(db, USER_METRICS_COLLECTION, userId);
    const metricsDoc = await getDoc(metricsRef);
    
    const now = serverTimestamp();
    const currentDate = new Date().toISOString().split('T')[0];
    
    const baseData = {
      userId,
      lastAssessment: now,
      lastAssessmentDate: currentDate,
      lastGame: assessmentData.game,
      lastCategory: assessmentData.category,
      lastScore: assessmentResults.overallScore,
      lastSkillLevel: assessmentResults.skillLevel,
      updatedAt: now
    };

    if (metricsDoc.exists()) {
      const existingData = metricsDoc.data();
      const assessmentCount = (existingData.assessmentCount || 0) + 1;
      
      const updates = {
        ...baseData,
        assessmentCount,
        totalScore: (existingData.totalScore || 0) + assessmentResults.overallScore,
        averageScore: Math.round(((existingData.totalScore || 0) + assessmentResults.overallScore) / assessmentCount),
        assessmentsCompleted: [...new Set([...(existingData.assessmentsCompleted || []), assessmentData.game])],
        skillHistory: [...(existingData.skillHistory || []), {
          date: currentDate,
          game: assessmentData.game,
          score: assessmentResults.overallScore,
          level: assessmentResults.skillLevel
        }].slice(-10), // Keep last 10 assessments
        improvementRate: calculateImprovementRate(existingData.skillHistory, assessmentResults.overallScore)
      };

      await updateDoc(metricsRef, updates);
    } else {
      await setDoc(metricsRef, {
        ...baseData,
        assessmentCount: 1,
        totalScore: assessmentResults.overallScore,
        averageScore: assessmentResults.overallScore,
        firstAssessment: now,
        assessmentsCompleted: [assessmentData.game],
        skillHistory: [{
          date: currentDate,
          game: assessmentData.game,
          score: assessmentResults.overallScore,
          level: assessmentResults.skillLevel
        }],
        improvementRate: 0,
        createdAt: now
      });
    }
    
    console.log('📈 User metrics updated for:', userId);
  } catch (error) {
    console.error('Error updating user metrics:', error);
    // Don't throw - metrics update shouldn't fail the whole process
  }
};

/**
 * Prepare data for AI training
 */
const prepareAITrainingData = async (userId, assessmentId, assessmentData, assessmentResults) => {
  try {
    const aiDataRef = doc(collection(db, AI_TRAINING_DATA_COLLECTION));
    
    const aiTrainingData = {
      id: aiDataRef.id,
      userId,
      assessmentId,
      timestamp: serverTimestamp(),
      game: assessmentData.game,
      category: assessmentData.category,
      input: {
        answers: assessmentData.answers,
        userInfo: {
          game: assessmentData.game,
          category: assessmentData.category
        }
      },
      output: {
        scores: assessmentResults.parameterScores,
        overallScore: assessmentResults.overallScore,
        skillLevel: assessmentResults.skillLevel,
        insights: assessmentResults.insights,
        recommendations: assessmentResults.recommendations
      },
      metadata: {
        processed: false,
        modelVersion: 'v1',
        dataType: 'assessment_training',
        createdAt: new Date().toISOString()
      }
    };

    await setDoc(aiDataRef, aiTrainingData);
    console.log('🤖 AI training data prepared:', aiDataRef.id);
  } catch (error) {
    console.error('Error preparing AI training data:', error);
    // Don't throw - AI data prep shouldn't fail the whole process
  }
};

/**
 * Helper Functions
 */

const getParameterName = (paramId) => {
  const parameterNames = {
    1: 'Competitive Level',
    2: 'Role/Position',
    3: 'Experience Duration',
    4: 'Performance Output',
    5: 'Consistency',
    6: 'Strength Area',
    7: 'Weakness Area',
    8: 'Game Sense',
    9: 'Time Commitment',
    10: 'Intent/Mindset'
  };
  return parameterNames[paramId] || `Parameter ${paramId}`;
};

const getImprovementAction = (game, parameterId, score) => {
  const actions = {
    1: 'Focus on competitive play and tournament participation',
    2: 'Study professional players in your role',
    3: 'Gain more competitive experience',
    4: 'Track and analyze your performance metrics',
    5: 'Develop consistent practice routines',
    6: 'Refine and specialize in your strengths',
    7: 'Targeted practice on weak areas',
    8: 'Study game theory and watch professional matches',
    9: 'Increase dedicated practice time',
    10: 'Set clear goals and develop winning mindset'
  };

  const gameSpecificActions = {
    valorant: {
      8: 'Watch professional Valorant tournaments and analyze rotations',
      4: 'Use tracking apps to monitor ACS and K/D ratio'
    },
    bgmi: {
      8: 'Study zone rotations and positioning strategies',
      5: 'Focus on consistent drop locations and loot routes'
    },
    cricket: {
      4: 'Maintain detailed performance records for batting/bowling',
      8: 'Study match situations and decision making'
    },
    football: {
      8: 'Analyze professional matches and tactical formations',
      9: 'Increase training frequency and intensity'
    }
  };

  return gameSpecificActions[game]?.[parameterId] || actions[parameterId] || 'Practice and review regularly';
};

const calculateImprovementRate = (skillHistory, currentScore) => {
  if (!skillHistory || skillHistory.length < 2) return 0;
  
  const previousScore = skillHistory[skillHistory.length - 1]?.score || 50;
  const improvement = currentScore - previousScore;
  
  return Math.round((improvement / previousScore) * 100);
};

/**
 * PUBLIC API FUNCTIONS
 */

export const getUserAssessments = async (userId, limitCount = 10) => {
  try {
    const assessmentsRef = collection(db, ASSESSMENTS_COLLECTION);
    const q = query(
      assessmentsRef,
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    return [];
  }
};

export const getAssessmentResults = async (assessmentId) => {
  try {
    const resultsRef = collection(db, ASSESSMENT_RESULTS_COLLECTION);
    const q = query(resultsRef, where('assessmentId', '==', assessmentId));
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return null;
  }
};

export const getLatestAssessment = async (userId) => {
  try {
    const assessments = await getUserAssessments(userId, 1);
    return assessments.length > 0 ? assessments[0] : null;
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    return null;
  }
};

export const getUserSkillProfile = async (userId) => {
  try {
    const resultsRef = collection(db, ASSESSMENT_RESULTS_COLLECTION);
    const q = query(
      resultsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        game: data.game,
        skillLevel: data.skillLevel,
        overallScore: data.overallScore,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        insights: data.insights || [],
        recommendations: data.recommendations || [],
        lastAssessed: data.createdAt?.toDate() || new Date(),
        skillBreakdown: data.skillBreakdown || {}
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user skill profile:', error);
    return null;
  }
};

export const getUserMetrics = async (userId) => {
  try {
    const metricsRef = doc(db, USER_METRICS_COLLECTION, userId);
    const metricsDoc = await getDoc(metricsRef);
    
    if (metricsDoc.exists()) {
      return {
        id: metricsDoc.id,
        ...metricsDoc.data(),
        lastAssessment: metricsDoc.data().lastAssessment?.toDate() || new Date(),
        firstAssessment: metricsDoc.data().firstAssessment?.toDate() || new Date(),
        updatedAt: metricsDoc.data().updatedAt?.toDate() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return null;
  }
};

export const prepareDataForAI = async (userId) => {
  try {
    const assessments = await getUserAssessments(userId);
    const skillProfile = await getUserSkillProfile(userId);
    const userMetrics = await getUserMetrics(userId);
    
    return {
      user_id: userId,
      assessments_count: assessments.length,
      current_profile: skillProfile,
      metrics: userMetrics,
      aggregated_data: {
        total_assessments: assessments.length,
        games_assessed: [...new Set(assessments.map(a => a.game))],
        average_score: userMetrics?.averageScore || 0,
        skill_history: userMetrics?.skillHistory || [],
        improvement_trend: userMetrics?.improvementRate || 0
      },
      raw_assessments: assessments.map(assessment => ({
        id: assessment.id,
        game: assessment.game,
        category: assessment.category,
        answers: assessment.answers,
        timestamp: assessment.completedAt
      })),
      timestamp: new Date().toISOString(),
      data_version: '1.0'
    };
  } catch (error) {
    console.error('Error preparing data for AI:', error);
    return null;
  }
};

export const getAssessmentAnalytics = async (userId) => {
  try {
    const [assessments, skillProfile, metrics] = await Promise.all([
      getUserAssessments(userId),
      getUserSkillProfile(userId),
      getUserMetrics(userId)
    ]);

    return {
      summary: {
        totalAssessments: assessments.length,
        primaryGame: assessments[0]?.game || 'None',
        currentSkillLevel: skillProfile?.skillLevel || 'Not assessed',
        averageScore: metrics?.averageScore || 0,
        improvementRate: metrics?.improvementRate || 0
      },
      breakdown: {
        byGame: groupByGame(assessments),
        byCategory: groupByCategory(assessments),
        bySkillLevel: groupBySkillLevel(assessments, skillProfile)
      },
      trends: {
        recentScores: getRecentScores(metrics?.skillHistory || []),
        skillProgression: getSkillProgression(metrics?.skillHistory || [])
      }
    };
  } catch (error) {
    console.error('Error getting assessment analytics:', error);
    return null;
  }
};

// Helper analytics functions
const groupByGame = (assessments) => {
  const groups = {};
  assessments.forEach(assessment => {
    groups[assessment.game] = (groups[assessment.game] || 0) + 1;
  });
  return groups;
};

const groupByCategory = (assessments) => {
  const groups = { esports: 0, sports: 0 };
  assessments.forEach(assessment => {
    if (groups[assessment.category] !== undefined) {
      groups[assessment.category]++;
    }
  });
  return groups;
};

const groupBySkillLevel = (assessments, skillProfile) => {
  // Implementation depends on your skill level categorization
  return {};
};

const getRecentScores = (skillHistory) => {
  return skillHistory.slice(-5).map(item => ({
    date: item.date,
    score: item.score,
    game: item.game
  }));
};

const getSkillProgression = (skillHistory) => {
  if (skillHistory.length < 2) return [];
  
  return skillHistory.map((item, index) => ({
    date: item.date,
    score: item.score,
    game: item.game,
    improvement: index > 0 ? item.score - skillHistory[index - 1].score : 0
  }));
};

export default {
  saveAssessmentData,
  getUserAssessments,
  getAssessmentResults,
  getLatestAssessment,
  getUserSkillProfile,
  getUserMetrics,
  prepareDataForAI,
  getAssessmentAnalytics
};