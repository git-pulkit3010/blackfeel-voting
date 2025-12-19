// lib/imageGenerator.ts
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w780";

async function searchTMDB(query: string, type: "multi" | "tv" | "movie") {
  const res = await axios.get(`${BASE_URL}/search/${type}`, {
    params: {
      api_key: TMDB_API_KEY,
      query,
    },
  });
  return res.data;
}

function extractBackdrop(result: any): string | null {
  if (!result || !result.results || !result.results.length) return null;
  const item = result.results[0];
  if (!item.backdrop_path) return null;
  return `${IMAGE_BASE}${item.backdrop_path}`;
}

export async function generateImage(query: string, type: 'movie' | 'tv'): Promise<string | null> {
  const searchResult = await searchTMDB(query, type);
  const backdropUrl = extractBackdrop(searchResult);

  if (backdropUrl) {
    try {
      const response = await axios({
        url: backdropUrl,
        method: 'GET',
        responseType: 'stream',
      });

      const fileExtension = path.extname(backdropUrl);
      const outputFileName = `${query.toLowerCase().replace(/ /g, '_')}${fileExtension}`;
      const outputPath = path.resolve(process.cwd(), 'public', outputFileName);

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      console.log(`Image downloaded to ${outputPath}`);
      return `/${outputFileName}`; // Return the public path
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  } else {
    console.log("No backdrop found for the query.");
    return null;
  }
}
