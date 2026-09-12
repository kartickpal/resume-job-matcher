import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        mr.id,
        mr.match_score,
        mr.matched_skills,
        mr.missing_skills,
        mr.strengths,
        mr.skill_gap_explanation,
        mr.recommendations,
        mr.ai_feedback,
        mr.created_at,
        r.resume_text,
        u.name,
        u.email
      FROM match_results mr
      JOIN resumes r
        ON mr.resume_id = r.id
      JOIN users u
        ON mr.user_id = u.id
      WHERE u.email = $1
      ORDER BY mr.created_at DESC
      LIMIT 10
      `,
      [email.trim()]
    );

    return NextResponse.json({
      history: result.rows,
    });
  } catch (error) {
    console.error("History API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch match history" },
      { status: 500 }
    );
  }
}