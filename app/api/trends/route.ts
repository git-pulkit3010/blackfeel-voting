import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch active trends for all categories
    const { data: trends, error } = await supabaseAdmin
      .from("trends")
      .select("id, category, option_a, option_b, votes_a, votes_b, created_at, active, option_a_image_url, option_b_image_url")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Organize trends by category
    const trendsByCategory: Record<string, any> = {};

    trends?.forEach((trend) => {
      if (!trendsByCategory[trend.category]) {
        trendsByCategory[trend.category] = trend;
      }
    });

    return NextResponse.json(trendsByCategory);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}