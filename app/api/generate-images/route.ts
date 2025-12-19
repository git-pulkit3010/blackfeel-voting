// app/api/generate-images/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateImage } from '@/lib/imageGenerator';

export async function GET() {
  try {
    const { data: trends, error } = await supabaseAdmin
      .from('trends')
      .select('*')
      .in('category', ['movies', 'tv-shows'])
      .or('option_a_image_url.is.null,option_b_image_url.is.null');

    if (error) throw error;

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
      
      const { error: updateError } = await supabaseAdmin
        .from('trends')
        .update({ option_a_image_url, option_b_image_url })
        .eq('id', trend.id);

      if (updateError) {
        console.error(`Failed to update trend ${trend.id}:`, updateError);
      }
    }

    return NextResponse.json({ message: 'Image generation complete.' });

  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}
