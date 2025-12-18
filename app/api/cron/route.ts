import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { callOpenRouter } from "@/lib/openrouter";

const CATEGORIES = ["tv-shows", "movies", "cricket", "anime", "music"];

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting monthly trend research...");

    // Deactivate all current active trends
    await supabaseAdmin
      .from("trends")
      .update({ active: false })
      .eq("active", true);

    // Fetch history vault (past 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data: history, error: historyError } = await supabaseAdmin
      .from("design_history")
      .select("category, design_text")
      .gte("created_at", twelveMonthsAgo.toISOString());

    if (historyError) {
      console.error("Error fetching history:", historyError);
    }

    // Group history by category
    const historyByCategory: Record<string, string[]> = {};
    history?.forEach((item) => {
      if (!historyByCategory[item.category]) {
        historyByCategory[item.category] = [];
      }
      historyByCategory[item.category].push(item.design_text);
    });

    // Generate trends for each category
    for (const category of CATEGORIES) {
      try {
        const categoryName = category.replace("-", " ");
        const pastDesigns = historyByCategory[category] || [];

        const prompt = `You are researching trending topics for t-shirt designs in the ${categoryName} category.

IMPORTANT: Avoid these past designs (do not repeat):
${pastDesigns.length > 0 ? pastDesigns.join("\n") : "None"}

Task: Identify the top 2 trending subcategories or themes in ${categoryName} right now (December 2025).

Requirements:
- Each should be SHORT (2-4 words max)
- They should be DIFFERENT from each other
- They should be currently trending/popular
- They should work well as t-shirt design themes

Format your response EXACTLY as:
OPTION_A: [short design text]
OPTION_B: [short design text]

Example format:
OPTION_A: Stranger Things Nostalgia
OPTION_B: Wednesday Addams Style`;

        console.log(`Researching trends for ${category}...`);
        const aiResponse = await callOpenRouter(prompt);

        // Parse AI response
        const optionAMatch = aiResponse.match(/OPTION_A:\s*(.+)/);
        const optionBMatch = aiResponse.match(/OPTION_B:\s*(.+)/);

        if (!optionAMatch || !optionBMatch) {
          console.error(`Failed to parse AI response for ${category}`);
          continue;
        }

        const optionA = optionAMatch[1].trim();
        const optionB = optionBMatch[1].trim();

        // Insert new trend
        const { error: insertError } = await supabaseAdmin
          .from("trends")
          .insert({
            category,
            option_a: optionA,
            option_b: optionB,
            votes_a: 0,
            votes_b: 0,
            active: true,
          });

        if (insertError) {
          console.error(`Error inserting trend for ${category}:`, insertError);
          continue;
        }

        // Add to design history
        await supabaseAdmin.from("design_history").insert([
          { category, design_text: optionA },
          { category, design_text: optionB },
        ]);

        console.log(`✓ Created trends for ${category}: "${optionA}" vs "${optionB}"`);
      } catch (error) {
        console.error(`Error processing ${category}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Monthly trends updated successfully" 
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to update trends" },
      { status: 500 }
    );
  }
}