const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY; // set this in your env
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w780"; // change size if needed

// Search movie or TV show
async function searchTMDB(query, type = "multi") {
  const res = await axios.get(`${BASE_URL}/search/${type}`, {
    params: {
      api_key: TMDB_API_KEY,
      query
    }
  });
  return res.data;
}

// Get backdrop image URL (first hit)
function extractBackdrop(result) {
  if (!result || !result.results || !result.results.length) return null;
  const item = result.results[0];
  if (!item.backdrop_path) return null;
  return `${IMAGE_BASE}${item.backdrop_path}`;
}

module.exports = { searchTMDB, extractBackdrop };