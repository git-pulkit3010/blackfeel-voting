import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Cron job is temporarily disabled as per user request.
  // The LLM call to generate trends is not needed at the moment.
  return NextResponse.json({ 
    success: true, 
    message: "Cron job is temporarily disabled." 
  });
}
