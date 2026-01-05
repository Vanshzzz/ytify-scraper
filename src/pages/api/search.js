import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  try {
    // The Server asks Apple (No CORS issues here)
    const response = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Apple API failed' });
  }
}

