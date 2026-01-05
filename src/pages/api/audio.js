import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: 'No query' });

  // We pretend to be a real Android phone to bypass blocks
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
    'Accept': 'application/json'
  };

  try {
    // Ask Saavn for the song
    const saavnUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`;
    const response = await axios.get(saavnUrl, { headers: HEADERS });
    
    const data = response.data.data || response.data;

    if (data && data.results && data.results.length > 0) {
      // Grab the highest quality link
      const song = data.results[0];
      const audioUrl = song.downloadUrl[4]?.url || song.downloadUrl[song.downloadUrl.length - 1]?.url;
      
      return res.status(200).json({ url: audioUrl });
    } else {
      return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server failed to fetch audio' });
  }
}

