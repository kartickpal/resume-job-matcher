import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import pool from "@/lib/db";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  let client;

  try {
    client = await pool.connect();

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request. Please try again." },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const resume = typeof body.resume === "string" ? body.resume.trim() : "";
    const jobDescription =
      typeof body.jobDescription === "string"
        ? body.jobDescription.trim()
        : "";

    // -----------------------------
    // Input validation
    // -----------------------------

    if (!name || !email || !resume || !jobDescription) {
      return NextResponse.json(
        {
          error:
            "Name, email, resume, and job description are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (resume.length < 25) {
      return NextResponse.json(
        {
          error: "Resume must contain at least 25 characters.",
        },
        { status: 400 }
      );
    }

    if (jobDescription.length < 100) {
      return NextResponse.json(
        {
          error:
            "Job description must contain at least 100 characters.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Gemini AI analysis
    // -----------------------------

    const prompt = `You are an expert career analyst.

Compare the candidate resume with the job description and return ONLY valid JSON.

Resume:
${resume}

Job Description:
${jobDescription}

Return this exact JSON structure:
{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "skillGapExplanation": "",
  "recommendations": [],
  "aiFeedback": ""
}

Rules:
- matchScore must be a number from 0 to 100.
- matchedSkills, missingSkills, strengths, and recommendations must be arrays of strings.
- skillGapExplanation and aiFeedback must be strings.
- Do not include markdown or code fences.`;

    let response;

    try {
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
    } catch (error) {
      console.error("Gemini API Error:", error);

      return NextResponse.json(
        {
          error:
            "AI analysis is temporarily unavailable. Please try again.",
        },
        { status: 503 }
      );
    }

    const textResponse = response.text?.trim();

    if (!textResponse) {
      return NextResponse.json(
        {
          error:
            "The AI returned an empty response. Please try again.",
        },
        { status: 502 }
      );
    }

    let aiResult;

    try {
      const cleaned = textResponse
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      aiResult = JSON.parse(cleaned);
    } catch (error) {
      console.error("Gemini JSON Parsing Error:", error);

      return NextResponse.json(
        {
          error:
            "The AI returned an invalid analysis. Please try again.",
        },
        { status: 502 }
      );
    }

    // -----------------------------
    // Validate AI response
    // -----------------------------

    if (
      typeof aiResult.matchScore !== "number" ||
      aiResult.matchScore < 0 ||
      aiResult.matchScore > 100 ||
      !Array.isArray(aiResult.matchedSkills) ||
      !Array.isArray(aiResult.missingSkills) ||
      !Array.isArray(aiResult.strengths) ||
      typeof aiResult.skillGapExplanation !== "string" ||
      !Array.isArray(aiResult.recommendations) ||
      typeof aiResult.aiFeedback !== "string"
    ) {
      console.error("Invalid Gemini analysis structure:", aiResult);

      return NextResponse.json(
        {
          error:
            "The AI returned incomplete analysis data. Please try again.",
        },
        { status: 502 }
      );
    }

    // -----------------------------
    // PostgreSQL transaction
    // -----------------------------

    try {
      await client.query("BEGIN");

      // Save or update user
      const userResult = await client.query(
        `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        ON CONFLICT (email)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id, name, email
        `,
        [name, email]
      );

      const user = userResult.rows[0];

      // Save resume
      const resumeResult = await client.query(
        `
        INSERT INTO resumes (user_id, resume_text)
        VALUES ($1, $2)
        RETURNING id, user_id, resume_text
        `,
        [user.id, resume]
      );

      const savedResume = resumeResult.rows[0];

      // Save match result
      const matchResult = await client.query(
        `
        INSERT INTO match_results (
          user_id,
          resume_id,
          job_description,
          match_score,
          matched_skills,
          missing_skills,
          strengths,
          skill_gap_explanation,
          recommendations,
          ai_feedback
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING
          id,
          user_id,
          resume_id,
          job_description,
          match_score,
          matched_skills,
          missing_skills,
          strengths,
          skill_gap_explanation,
          recommendations,
          ai_feedback
        `,
        [
          user.id,
          savedResume.id,
          jobDescription,
          aiResult.matchScore,
          aiResult.matchedSkills.join(", "),
          aiResult.missingSkills.join(", "),
          aiResult.strengths.join(", "),
          aiResult.skillGapExplanation,
          aiResult.recommendations.join(", "),
          aiResult.aiFeedback,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        message: "Resume analyzed successfully.",
        aiAnalysis: aiResult,
        user,
        resume: savedResume,
        match: matchResult.rows[0],
      });
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback Error:", rollbackError);
      }

      console.error("Database Error:", error);

      return NextResponse.json(
        {
          error:
            "We couldn't save your analysis. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected Match API Error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while analyzing your resume. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}