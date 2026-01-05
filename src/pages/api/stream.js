import axios from 'axios';

export default async function handler(req, res) {
  const { title, artist } = req.body;

  try {
    // 1. Search Piped (YouTube Proxy)
    // We encode the query to handle symbols like "&" safely
    const query = encodeURIComponent(`${title} ${artist} audio`);
    const searchRes = await axios.get(`https://pipedapi.kavin.rocks/search?q=${query}&filter=music_songs`);
    
    // 2. Get the first result
    // (We are skipping the complex fuzzy match for now to keep it simple and working)
    const videoId = searchRes.data.items[0].url.split('=')[1];

    res.status(200).json({ success: true, streamId: videoId });

  } catch (error) {
    res.status(200).json({ success: false, streamId: null });
  }
}
