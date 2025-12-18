require('dotenv').config({ path: '.env.local' });
(async () => {
  const { searchTMDB, extractBackdrop } = require("./tmdb");

  const res = await searchTMDB("The Last of Us", "tv");
  const thumb = extractBackdrop(res);

  console.log("Backdrop URL:", thumb);
})();