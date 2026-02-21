import { NextResponse } from "next/server";
import { sql, Trend } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { trendId, choice } = await request.json();
    const headerList = headers();

    // Get IP address (handling proxies like Vercel/Neon)
    const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "anonymous";

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

    // Check for existing vote from this user
    const existing = await sql`
      SELECT id FROM user_votes
      WHERE trend_id = ${trendId} AND user_identifier = ${ip}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already voted" }, { status: 403 });
    }

    // Record the user's vote
    await sql`
      INSERT INTO user_votes (trend_id, user_identifier)
      VALUES (${trendId}, ${ip})
    `;

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