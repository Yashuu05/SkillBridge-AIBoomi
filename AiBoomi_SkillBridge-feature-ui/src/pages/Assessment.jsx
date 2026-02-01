import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Assessment = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  
  // Game-specific questions database - 10 questions for each game
  const gameQuestions = {
    // VALORANT - 10 Questions
    valorant: [
      {
        id: 1,
        parameter: "Competitive Level",
        question: "What is your current competitive rank in Valorant?",
        type: "select",
        options: [
          "Iron/Bronze (Beginner)",
          "Silver/Gold (Intermediate)",
          "Platinum/Diamond (Advanced)",
          "Ascendant/Immortal (Expert)",
          "Radiant (Professional)"
        ]
      },
      {
        id: 2,
        parameter: "Role/Position",
        question: "What is your primary agent role and position?",
        type: "select",
        options: [
          "Duelist Entry Fragger",
          "Initiator Information Gatherer",
          "Controller Site Anchor",
          "Sentinel Defensive Anchor",
          "Flexible Fill Player"
        ]
      },
      {
        id: 3,
        parameter: "Experience Duration",
        question: "How many years have you played Valorant competitively?",
        type: "select",
        options: [
          "Less than 6 months",
          "6 months - 1 year",
          "1-2 years",
          "2-3 years",
          "3+ years"
        ]
      },
      {
        id: 4,
        parameter: "Performance Output",
        question: "What's your average ACS (Average Combat Score) in competitive matches?",
        type: "select",
        options: [
          "Below 150 (Needs improvement)",
          "150-200 (Average)",
          "200-250 (Good)",
          "250-300 (Excellent)",
          "300+ (Exceptional)"
        ]
      },
      {
        id: 5,
        parameter: "Consistency",
        question: "How consistent is your performance across matches?",
        type: "select",
        options: [
          "Very inconsistent (peaks and valleys)",
          "Somewhat inconsistent",
          "Moderately consistent",
          "Highly consistent",
          "Extremely consistent (top fragger most games)"
        ]
      },
      {
        id: 6,
        parameter: "Strength Area",
        question: "What is your strongest skill in Valorant?",
        type: "select",
        options: [
          "Aim/Mechanical Skill",
          "Game Sense/Rotation",
          "Utility Usage",
          "Communication/Calls",
          "Clutch Performance"
        ]
      },
      {
        id: 7,
        parameter: "Weakness Area",
        question: "What needs the most improvement?",
        type: "select",
        options: [
          "Crosshair Placement",
          "Economy Management",
          "Agent Knowledge",
          "Team Coordination",
          "Mental Fortitude"
        ]
      },
      {
        id: 8,
        parameter: "Game Sense",
        question: "How would you rate your tactical awareness and game sense?",
        type: "rating",
        min: 1,
        max: 10,
        labels: ["1 - Basic", "5 - Intermediate", "10 - Pro Level"]
      },
      {
        id: 9,
        parameter: "Time Commitment",
        question: "How many hours per week can you dedicate to Valorant practice?",
        type: "select",
        options: [
          "Less than 10 hours",
          "10-20 hours",
          "20-30 hours",
          "30-40 hours",
          "40+ hours"
        ]
      },
      {
        id: 10,
        parameter: "Intent/Mindset",
        question: "What is your primary goal with Valorant?",
        type: "select",
        options: [
          "Casual enjoyment with friends",
          "Improve personal skills",
          "Reach higher rank",
          "Join competitive team",
          "Go professional"
        ]
      }
    ],

    // BGMI - 10 Questions
    bgmi: [
      {
        id: 1,
        parameter: "Competitive Level",
        question: "What is your current competitive tier in BGMI?",
        type: "select",
        options: [
          "Bronze/Silver (Beginner)",
          "Gold/Platinum (Intermediate)",
          "Diamond/Crown (Advanced)",
          "Ace/Conqueror (Expert)",
          "Top 500 Conqueror (Professional)"
        ]
      },
      {
        id: 2,
        parameter: "Playstyle",
        question: "What is your primary playstyle in BGMI?",
        type: "select",
        options: [
          "Aggressive Rusher",
          "Strategic Rotator",
          "Support Player",
          "Sniper/Long-range",
          "Flexible Adaptor"
        ]
      },
      {
        id: 3,
        parameter: "Experience Duration",
        question: "How long have you been playing BGMI competitively?",
        type: "select",
        options: [
          "Less than 6 months",
          "6 months - 1 year",
          "1-2 years",
          "2-3 years",
          "3+ years"
        ]
      },
      {
        id: 4,
        parameter: "Performance Output",
        question: "What's your average damage per match?",
        type: "select",
        options: [
          "Below 200 (Needs improvement)",
          "200-400 (Average)",
          "400-600 (Good)",
          "600-800 (Excellent)",
          "800+ (Exceptional)"
        ]
      },
      {
        id: 5,
        parameter: "Consistency",
        question: "How consistent is your survival rate and placement?",
        type: "select",
        options: [
          "Very inconsistent (early eliminations common)",
          "Somewhat inconsistent",
          "Usually survive to top 20",
          "Consistent top 10 finishes",
          "Extremely consistent (top 3 most games)"
        ]
      },
      {
        id: 6,
        parameter: "Strength Area",
        question: "What is your strongest aspect in BGMI?",
        type: "select",
        options: [
          "Close-range combat",
          "Sniping accuracy",
          "Vehicle control",
          "Positioning/rotations",
          "Team leadership"
        ]
      },
      {
        id: 7,
        parameter: "Weakness Area",
        question: "What needs the most improvement?",
        type: "select",
        options: [
          "Loot management",
          "End-game scenarios",
          "Sound awareness",
          "Weapon control",
          "Map knowledge"
        ]
      },
      {
        id: 8,
        parameter: "Game Sense",
        question: "How would you rate your zone prediction and rotation timing?",
        type: "rating",
        min: 1,
        max: 10,
        labels: ["1 - Basic", "5 - Intermediate", "10 - Pro Level"]
      },
      {
        id: 9,
        parameter: "Time Commitment",
        question: "How many hours per week can you dedicate to BGMI practice?",
        type: "select",
        options: [
          "Less than 10 hours",
          "10-20 hours",
          "20-30 hours",
          "30-40 hours",
          "40+ hours"
        ]
      },
      {
        id: 10,
        parameter: "Intent/Mindset",
        question: "What is your primary goal with BGMI?",
        type: "select",
        options: [
          "Casual fun with friends",
          "Improve personal rank",
          "Build tournament experience",
          "Join competitive squad",
          "Professional esports career"
        ]
      }
    ],

    // CRICKET - 10 Questions
    cricket: [
      {
        id: 1,
        parameter: "Competitive Level",
        question: "What is your current competitive level in Cricket?",
        type: "select",
        options: [
          "School/College Level",
          "Club/City Level",
          "District/State Level",
          "National Level",
          "International/Professional"
        ]
      },
      {
        id: 2,
        parameter: "Role/Position",
        question: "What is your primary role in Cricket?",
        type: "select",
        options: [
          "Opening Batsman",
          "Middle Order Batsman",
          "Bowler (Pace/Spin)",
          "All-rounder",
          "Wicket-keeper/Batsman"
        ]
      },
      {
        id: 3,
        parameter: "Experience Duration",
        question: "How many years of competitive cricket experience do you have?",
        type: "select",
        options: [
          "Less than 2 years",
          "2-5 years",
          "5-10 years",
          "10-15 years",
          "15+ years"
        ]
      },
      {
        id: 4,
        parameter: "Performance Output",
        question: "What best describes your recent performance?",
        type: "select",
        options: [
          "Batting Avg < 20 / Bowling Avg > 40",
          "Batting Avg 20-30 / Bowling Avg 30-40",
          "Batting Avg 30-40 / Bowling Avg 20-30",
          "Batting Avg 40-50 / Bowling Avg 15-20",
          "Batting Avg 50+ / Bowling Avg < 15"
        ]
      },
      {
        id: 5,
        parameter: "Consistency",
        question: "How consistent are your performances?",
        type: "select",
        options: [
          "Very inconsistent (frequent failures)",
          "Somewhat inconsistent",
          "Moderately consistent",
          "Highly consistent performer",
          "Extremely consistent (match-winner regularly)"
        ]
      },
      {
        id: 6,
        parameter: "Strength Area",
        question: "What is your biggest strength in Cricket?",
        type: "select",
        options: [
          "Technique/Footwork",
          "Power hitting",
          "Bowling accuracy",
          "Fielding agility",
          "Mental toughness"
        ]
      },
      {
        id: 7,
        parameter: "Weakness Area",
        question: "What needs the most improvement?",
        type: "select",
        options: [
          "Against pace bowling",
          "Against spin bowling",
          "Fitness/stamina",
          "Shot selection",
          "Running between wickets"
        ]
      },
      {
        id: 8,
        parameter: "Game Sense",
        question: "How would you rate your cricketing IQ and match awareness?",
        type: "rating",
        min: 1,
        max: 10,
        labels: ["1 - Basic", "5 - Intermediate", "10 - International Level"]
      },
      {
        id: 9,
        parameter: "Time Commitment",
        question: "How many hours per week can you dedicate to cricket practice?",
        type: "select",
        options: [
          "Less than 5 hours",
          "5-10 hours",
          "10-15 hours",
          "15-20 hours",
          "20+ hours"
        ]
      },
      {
        id: 10,
        parameter: "Intent/Mindset",
        question: "What is your primary cricket goal?",
        type: "select",
        options: [
          "Recreational enjoyment",
          "Improve personal skills",
          "Represent higher level",
          "Professional contract",
          "National team selection"
        ]
      }
    ],

    // FOOTBALL - 10 Questions
    football: [
      {
        id: 1,
        parameter: "Competitive Level",
        question: "What is your current competitive level in Football?",
        type: "select",
        options: [
          "School/College Level",
          "Local Club Level",
          "District/State Level",
          "National League",
          "Professional/International"
        ]
      },
      {
        id: 2,
        parameter: "Position",
        question: "What is your primary position in Football?",
        type: "select",
        options: [
          "Goalkeeper",
          "Defender (CB/LB/RB)",
          "Midfielder (CDM/CM/CAM)",
          "Winger (LW/RW)",
          "Striker/Forward"
        ]
      },
      {
        id: 3,
        parameter: "Experience Duration",
        question: "How many years of competitive football experience do you have?",
        type: "select",
        options: [
          "Less than 2 years",
          "2-5 years",
          "5-10 years",
          "10-15 years",
          "15+ years"
        ]
      },
      {
        id: 4,
        parameter: "Performance Output",
        question: "How would you rate your recent match performances?",
        type: "select",
        options: [
          "Bench player/limited minutes",
          "Regular starter - average impact",
          "Regular starter - solid performances",
          "Key player - consistent impact",
          "Star player - match winner regularly"
        ]
      },
      {
        id: 5,
        parameter: "Consistency",
        question: "How consistent is your performance level?",
        type: "select",
        options: [
          "Very inconsistent (good and bad games)",
          "Somewhat inconsistent",
          "Generally consistent",
          "Highly consistent performer",
          "Extremely consistent (top level always)"
        ]
      },
      {
        id: 6,
        parameter: "Strength Area",
        question: "What is your biggest strength in Football?",
        type: "select",
        options: [
          "Pace/Speed",
          "Technical skills",
          "Physical strength",
          "Tactical intelligence",
          "Leadership/Communication"
        ]
      },
      {
        id: 7,
        parameter: "Weakness Area",
        question: "What needs the most improvement?",
        type: "select",
        options: [
          "Weak foot",
          "Aerial ability",
          "Stamina/fitness",
          "Decision making",
          "Positional awareness"
        ]
      },
      {
        id: 8,
        parameter: "Game Sense",
        question: "How would you rate your football IQ and tactical understanding?",
        type: "rating",
        min: 1,
        max: 10,
        labels: ["1 - Basic", "5 - Intermediate", "10 - Pro Level"]
      },
      {
        id: 9,
        parameter: "Time Commitment",
        question: "How many hours per week can you dedicate to football training?",
        type: "select",
        options: [
          "Less than 5 hours",
          "5-10 hours",
          "10-15 hours",
          "15-20 hours",
          "20+ hours"
        ]
      },
      {
        id: 10,
        parameter: "Intent/Mindset",
        question: "What is your primary football goal?",
        type: "select",
        options: [
          "Recreational fitness",
          "Improve skills",
          "Play at higher level",
          "Professional contract",
          "National team selection"
        ]
      }
    ]
  };

  // Get current questions based on selected game
  const getCurrentQuestions = () => {
    if (!selectedGame) return [];
    return gameQuestions[selectedGame] || [];
  };

  const questions = getCurrentQuestions();
  const totalQuestions = questions.length;

  const handleAnswer = (value) => {
    const currentQ = questions[currentQuestion];
    setAnswers({
      ...answers,
      [currentQ.id]: value
    });
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit assessment
      const assessmentData = {
        game: selectedGame,
        category: selectedCategory,
        answers: answers,
        completedAt: new Date().toISOString()
      };
      navigate('/skill-result', { state: { assessmentData } });
    }
  };

  const handleSkip = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate('/skill-result', { state: { assessmentData: { game: selectedGame, answers } } });
    }
  };

  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'select':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full text-left bg-gray-900/50 border border-gray-700 rounded-xl px-6 py-4 text-white hover:border-blue-500 hover:bg-gray-800/50 transition-all duration-200 hover:translate-x-1"
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'rating':
        const ratingValue = answers[question.id] || 0;
        return (
          <div className="py-4">
            <div className="flex justify-between mb-4 flex-wrap gap-2">
              {[...Array(question.max)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i + 1)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all ${ratingValue === i + 1
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                    : 'bg-gray-900/50 border border-gray-700 text-gray-300 hover:border-blue-500 hover:scale-105'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {question.labels && (
              <div className="flex justify-between text-sm text-gray-400 mt-4 px-2">
                {question.labels.map((label, idx) => (
                  <span key={idx} className="text-center">{label}</span>
                ))}
              </div>
            )}
            {ratingValue > 0 && (
              <div className="mt-6 text-center">
                <div className="inline-block px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                  <span className="text-blue-300 font-bold text-xl">{ratingValue}/10</span>
                  <span className="text-blue-400 ml-2">
                    {ratingValue <= 3 ? "Needs Work" : 
                     ratingValue <= 5 ? "Developing" :
                     ratingValue <= 7 ? "Good" :
                     ratingValue <= 9 ? "Excellent" : "Outstanding"}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // If no game selected, show selection screen
  if (!selectedGame) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Skill Assessment
            </h1>
            <p className="text-gray-400 text-xl">
              Select your game/sport for personalized assessment
            </p>
          </div>

          {/* Category Selection */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Category</h2>
            <div className="flex gap-6 justify-center mb-12">
              <button
                onClick={() => setSelectedCategory('esports')}
                className={`px-10 py-6 rounded-2xl text-xl font-bold transition-all ${selectedCategory === 'esports' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/30' 
                  : 'bg-gray-900/50 border-2 border-gray-700 text-gray-300 hover:border-purple-500 hover:scale-105'}`}
              >
                🎮 ESPORTS
              </button>
              <button
                onClick={() => setSelectedCategory('sports')}
                className={`px-10 py-6 rounded-2xl text-xl font-bold transition-all ${selectedCategory === 'sports' 
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-2xl shadow-green-500/30' 
                  : 'bg-gray-900/50 border-2 border-gray-700 text-gray-300 hover:border-green-500 hover:scale-105'}`}
              >
                ⚽ SPORTS
              </button>
            </div>

            {/* Game Selection based on Category */}
            {selectedCategory && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">
                  Select Your {selectedCategory === 'esports' ? 'Game' : 'Sport'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {selectedCategory === 'esports' ? (
                    <>
                      <button
                        onClick={() => setSelectedGame('valorant')}
                        className="p-8 rounded-2xl border-2 border-gray-700 bg-gray-900/50 hover:border-blue-500 hover:bg-blue-900/20 transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">🔫</div>
                          <h3 className="text-2xl font-bold text-white mb-2">Valorant</h3>
                          <p className="text-gray-400 text-sm">10 detailed questions</p>
                          <div className="mt-4 flex justify-center gap-2">
                            {['Tactical', '5v5', 'FPS'].map(tag => (
                              <span key={tag} className="px-3 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedGame('bgmi')}
                        className="p-8 rounded-2xl border-2 border-gray-700 bg-gray-900/50 hover:border-green-500 hover:bg-green-900/20 transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">🎯</div>
                          <h3 className="text-2xl font-bold text-white mb-2">BGMI</h3>
                          <p className="text-gray-400 text-sm">10 detailed questions</p>
                          <div className="mt-4 flex justify-center gap-2">
                            {['Battle Royale', 'Mobile', 'Squad'].map(tag => (
                              <span key={tag} className="px-3 py-1 bg-green-900/30 text-green-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedGame('cricket')}
                        className="p-8 rounded-2xl border-2 border-gray-700 bg-gray-900/50 hover:border-amber-500 hover:bg-amber-900/20 transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">🏏</div>
                          <h3 className="text-2xl font-bold text-white mb-2">Cricket</h3>
                          <p className="text-gray-400 text-sm">10 detailed questions</p>
                          <div className="mt-4 flex justify-center gap-2">
                            {['Batting', 'Bowling', 'Fielding'].map(tag => (
                              <span key={tag} className="px-3 py-1 bg-amber-900/30 text-amber-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedGame('football')}
                        className="p-8 rounded-2xl border-2 border-gray-700 bg-gray-900/50 hover:border-red-500 hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] group"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">⚽</div>
                          <h3 className="text-2xl font-bold text-white mb-2">Football</h3>
                          <p className="text-gray-400 text-sm">10 detailed questions</p>
                          <div className="mt-4 flex justify-center gap-2">
                            {['Team', 'Physical', 'Technical'].map(tag => (
                              <span key={tag} className="px-3 py-1 bg-red-900/30 text-red-300 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assessment Info */}
          <div className="mt-12 max-w-2xl mx-auto text-center text-gray-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-gray-900/30 rounded-xl">
                <div className="text-blue-400 font-bold text-2xl mb-2">10</div>
                <div className="text-sm">Detailed Questions</div>
              </div>
              <div className="p-4 bg-gray-900/30 rounded-xl">
                <div className="text-green-400 font-bold text-2xl mb-2">4</div>
                <div className="text-sm">Game/Sport Options</div>
              </div>
              <div className="p-4 bg-gray-900/30 rounded-xl">
                <div className="text-purple-400 font-bold text-2xl mb-2">10</div>
                <div className="text-sm">Skill Parameters</div>
              </div>
            </div>
            <p className="text-gray-400">Each assessment covers 10 key skill parameters for personalized training recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  // Show assessment questions
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="w-full max-w-3xl">
        {/* Header with Game Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  setSelectedGame('');
                  setCurrentQuestion(0);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Selection
              </button>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCategory === 'esports' 
                ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50' 
                : 'bg-green-900/30 text-green-300 border border-green-700/50'}`}>
                {selectedCategory === 'esports' ? '🎮 Esports' : '⚽ Sports'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {selectedGame.charAt(0).toUpperCase() + selectedGame.slice(1)} Assessment
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Question</div>
            <div className="text-2xl font-bold text-white">
              {currentQuestion + 1}<span className="text-gray-500">/{totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 shadow-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-3">
              <span className="font-medium">
                {questions[currentQuestion]?.parameter}
              </span>
              <span className="font-bold">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Current Question */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
              {questions[currentQuestion]?.question}
            </h3>
            
            <div className="mt-2 animate-fadeIn">
              {questions[currentQuestion] && renderQuestionInput(questions[currentQuestion])}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-700/50">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${currentQuestion === 0
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {Object.keys(answers).length} of {totalQuestions} answered
              </span>
              
              <button
                onClick={handleSkip}
                className="px-5 py-2.5 text-gray-400 hover:text-white font-medium"
              >
                Skip
              </button>
              
              <button
                onClick={() => {
                  if (currentQuestion === totalQuestions - 1) {
                    const assessmentData = {
                      game: selectedGame,
                      category: selectedCategory,
                      answers: answers,
                      completedAt: new Date().toISOString()
                    };
                    navigate('/skill-result', { state: { assessmentData } });
                  } else if (answers[questions[currentQuestion].id]) {
                    setCurrentQuestion(currentQuestion + 1);
                  }
                }}
                disabled={!answers[questions[currentQuestion]?.id]}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${answers[questions[currentQuestion]?.id]
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/20'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                {currentQuestion === totalQuestions - 1 ? (
                  <>Complete Assessment →</>
                ) : (
                  <>Next Question →</>
                )}
              </button>
            </div>
          </div>
          
          {/* Question Progress */}
          <div className="mt-6 pt-4 border-t border-gray-700/30">
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${currentQuestion === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : answers[q.id]
                    ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                    : 'bg-gray-900/50 text-gray-500 border border-gray-700/50'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Assessment Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Assessment covering 10 key parameters for {selectedGame}</p>
          <p className="mt-1">Your answers will generate a personalized training plan</p>
        </div>
      </div>
    </div>
  );
};

export default Assessment;