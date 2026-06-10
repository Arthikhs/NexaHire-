import express, { json } from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer, public_id } = req.body;

    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({
      url: cloud.secure_url,
      public_id: cloud.public_id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

router.post("/career", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills) {
      return res.status(400).json({
        message: "Skills Required",
      });
    }

    const prompt = ` 
Based on the following skills: ${skills}. 
 
Please act as a career advisor and generate a career path suggestion. 
Your entire response must be in a valid JSON format. Do not include any text or markdown 
formatting outside of the JSON structure. 
 
The JSON object should have the following structure: 
{ 
 "summary": "A brief, encouraging summary of the user's skill set and their general job 
title.", 
 "jobOptions": [ 
 { 
"title": "The name of the job role.", 
"responsibilities": "A description of what the user would do in this role.", 
"why": "An explanation of why this role is a good fit for their skills." 
 } 
 ], 
 "skillsToLearn": [ 
 { 
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack 
Mastery', 'DevOps & Cloud').", 
"skills": [ 
 { 
 "title": "The name of the skill to learn.", 
 "why": "Why learning this skill is important.", 
 "how": "Specific examples of how to learn or apply this skill." 
 } 
] 
 } 
 ], 
 "learningApproach": { 
"title": "How to Approach Learning", 
"points": ["A bullet point list of actionable advice for learning."] 
 } 
} 
 `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("Ai did not return a valid text response.");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "Ai returned response that was not valid JSON",
        rawResponse: response.text,
      });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/resume-analyser", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ message: "PDF data is required" });
    }

    const prompt = ` 
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume 
and provide: 
1. An ATS compatibility score (0-100) 
2. Detailed suggestions to improve the resume for better ATS performance 
 
Your entire response must be in valid JSON format. Do not include any text or markdown 
formatting outside of the JSON structure. 
 
The JSON object should have the following structure: 
{ 
  "atsScore": 85, 
  "scoreBreakdown": { 
    "formatting": { 
      "score": 90, 
      "feedback": "Brief feedback on formatting" 
    }, 
    "keywords": { 
      "score": 80, 
      "feedback": "Brief feedback on keyword usage" 
    }, 
    "structure": { 
      "score": 85, 
      "feedback": "Brief feedback on resume structure" 
    }, 
    "readability": { 
      "score": 88, 
      "feedback": "Brief feedback on readability" 
    } 
  }, 
  "suggestions": [ 
    { 
      "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords', 
'Structure')", 
      "issue": "Description of the issue found", 
      "recommendation": "Specific actionable recommendation to fix it", 
      "priority": "high/medium/low" 
    } 
  ], 
  "strengths": [ 
    "List of things the resume does well for ATS" 
  ], 
  "summary": "A brief 2-3 sentence summary of the overall ATS performance" 
} 
 
Focus on: - File format and structure compatibility - Proper use of standard section headings - Keyword optimization - Formatting issues (tables, columns, graphics, special characters) - Contact information placement - Date formatting - Use of action verbs and quantifiable achievements - Section organization and flow 
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
              },
            },
          ],
        },
      ],
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!rawText) {
        throw new Error("Ai did not return a valid text response.");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "Ai returned response that was not valid JSON",
        rawResponse: response.text,
      });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/resume-builder", async (req, res) => {
  try {
    const { jobDescription, userInfo } = req.body;

    if (!jobDescription || !userInfo) {
      return res.status(400).json({ message: "Job description and user info are required" });
    }

    const prompt = `You are an expert resume writer and ATS optimization specialist.

Job Description:
${jobDescription}

Candidate Info:
Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone}
Experience: ${userInfo.experience}
Skills: ${userInfo.skills}
Education: ${userInfo.education}
Projects: ${userInfo.projects || "Not provided"}

Your entire response must be valid JSON only. No markdown, no extra text outside JSON.

{
  "atsScore": 88,
  "summary": "2-3 line professional summary tailored to job description",
  "keywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "sections": {
    "objective": "Tailored professional objective for this job",
    "experience": ["Bullet point 1 with action verb", "Bullet point 2"],
    "skills": ["skill1", "skill2"],
    "education": "Formatted education line",
    "projects": ["Project bullet 1", "Project bullet 2"]
  },
  "tips": ["ATS tip 1", "ATS tip 2", "ATS tip 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let jsonResponse;
    try {
      const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
      if (!rawText) throw new Error("AI did not return a valid text response.");
      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/rolesense", async (req, res) => {
  try {
    const { skills, experience, interests } = req.body;

    if (!skills) {
      return res.status(400).json({ message: "Skills are required" });
    }

    const prompt = `You are an expert career counselor and job market analyst.

Candidate Profile:
- Skills: ${skills}
- Experience: ${experience || "Fresher"}
- Interests: ${interests || "Not specified"}

Analyze the profile and suggest the best matching job roles.
Your entire response must be valid JSON only. No markdown, no extra text.

{
  "summary": "Brief profile summary",
  "roles": [
    {
      "title": "Job Role Title",
      "matchScore": 92,
      "whySuited": "Why this person is suited for this role",
      "salaryRange": "8-15 LPA",
      "requiredSkills": ["skill1", "skill2"],
      "missingSkills": ["skill1", "skill2"],
      "topCompanies": ["Company1", "Company2", "Company3"],
      "growthPath": "Junior → Mid → Senior → Lead"
    }
  ],
  "topSkill": "Your strongest skill",
  "industryFit": ["Industry1", "Industry2"],
  "quickTip": "One actionable tip to improve employability"
}

Generate exactly 5 role suggestions ordered by match score descending.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let jsonResponse;
    try {
      const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
      if (!rawText) throw new Error("AI did not return a valid response.");
      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/ncat", async (req, res) => {
  try {
    const { category, difficulty } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const prompt = `You are an expert aptitude test creator for competitive exams like CAT, GATE, NCAT.

Generate exactly 10 multiple choice questions for:
- Category: ${category}
- Difficulty: ${difficulty || "Medium"}

Your entire response must be valid JSON only. No markdown, no extra text.

[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this answer is correct",
    "difficulty": "Easy/Medium/Hard"
  }
]

correct is 0-indexed (0=A, 1=B, 2=C, 3=D).`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let jsonResponse;
    try {
      const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
      if (!rawText) throw new Error("AI did not return a valid response.");
      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/skill-gap", async (req, res) => {
  try {
    const { userSkills, targetRole } = req.body;
    if (!userSkills || !targetRole) {
      return res.status(400).json({ message: "userSkills and targetRole are required" });
    }

    const prompt = `You are an expert career coach and skill assessor.

User's current skills: ${Array.isArray(userSkills) ? userSkills.join(", ") : userSkills}
Target job role: ${targetRole}

Analyze the skill gap and return ONLY valid JSON. No markdown, no extra text.

{
  "overallMatch": 72,
  "summary": "Brief summary of the candidate's readiness for this role",
  "matchedSkills": [
    { "skill": "React", "proficiencyNeeded": "Advanced", "userLevel": "Intermediate", "gap": "medium" }
  ],
  "missingSkills": [
    { "skill": "Docker", "importance": "high", "timeToLearn": "2-4 weeks", "resources": ["Docker docs", "Udemy Docker course"] }
  ],
  "roadmap": [
    { "week": "Week 1-2", "focus": "Skill to focus on", "action": "Specific action to take" }
  ],
  "estimatedReadyIn": "3 months",
  "topPriority": "The single most important skill to learn first"
}`;

    const response = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    let jsonResponse;
    try {
      const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
      if (!rawText) throw new Error("AI did not return a valid response.");
      jsonResponse = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }
    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/expert-speak", async (req, res) => {
  try {
    const { topic, expertType, duration } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = `You are a world-class ${expertType || "Senior Software Engineer"} with 15+ years of experience at top tech companies like Google, Meta, Amazon.

Give an expert talk/speech on the topic: "${topic}"
Duration: ${duration || "5 minutes"} talk

Your entire response must be valid JSON only. No markdown, no extra text outside JSON.

{
  "title": "Talk title",
  "expert": "${expertType || "Senior Software Engineer"}",
  "duration": "${duration || "5 minutes"}",
  "introduction": "Engaging opening paragraph of the talk",
  "keyPoints": [
    {
      "heading": "Key point heading",
      "content": "Detailed explanation of this point",
      "example": "Real world example or analogy"
    }
  ],
  "codeSnippet": "Optional relevant code example if applicable, else empty string",
  "industryInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "careerAdvice": "Personal career advice related to this topic",
  "conclusion": "Powerful closing message",
  "resources": ["Resource 1", "Resource 2", "Resource 3"]
}

Generate exactly 5 key points. Make it sound like a real expert speaking at a conference.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    let jsonResponse;
    try {
      const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
      if (!rawText) throw new Error("AI did not return a valid response.");
      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/learning-roadmap", async (req, res) => {
  try {
    const { skill, level } = req.body;
    if (!skill) return res.status(400).json({ message: "Skill is required" });
    const prompt = `You are an expert learning coach. Create a detailed learning roadmap for: ${skill}, current level: ${level || "Beginner"}.
Return ONLY valid JSON. No markdown.
{
  "skill": "${skill}",
  "totalDuration": "X months",
  "phases": [
    { "phase": "Phase 1", "title": "Foundations", "duration": "2 weeks", "topics": ["topic1", "topic2"], "resources": ["resource1"], "project": "Mini project idea" }
  ],
  "finalProject": "Capstone project idea",
  "careerOutcome": "What job you can get after this roadmap"
}
Generate exactly 4 phases.`;
    const response = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!rawText) throw new Error("No response");
    res.json(JSON.parse(rawText));
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

router.post("/coding-contest", async (req, res) => {
  try {
    const { difficulty, topic } = req.body;
    const prompt = `Generate 5 coding contest problems for difficulty: ${difficulty || "Medium"}, topic: ${topic || "Mixed"}.
Return ONLY valid JSON array. No markdown.
[{ "id": 1, "title": "Problem Title", "difficulty": "Easy/Medium/Hard", "description": "Problem statement", "inputFormat": "Input description", "outputFormat": "Output description", "examples": [{"input": "5", "output": "120", "explanation": "5! = 120"}], "constraints": "1 <= n <= 100", "hints": ["hint1"] }]`;
    const response = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
    const rawText = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!rawText) throw new Error("No response");
    res.json(JSON.parse(rawText));
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

export default router;
