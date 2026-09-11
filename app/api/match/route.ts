import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import pool from "@/lib/db";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { resume, jobDescription } = body;

    // Validate input
    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json(
        {
          error: "Resume and job description are required",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // 1. Gemini AI Analysis
    // =========================

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are an expert technical recruiter and resume analyzer.

Analyze the resume against the job description.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON.

Use exactly this structure:

{
  "matchScore": 85,
  "matchedSkills": ["Python", "SQL", "Pandas"],
  "missingSkills": ["Power BI"],
  "aiFeedback": "The candidate is a strong match for the position."
}

Rules:
- matchScore must be a number from 0 to 100.
- matchedSkills must be an array of strings.
- missingSkills must be an array of strings.
- aiFeedback must be a short string.
- Do not include markdown.
- Do not include code fences.
- Do not include any text outside the JSON object.
`,
    });

    // Get Gemini text
    const aiText = response.text || "";

    console.log("Gemini Raw Response:", aiText);

    // Convert Gemini JSON text into JavaScript object
    let aiResult;

    try {
      aiResult = JSON.parse(aiText);
    } catch (error) {
      console.error("Gemini JSON Parse Error:", error);

      return NextResponse.json(
        {
          error: "Gemini returned an invalid JSON response",
          rawResponse: aiText,
        },
        {
          status: 500,
        }
      );
    }

    // Validate AI result
    if (
      typeof aiResult.matchScore !== "number" ||
      !Array.isArray(aiResult.matchedSkills) ||
      !Array.isArray(aiResult.missingSkills) ||
      typeof aiResult.aiFeedback !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Gemini returned an invalid response structure",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // 2. Create / Find User
    // =========================

    const userResult = await pool.query(
      `
      INSERT INTO users (name, email)
      VALUES ($1, $2)
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, email
      `,
      ["Test User", "test@example.com"]
    );

    const user = userResult.rows[0];

    // =========================
    // 3. Save Resume
    // =========================

    const resumeResult = await pool.query(
      `
      INSERT INTO resumes (user_id, resume_text)
      VALUES ($1, $2)
      RETURNING id, user_id, resume_text
      `,
      [user.id, resume]
    );

    const savedResume = resumeResult.rows[0];

    // =========================
    // 4. Save AI Match Result
    // =========================

    const matchResult = await pool.query(
      `
      INSERT INTO match_results (
        user_id,
        resume_id,
        job_description,
        match_score,
        matched_skills,
        missing_skills,
        ai_feedback
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        user_id,
        resume_id,
        job_description,
        match_score,
        matched_skills,
        missing_skills,
        ai_feedback
      `,
      [
        user.id,
        savedResume.id,
        jobDescription,
        aiResult.matchScore,
        aiResult.matchedSkills.join(", "),
        aiResult.missingSkills.join(", "),
        aiResult.aiFeedback,
      ]
    );

    const savedMatch = matchResult.rows[0];

    // =========================
    // 5. Send Response
    // =========================

    return NextResponse.json({
      message: "Resume analysis completed successfully",

      aiAnalysis: {
        matchScore: aiResult.matchScore,
        matchedSkills: aiResult.matchedSkills,
        missingSkills: aiResult.missingSkills,
        aiFeedback: aiResult.aiFeedback,
      },

      user,

      resume: savedResume,

      match: savedMatch,
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: "AI or database operation failed",
      },
      {
        status: 500,
      }
    );
  }
}