// app/api/generate-images/route.ts
import { NextResponse } from 'next/server';
import { sql, Trend } from '@/lib/db';
import { generateImage } from '@/lib/imageGenerator';

export async function GET() {
  try {
    const trends = await sql`
      SELECT * FROM trends
      WHERE category IN ('movies', 'tv-shows')
      AND (option_a_image_url IS NULL OR option_b_image_url IS NULL)
    ` as Trend[];

    if (!trends || trends.length === 0) {
      return NextResponse.json({ message: 'No trends to update.' });
    }

    for (const trend of trends) {
      let option_a_image_url = trend.option_a_image_url;
      let option_b_image_url = trend.option_b_image_url;

      if (!option_a_image_url) {
        option_a_image_url = await generateImage(trend.option_a, trend.category === 'tv-shows' ? 'tv' : 'movie');
      }

      if (!option_b_image_url) {
        option_b_image_url = await generateImage(trend.option_b, trend.category === 'tv-shows' ? 'tv' : 'movie');
      }
      
      await sql`
        UPDATE trends
        SET option_a_image_url = ${option_a_image_url}, option_b_image_url = ${option_b_image_url}
        WHERE id = ${trend.id}
      `;
    }

    return NextResponse.json({ message: 'Image generation complete.' });

  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}