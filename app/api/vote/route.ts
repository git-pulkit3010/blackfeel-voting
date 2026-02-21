import { NextResponse } from "next/server";
import { sql, Trend } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { trendId, choice } = await request.json();

    if (!trendId || !choice || !["a", "b"].includes(choice)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get current trend to verify it exists
    const trends = await sql`
      SELECT * FROM trends 
      WHERE id = ${trendId}
    ` as Trend[];

    const trend = trends[0];

    if (!trend) {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    }

    // Increment vote count using atomic update
    const updatedTrends = await sql`
      UPDATE trends 
      SET 
        votes_a = CASE WHEN ${choice} = 'a' THEN votes_a + 1 ELSE votes_a END,
        votes_b = CASE WHEN ${choice} = 'b' THEN votes_b + 1 ELSE votes_b END
      WHERE id = ${trendId}
      RETURNING *
    ` as Trend[];

    const updatedTrend = updatedTrends[0];

    return NextResponse.json(updatedTrend);
  } catch (error: any) {
    console.error("Error recording vote:", error);

    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}