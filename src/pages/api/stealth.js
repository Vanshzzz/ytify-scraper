import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: 'No query' });

  // 1. The Databases to try
  const SERVERS = [
    'https://saavn.dev/api/search/songs',
    'https://saavn.me/search/songs',
    'https://jiosaavn-api-private-cv76.onrender.com/search/songs'
  ];

  // 2. The "Mask" (Headers that make us look like a real phone)
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/'
  };

  // 3. Loop through servers until one answers
  for (const server of SERVERS) {
    try {
      console.log(`Stealth accessing: ${server}...`);
      
      const response = await axios.get(server, { 
        params: { query: query },
        headers: HEADERS,
        timeout: 4000 // Don't wait too long
      });

      const data = response.data.data || response.data; // Handle different formats

      if (data && (data.results || data.length > 0)) {
        // We found it! Send back to frontend.
        return res.status(200).json(data);
      }
    } catch (error) {
      console.log(`Failed ${server}: ${error.message}`);
      // Silently try the next one
    }
  }

  return res.status(500).json({ error: 'All stealth attempts failed.' });
}

