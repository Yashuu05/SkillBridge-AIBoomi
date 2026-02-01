// server/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use 'gemini-1.5-flash' (Standard) or 'gemini-2.5-flash' (if you have access)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generates a coaching recommendation using RAG.
 * @param {Object} studentData - The student profile from Firestore.
 * @param {Array} topCoaches - The top 3 matched coaches.
 * @returns {Promise<string>} - The AI generated reasoning.
 */
async function generateRagResponse(studentData, topCoaches) {
  try {
    // Construct the prompt (Ported exactly from your Python script)
    const coachesText = topCoaches.map((c, i) => 
      `${i + 1}. ${c.name} - ${c.specialty || 'Coach'} (${c.experience || 'N/A'}) - ${c.location || 'Location N/A'}`
    ).join('\n');

    const prompt = `
    You are an expert Talent Scout for SkillBridge.
    Your primary role is to analyze student profiles and recommend the best-matched coaches.
    
    Student Profile:
    - Category: ${studentData.category || 'Esports'}
    - Game/Sport: ${studentData.game || 'N/A'}
    - Role/Position: ${studentData.role || 'N/A'}
    - Skill Level: ${studentData.skill_level || 'N/A'}
    - Challenges: ${studentData.target_gaps || 'N/A'}
    - Location: ${studentData.location || 'Online'}
    - Playstyle: ${studentData.playstyle || 'N/A'}
    
    Top ${topCoaches.length} Matched Coaches:
    ${coachesText}
    
    Task:
    1. Recommend the #1 best coach from the list above for the student.
    2. Explain why they are the best fit for the student in a few lines.
    3. Explain why their specialization solves the student's specific challenges in few lines.
    4. Suggest one alternative coach.

    Note: Format the response in a friendly, professional tone. Focus on reasoning and match quality.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "AI service is currently unavailable. Please review the recommended matches manually.";
  }
}

module.exports = { generateRagResponse };