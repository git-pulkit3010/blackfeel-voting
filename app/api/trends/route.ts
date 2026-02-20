import { NextResponse } from "next/server";
import { sql, Trend } from "@/lib/db";

// Disable caching for this route
export const revalidate = 0; // Disable static generation and force dynamic rendering

export async function GET() {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Fetching trends (attempt ${attempts})...`);
      
      // Fetch active trends for all categories
      const trends = await sql`
        SELECT id, category, option_a, option_b, votes_a, votes_b, created_at, active, option_a_image_url, option_b_image_url
        FROM trends
        WHERE active = true
        ORDER BY created_at DESC
      ` as Trend[];

      // Organize trends by category - only get the most recent one per category
      const trendsByCategory: Record<string, Trend> = {};

      trends.forEach((trend) => {
        if (!trendsByCategory[trend.category]) {
          trendsByCategory[trend.category] = trend;
        }
      });

      // Return JSON with no-cache headers to prevent caching
      return NextResponse.json(trendsByCategory, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    } catch (error: any) {
      console.error(`Attempt ${attempts} failed:`, error.message);
      
      if (attempts >= maxAttempts) {
        console.error("Final error fetching trends:", error);
        return NextResponse.json({ 
          error: "Failed to fetch trends",
          details: error.message,
          cause: error.cause?.message || error.cause
        }, { 
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }
      
      // Wait a bit before retrying (1s, 2s)
      await new Promise(resolve => setTimeout(resolve, attempts * 1000));
    }
  }
}