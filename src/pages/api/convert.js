import axios from 'axios';

// The Hydra Heads (List of APIs to try)
const INSTANCES = [
  'https://kavin.rocks',             // Piped (Fastest)
  'https://api.piped.yt',            // Piped Official
  'https://vid.puffyan.us',          // Invidious Mirror 1
  'https://invidious.jing.rocks'     // Invidious Mirror 2
];

export default async function handler(req, res) {
  const { playlistUrl } = req.body; // User's search query

  if (!playlistUrl) {
    return res.status(200).json({ success: false, tracks: [] });
  }

  const query = encodeURIComponent(playlistUrl);
  let tracks = [];

  // LOOP THROUGH THE HEADS
  for (const instance of INSTANCES) {
    try {
      console.log(`Trying source: ${instance}...`);
      
      let apiUrl;
      if (instance.includes('piped')) {
        apiUrl = `${instance}/search?q=${query}&filter=music_songs`;
      } else {
        // Invidious API format is slightly different
        apiUrl = `${instance}/api/v1/search?q=${query}&type=video`;
      }

      // Try to fetch with a timeout so we don't wait forever
      const response = await axios.get(apiUrl, { timeout: 4000 });
      
      // If we got data, format it!
      if (response.data && (response.data.items || response.data.length > 0)) {
        
        const rawItems = response.data.items || response.data; // Piped uses .items, Invidious returns array
        
        tracks = rawItems.slice(0, 15).map(item => ({
          title: item.title,
          artist: item.uploaderName || item.author, // Piped vs Invidious naming
          image: `https://i.ytimg.com/vi/${item.url ? item.url.split('=')[1] : item.videoId}/mqdefault.jpg`,
          id: item.url ? item.url.split('=')[1] : item.videoId
        }));

        console.log(`Success with ${instance}!`);
        return res.status(200).json({ success: true, tracks }); // EXIT LOOP
      }

    } catch (error) {
      console.log(`Source ${instance} failed. Switching...`);
      // Continue to next instance
    }
  }

  // If all failed
  res.status(200).json({ success: false, tracks: [] });
}


