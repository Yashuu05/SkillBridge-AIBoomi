// server/routes/ai/matchCoach.js
const express = require('express');
const router = express.Router();
const { generateRagResponse } = require('../../services/geminiService');
// CHANGE THIS LINE: Import db from your new config file
const { db } = require('../../config/firebase'); 

// Route: POST /api/ai/match-coach
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // 1. Validate Input
    // We expect { "requestId": "REQ_123" } or { "request_id": "REQ_123" }
    const requestId = req.body.requestId || req.body.request_id;
    
    if (!requestId) {
      return res.status(400).json({ status: "error", error: "Request ID is required" });
    }

    console.log(`\n🔍 Processing Request ID: ${requestId}`);

    // 2. Fetch Student Data
    const studentDoc = await db.collection('coaching_requests').doc(requestId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ status: "error", error: "Student request not found." });
    }
    
    const studentData = studentDoc.data();
    console.log(`✅ Found Student: ${studentData.role} (${studentData.game})`);

    // 3. Fetch All Coaches
    const coachesSnapshot = await db.collection('coaches').limit(20).get();
    if (coachesSnapshot.empty) {
      return res.status(404).json({ status: "error", error: "No coaches found in database." });
    }

    const coaches = [];
    coachesSnapshot.forEach(doc => {
      coaches.push({ id: doc.id, ...doc.data() });
    });

    // 4. Run Matching Algorithm (Ported from Python Section C)
    // Scoring: Category(+40), Game(+30), Location(+20), Role(+10)
    console.log(`🤖 Matching ${coaches.length} coaches...`);
    
    const scoredCoaches = coaches.map(coach => {
      let score = 0;
      
      const coachText = `${coach.specialty || ''} ${coach.description || ''}`.toLowerCase();
      const studentGame = (studentData.game || '').toLowerCase();
      const studentRole = (studentData.role || '').toLowerCase();

      // Category match
      if (coach.category === studentData.category) score += 40;
      
      // Game match
      if (studentGame && coachText.includes(studentGame)) score += 30;
      
      // Location match
      if (coach.location === studentData.location) score += 20;
      
      // Role match
      if (studentRole && coachText.includes(studentRole)) score += 10;

      return {
        ...coach,
        match_score: Math.min(score, 100) // Cap at 100
      };
    });

    // Sort descending by score and take top 3
    const topMatches = scoredCoaches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 3);

    // 5. Generate AI Explanation (RAG)
    console.log("💭 Generating AI recommendation...");
    const aiReasoning = await generateRagResponse(studentData, topMatches);

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Processing completed in ${processingTime.toFixed(2)}s`);

    // 6. Return Response
    return res.json({
      status: "success",
      student_fetched: studentData.role,
      recommended_coach: topMatches.length > 0 ? topMatches[0].name : null,
      ai_reasoning: aiReasoning,
      all_matches: topMatches
    });

  } catch (error) {
    console.error("❌ Error in match-coach:", error);
    return res.status(500).json({ 
      status: "error", 
      error: `Internal server error: ${error.message}` 
    });
  }
});

module.exports = router;