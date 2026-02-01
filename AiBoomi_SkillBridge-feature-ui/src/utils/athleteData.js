// src/utils/athleteData.js

// Sports & Esports Categories
export const SPORTS_CATEGORIES = {
  ESPORTS: {
    genres: ['MOBA', 'FPS', 'Battle Royale', 'RTS', 'Sports Simulation', 'Fighting', 'Card Games'],
    games: ['Valorant', 'CS:GO', 'League of Legends', 'Dota 2', 'Fortnite', 'Apex Legends', 'Overwatch', 'Rocket League', 'PUBG', 'Call of Duty']
  },
  SPORTS: {
    categories: ['Football', 'Basketball', 'Cricket', 'Tennis', 'Badminton', 'Volleyball', 'Swimming', 'Athletics', 'Boxing', 'Martial Arts']
  }
};

// Athlete Profile Schema
export const athleteProfileSchema = {
  // Basic Information
  basicInfo: {
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    gender: '',
    profileImage: '',
    contactEmail: '',
    contactPhone: ''
  },
  
  // Athlete Category (Sports or Esports)
  category: {
    type: '', // 'esports' or 'sports'
    primaryGame: '', // For esports
    primarySport: '', // For sports
    position: '', // In-game role or sports position
    teamName: '',
    jerseyNumber: ''
  },
  
  // Performance Metrics (For AI Analysis)
  performanceMetrics: {
    // Esports Metrics
    esports: {
      rank: '',
      peakRank: '',
      winRate: 0,
      KDA: { kills: 0, deaths: 0, assists: 0 },
      headshotPercentage: 0,
      reactionTime: 0, // in ms
      APM: 0, // Actions Per Minute
      tournamentWins: 0,
      averageScore: 0
    },
    
    // Sports Metrics
    sports: {
      height: 0, // in cm
      weight: 0, // in kg
      staminaLevel: 0, // 1-10
      speedMetrics: {
        sprintTime100m: 0,
        agilityScore: 0
      },
      strengthMetrics: {
        benchPress: 0,
        squat: 0,
        verticalJump: 0
      },
      enduranceScore: 0,
      recoveryRate: 0,
      injuryHistory: []
    }
  },
  
  // Skills Assessment (For AI Model)
  skillsAssessment: {
    // Esports Skills
    esportsSkills: {
      mechanicalSkill: { level: 0, confidence: 0 },
      gameSense: { level: 0, confidence: 0 },
      positioning: { level: 0, confidence: 0 },
      communication: { level: 0, confidence: 0 },
      decisionMaking: { level: 0, confidence: 0 },
      adaptability: { level: 0, confidence: 0 },
      clutchPerformance: { level: 0, confidence: 0 },
      leadership: { level: 0, confidence: 0 }
    },
    
    // Sports Skills
    sportsSkills: {
      technique: { level: 0, confidence: 0 },
      tacticalAwareness: { level: 0, confidence: 0 },
      physicalFitness: { level: 0, confidence: 0 },
      mentalToughness: { level: 0, confidence: 0 },
      teamwork: { level: 0, confidence: 0 },
      consistency: { level: 0, confidence: 0 },
      injuryPrevention: { level: 0, confidence: 0 },
      recoveryAbility: { level: 0, confidence: 0 }
    },
    
    // Common Skills
    commonSkills: {
      discipline: { level: 0, confidence: 0 },
      focus: { level: 0, confidence: 0 },
      stressManagement: { level: 0, confidence: 0 },
      learningAbility: { level: 0, confidence: 0 }
    }
  },
  
  // Career Stats
  careerStats: {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    tournamentsPlayed: 0,
    tournamentWins: 0,
    personalBests: [],
    records: [],
    awards: []
  },
  
  // Training & Development
  trainingData: {
    weeklyHours: 0,
    trainingFocus: [], // ['aim training', 'strategy', 'fitness']
    coachFeedback: [],
    performanceTrend: [], // Time-series data
    weaknessesToImprove: [],
    strengthsToMaintain: []
  },
  
  // Goals & Aspirations
  goals: {
    shortTerm: [], // Next 3 months
    mediumTerm: [], // Next year
    longTerm: [], // 3+ years
    targetRank: '',
    targetTeam: '',
    targetTournaments: [],
    skillImprovements: []
  },
  
  // AI Model Data
  aiAnalysis: {
    skillGapAnalysis: {},
    performancePredictions: {},
    trainingRecommendations: [],
    coachMatches: [],
    tournamentRecommendations: [],
    injuryRiskAssessment: {},
    careerProjection: {}
  },
  
  // Metadata
  metadata: {
    createdAt: null,
    updatedAt: null,
    profileCompletion: 0,
    lastAssessmentDate: null,
    dataPointsCollected: 0
  }
};

// Create empty athlete profile
export const createEmptyAthleteProfile = (userId, email) => ({
  userId,
  email,
  ...athleteProfileSchema,
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    profileCompletion: 0,
    lastAssessmentDate: null,
    dataPointsCollected: 0
  }
});

// Calculate esports rank tier
export const getEsportsRankTier = (rankScore) => {
  if (rankScore >= 90) return 'Professional';
  if (rankScore >= 80) return 'Semi-Pro';
  if (rankScore >= 70) return 'Elite';
  if (rankScore >= 60) return 'Advanced';
  if (rankScore >= 50) return 'Intermediate';
  return 'Beginner';
};

// Calculate sports fitness level
export const getFitnessLevel = (fitnessScore) => {
  if (fitnessScore >= 90) return 'Elite Athlete';
  if (fitnessScore >= 80) return 'Professional';
  if (fitnessScore >= 70) return 'Advanced';
  if (fitnessScore >= 60) return 'Intermediate';
  return 'Developing';
};

// Calculate overall athlete score
export const calculateAthleteScore = (profile) => {
  let totalScore = 0;
  let maxScore = 0;
  
  // Calculate based on category
  if (profile.category.type === 'esports') {
    const esportsSkills = profile.skillsAssessment.esportsSkills;
    Object.values(esportsSkills).forEach(skill => {
      totalScore += skill.level * skill.confidence;
      maxScore += 100; // max level 10 * max confidence 10
    });
  } else {
    const sportsSkills = profile.skillsAssessment.sportsSkills;
    Object.values(sportsSkills).forEach(skill => {
      totalScore += skill.level * skill.confidence;
      maxScore += 100;
    });
  }
  
  // Add common skills
  const commonSkills = profile.skillsAssessment.commonSkills;
  Object.values(commonSkills).forEach(skill => {
    totalScore += skill.level * skill.confidence * 0.5; // Weighted less
    maxScore += 50;
  });
  
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};