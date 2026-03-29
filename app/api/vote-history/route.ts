import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { jwtVerify } from "jose";

export async function GET(request: Request) {
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

    // --- Fetch User's Vote History ---
    const voteChoices = await sql`
      SELECT 
        uvc.trend_id,
        uvc.choice,
        uvc.created_at,
        t.category,
        t.option_a,
        t.option_b,
        t.votes_a,
        t.votes_b,
        t.active
      FROM user_vote_choices uvc
      JOIN trends t ON uvc.trend_id = t.id
      WHERE LOWER(uvc.user_identifier) = LOWER(${userEmail})
      ORDER BY uvc.created_at DESC
    `;

    return NextResponse.json({
      userEmail,
      votes: voteChoices.map((vote: any) => ({
        trendId: vote.trend_id,
        category: vote.category,
        choice: vote.choice,
        votedAt: vote.created_at,
        optionA: vote.option_a,
        optionB: vote.option_b,
        votesA: vote.votes_a,
        votesB: vote.votes_b,
        active: vote.active,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching vote history:", error);
    return NextResponse.json({ error: "Failed to fetch vote history" }, { status: 500 });
  }
}
