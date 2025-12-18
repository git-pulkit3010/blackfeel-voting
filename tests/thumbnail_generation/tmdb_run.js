require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');

(async () => {
  const { searchTMDB, extractBackdrop } = require("./tmdb");

  const query = "The Last of Us";
  const res = await searchTMDB(query, "tv");
  const thumbUrl = extractBackdrop(res);

  if (thumbUrl) {
    console.log("Backdrop URL:", thumbUrl);

    try {
      const response = await axios({
        url: thumbUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const fileExtension = path.extname(thumbUrl);
      const outputFileName = `${query.toLowerCase().replace(/ /g, '_')}${fileExtension}`;
      const outputPath = path.resolve(__dirname, outputFileName);
      
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Image downloaded to ${outputPath}`);

    } catch (error) {
      console.error("Error downloading image:", error);
    }

  } else {
    console.log("No backdrop found for the query.");
  }
})();