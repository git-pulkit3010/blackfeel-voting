To implement a "one vote per user" restriction without a full authentication system, you need to track unique identifiers—specifically IP addresses on the server and `localStorage` on the client.

Here are the instructions and code blocks to provide to your CLI to execute the update:

### 1. Database Schema Update

First, create a table to store the association between a user and a trend to prevent duplicate votes at the database level.

```sql
-- Run this in your Supabase SQL Editor
CREATE TABLE user_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL, -- This will store a hash of the IP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trend_id, user_identifier)
);

CREATE INDEX idx_user_votes_identifier ON user_votes(user_identifier);

```

### 2. Backend API Update

Modify `app/api/vote/route.ts` to extract the client's IP, check for an existing record in the new table, and return a `403 Forbidden` status if a vote is already found.

**Key changes:**

* Import `headers` from `next/headers` to get the IP.
* Check the `user_votes` table before performing the atomic update on the `trends` table.
* Insert the record into `user_votes` as part of the logic.

```typescript
import { NextResponse } from "next/server";
import { sql, Trend } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { trendId, choice } = await request.json();
    const headerList = headers();
    
    // Get IP address (handling proxies like Vercel/Supabase)
    const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "anonymous";

    if (!trendId || !choice || !["a", "b"].includes(choice)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check for existing vote
    const existing = await sql`
      SELECT id FROM user_votes 
      WHERE trend_id = ${trendId} AND user_identifier = ${ip}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "Already voted" }, { status: 403 });
    }

    // Record the user's vote identifier
    await sql`
      INSERT INTO user_votes (trend_id, user_identifier)
      VALUES (${trendId}, ${ip})
    `;

    // Increment vote count atomically
    const updatedTrends = await sql`
      UPDATE trends 
      SET 
        votes_a = CASE WHEN ${choice} = 'a' THEN votes_a + 1 ELSE votes_a END,
        votes_b = CASE WHEN ${choice} = 'b' THEN votes_b + 1 ELSE votes_b END
      WHERE id = ${trendId}
      RETURNING *
    ` as Trend[];

    return NextResponse.json(updatedTrends[0]);
  } catch (error: any) {
    console.error("Error recording vote:", error);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}

```

### 3. Frontend Component Update

Update `components/MinimalistDuel.tsx` to handle the `403` response and use `localStorage` to disable voting for topics the user has already interacted with during their session.

**Key changes:**

* Add a `hasVotedLocally` check using `localStorage`.
* Update buttons to `disabled` if a vote exists in local storage.
* Persist the trend ID to local storage upon a successful vote.

```typescript
// Inside MinimalistDuel.tsx
const [votedTrends, setVotedTrends] = useState<string[]>([]);

useEffect(() => {
  // Load previous votes from storage on mount
  const saved = localStorage.getItem("blackfeel_votes");
  if (saved) setVotedTrends(JSON.parse(saved));
  fetchTrends();
}, []);

const handleVote = async (choice: "a" | "b") => {
  if (!currentTrend || voting || votedTrends.includes(currentTrend.id)) return;
  
  setVoting(true);
  try {
    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trendId: currentTrend.id, choice }),
    });

    if (response.status === 403) {
      alert("You have already voted on this topic.");
      return;
    }

    if (response.ok) {
      const updatedTrend = await response.json();
      
      // Update local storage and state
      const newVotes = [...votedTrends, currentTrend.id];
      setVotedTrends(newVotes);
      localStorage.setItem("blackfeel_votes", JSON.stringify(newVotes));
      
      setTrends((prev) => ({ ...prev, [currentCategory.id]: updatedTrend }));
      setTimeout(() => nextCategory(), 1500);
    }
  } catch (error) {
    console.error("Error voting:", error);
  } finally {
    setVoting(false);
  }
};

// In your JSX, update the button's disabled state:
// disabled={voting || votedTrends.includes(currentTrend.id)}

```

### Summary for Implementation

1. **Update SQL**: Adds a lookup table for identifiers to ensure database integrity.
2. **Update API**: Switches from anonymous voting to IP-restricted voting.
3. **Update UI**: Improves user experience by instantly disabling buttons for already-voted trends and preventing unnecessary API calls.