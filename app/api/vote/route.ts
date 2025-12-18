import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { trendId, choice } = await request.json();

    if (!trendId || !choice || !["a", "b"].includes(choice)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get current trend to verify it exists
    const { data: trend, error: fetchError } = await supabase
      .from("trends")
      .select("*")
      .eq("id", trendId)
      .single();

    if (fetchError || !trend) {
      console.error("Trend fetch error:", fetchError);
      return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    }

    // Increment vote count
    const updatedVotes = {
      votes_a: choice === "a" ? trend.votes_a + 1 : trend.votes_a,
      votes_b: choice === "b" ? trend.votes_b + 1 : trend.votes_b,
    };

    // Update using the regular client (will work once RLS policy is updated)
    const { error: updateError } = await supabase
      .from("trends")
      .update(updatedVotes)
      .eq("id", trendId);

    if (updateError) {
      console.error("Update error details:", updateError);
      return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
    }

    // Now fetch the updated record
    const { data: updatedTrend, error: selectError } = await supabase
      .from("trends")
      .select("*")
      .eq("id", trendId)
      .single();

    if (selectError) {
      console.error("Select error details:", selectError);
      return NextResponse.json({ error: "Failed to retrieve updated trend" }, { status: 500 });
    }

    return NextResponse.json(updatedTrend);
  } catch (error: any) {
    console.error("Error recording vote:", error);

    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}