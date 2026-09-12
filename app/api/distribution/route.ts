import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        CASE
          WHEN match_score >= 80 THEN 'Excellent Match'
          WHEN match_score >= 60 THEN 'Good Match'
          WHEN match_score >= 40 THEN 'Moderate Match'
          ELSE 'Low Match'
        END AS match_level,
        COUNT(*) AS total
      FROM match_results
      WHERE match_score IS NOT NULL
      GROUP BY
        CASE
          WHEN match_score >= 80 THEN 'Excellent Match'
          WHEN match_score >= 60 THEN 'Good Match'
          WHEN match_score >= 40 THEN 'Moderate Match'
          ELSE 'Low Match'
        END
      ORDER BY total DESC
    `);

    return NextResponse.json({
      distribution: result.rows,
    });
  } catch (error) {
    console.error("Distribution Analytics API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch match distribution" },
      { status: 500 }
    );
  }
}