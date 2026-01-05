import axios from 'axios';

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: 'No query' });

  // --- ENGINE 1: SAAVN (High Quality) ---
  const SAAVN_SERVERS = [
    'https://saavn.me/search/songs',
    'https://saavn.dev/api/search/songs',
    'https://jiosaavn-api-private-cv76.onrender.com/search/songs'
  ];

  for (const server of SAAVN_SERVERS) {
    try {
      console.log(`Engine 1 (Saavn): Trying ${server}...`);
      const response = await axios.get(server, { 
        params: { query: query },
        timeout: 3000 // Quick timeout so we can switch engines fast
      });

      const data = response.data.data || response.data;
      const results = data.results || data;

      if (results && results.length > 0) {
        const song = results[0];
        // Robust link finder
        const downloads = song.downloadUrl || song.download_links;
        let audioUrl = Array.isArray(downloads) ? (downloads[4]?.url || downloads[downloads.length - 1]?.url) : downloads;
        
        if (audioUrl) return res.status(200).json({ url: audioUrl, source: 'Saavn' });
      }
    } catch (e) {
      // Ignore and try next server
    }
  }

  // --- ENGINE 2: YOUTUBE/PIPED (The Rescue) ---
  // If Saavn failed, we ask Piped for the YouTube audio stream
  const PIPED_SERVERS = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.yt',
    'https://piped-api.privacy.com.de'
  ];

  for (const pipedApi of PIPED_SERVERS) {
    try {
      console.log(`Engine 2 (YouTube): Trying ${pipedApi}...`);
      
      // 1. Search for the video
      const searchRes = await axios.get(`${pipedApi}/search`, {
        params: { q: query, filter: 'music_songs' },
        timeout: 4000
      });

      if (searchRes.data.items && searchRes.data.items.length > 0) {
        const videoId = searchRes.data.items[0].url.split('=')[1];

        // 2. Get the audio stream link
        const streamRes = await axios.get(`${pipedApi}/streams/${videoId}`, { timeout: 4000 });
        const audioStreams = streamRes.data.audioStreams;

        if (audioStreams && audioStreams.length > 0) {
          // Get the best audio quality (usually the largest file size or highest bitrate)
          // We sort to find the best .m4a stream
          const bestStream = audioStreams.find(s => s.format === 'M4A') || audioStreams[0];
          
          return res.status(200).json({ url: bestStream.url, source: 'YouTube' });
        }
      }
    } catch (e) {
      console.log(`Piped ${pipedApi} failed.`);
    }
  }

  // If BOTH Engines fail
  return res.status(500).json({ error: 'All engines failed' });
}

