import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  try {
    // We pretend to be a real browser to avoid getting blocked
    const response = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Server API Error:", error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

