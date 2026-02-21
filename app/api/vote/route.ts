import { NextResponse } from "next/server";
import { sql, Trend } from "@/lib/db";
import { headers } from "next/headers";
import { createHash } from "crypto";

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

    // Compute global options hash from ALL active trends
    const allTrends = await sql`
      SELECT option_a, option_b FROM trends WHERE active = true ORDER BY category
    ` as Trend[];

    const globalOptionsString = allTrends.map(t => `${t.option_a}|${t.option_b}`).join('::');
    const globalHash = createHash('md5').update(globalOptionsString).digest('hex');

    // Check for existing vote from this user
    const existingVotes = await sql`
      SELECT options_hash FROM user_votes
      WHERE user_identifier = ${ip}
    `;

    // If user has voted before, check if global options have changed
    if (existingVotes.length > 0) {
      const storedHash = existingVotes[0].options_hash;

      // If global options haven't changed, reject the vote
      if (storedHash === globalHash) {
        return NextResponse.json({ error: "Already voted" }, { status: 403 });
      }

      // Global options have changed, update the existing vote record
      await sql`
        UPDATE user_votes
        SET options_hash = ${globalHash}, updated_at = NOW()
        WHERE user_identifier = ${ip}
      `;
    } else {
      // First time voting, insert new record
      await sql`
        INSERT INTO user_votes (user_identifier, options_hash)
        VALUES (${ip}, ${globalHash})
      `;
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