import { NextResponse } from "next/server";
import { sql, Trend } from "@/lib/db";
import { createHash } from "crypto";
import { jwtVerify } from "jose";

export async function POST(request: Request) {
  try {
    // --- Auth Check ---
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const accessToken = cookies['access_token'];
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let userEmail: string;
    try {
      const secretKey = process.env.AUTH_SECRET_KEY || 'your_access_token_secret_here';
      const secret = new TextEncoder().encode(secretKey);
      const { payload } = await jwtVerify(accessToken, secret, {
        algorithms: ['HS256'],
      });
      userEmail = payload.email as string;
      if (!userEmail) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // --- Vote Logic ---
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

    // Compute global options hash from ALL active trends
    const allTrends = await sql`
      SELECT option_a, option_b FROM trends WHERE active = true ORDER BY category
    ` as Trend[];

    const globalOptionsString = allTrends.map(t => `${t.option_a}|${t.option_b}`).join('::');
    const globalHash = createHash('md5').update(globalOptionsString).digest('hex');

    // Use authenticated user email as identifier
    const userIdentifier = userEmail;

    // Check for existing vote from this user
    const existingVotes = await sql`
      SELECT options_hash FROM user_votes
      WHERE user_identifier = ${userIdentifier}
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
        SET
          options_hash = ${globalHash},
          updated_at = NOW()
        WHERE user_identifier = ${userIdentifier}
      `;
    } else {
      // First time voting, insert new record
      await sql`
        INSERT INTO user_votes (user_identifier, options_hash)
        VALUES (${userIdentifier}, ${globalHash})
      `;
    }

    // Record the individual vote choice
    const existingVoteChoice = await sql`
      SELECT choice FROM user_vote_choices
      WHERE user_identifier = ${userIdentifier} AND trend_id = ${trendId}
    `;

    if (existingVoteChoice.length > 0) {
      // Update existing vote choice
      await sql`
        UPDATE user_vote_choices
        SET
          choice = ${choice},
          updated_at = NOW()
        WHERE user_identifier = ${userIdentifier} AND trend_id = ${trendId}
      `;
    } else {
      // Insert new vote choice
      await sql`
        INSERT INTO user_vote_choices (user_identifier, trend_id, choice)
        VALUES (${userIdentifier}, ${trendId}, ${choice})
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