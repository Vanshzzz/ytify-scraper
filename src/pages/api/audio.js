import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: 'No query' });

  // THE HYDRA: List of databases to try in order
  const SERVERS = [
    'https://saavn.me/search/songs',          // Mirror 1 (Often less strict)
    'https://saavn.dev/api/search/songs',     // Original (Strict)
    'https://jiosaavn-api-private-cv76.onrender.com/search/songs' // Mirror 2
  ];

  // Headers to look like a real browser
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  // LOOP through the servers
  for (const server of SERVERS) {
    try {
      console.log(`Trying server: ${server}...`);
      
      const response = await axios.get(server, { 
        params: { query: query },
        headers: HEADERS,
        timeout: 4000 // Give up after 4 seconds
      });

      const data = response.data.data || response.data;
      const results = data.results || data; // Handle different API structures

      if (results && results.length > 0) {
        const song = results[0];
        
        // ROBUST LINK FINDER
        // Different APIs store the link in different places (downloadUrl vs download_links)
        // And use different keys (url vs link)
        let audioUrl = null;

        const downloads = song.downloadUrl || song.download_links;
        
        if (Array.isArray(downloads)) {
          // Try to get the highest quality (last item or index 4)
          const best = downloads[4] || downloads[downloads.length - 1];
          audioUrl = best.url || best.link; 
        } else {
          audioUrl = downloads; // Sometimes it's just a string
        }

        if (audioUrl) {
          return res.status(200).json({ url: audioUrl, source: server });
        }
      }
    } catch (error) {
      console.log(`Server ${server} failed. Switching...`);
      // Continue to next server in list
    }
  }

  // If all failed
  return res.status(500).json({ error: 'All vaults locked' });
}

