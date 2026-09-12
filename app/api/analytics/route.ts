import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_analyses,
        ROUND(AVG(match_score), 2) AS average_score,
        MAX(match_score) AS highest_score,
        MIN(match_score) AS lowest_score
      FROM match_results
      WHERE match_score IS NOT NULL
    `);

    return NextResponse.json({
      analytics: result.rows[0],
    });
  } catch (error) {
    console.error("Analytics API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}