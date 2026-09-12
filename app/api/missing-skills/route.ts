import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        TRIM(skill) AS skill,
        COUNT(*) AS frequency
      FROM match_results,
      LATERAL unnest(string_to_array(missing_skills, ',')) AS skill
      WHERE missing_skills IS NOT NULL
        AND TRIM(skill) <> ''
      GROUP BY TRIM(skill)
      ORDER BY frequency DESC
      LIMIT 10
    `);

    return NextResponse.json({
      skills: result.rows,
    });
  } catch (error) {
    console.error("Missing Skills Analytics API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch missing skill analytics" },
      { status: 500 }
    );
  }
}