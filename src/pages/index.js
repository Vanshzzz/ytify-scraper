import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSearch = async () => {
    if (!query) return alert('Type a song name!');
    setLoading(true);
    setStatus('Asking Vercel Server...');
    
    try {
      // FIX: We call OUR server (/api/search), not Apple directly.
      const res = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      
      if (res.data.results && res.data.results.length > 0) {
        const cleanTracks = res.data.results.map(item => ({
          title: item.trackName,
          artist: item.artistName,
          image: item.artworkUrl100.replace('100x100', '400x400'),
          previewUrl: item.previewUrl, 
          saavnQuery: `${item.trackName} ${item.artistName}`
        }));
        setTracks(cleanTracks);
        setStatus('');
      } else {
        setStatus('No songs found.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Server Error. Try again.');
    }
    setLoading(false);
  };

  const playSong = async (track) => {
    // Start with the Safe Preview immediately
    setCurrentSong({ url: track.previewUrl, type: 'Preview Mode (30s)' });
    setStatus('Playing Preview (Safe Mode)');

    // Then try to upgrade to full version in the background
    try {
        const saavnApi = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(track.saavnQuery)}`;
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(saavnApi)}`;
        
        const res = await axios.get(proxyUrl);
        const data = res.data.data || res.data;

        if (data && data.results && data.results.length > 0) {
          const fullAudio = data.results[0].downloadUrl[4]?.url || data.results[0].downloadUrl[data.results[0].downloadUrl.length - 1]?.url;
          // Upgrade the player
          setCurrentSong({ url: fullAudio, type: 'Full Version 🟢' });
          setStatus('Upgraded to Full Version 🟢');
        }
    } catch (e) {
        console.log("Full version blocked. Staying on preview.");
    }
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1DB954', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        YTIFY: DEPLOYED
      </h1>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Starboy..."
            style={{ flex: 1, padding: '15px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }}
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: '15px 25px', backgroundColor: '#1DB954', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
          >
            {loading ? '...' : 'SEARCH'}
          </button>
        </div>

        {status && <div style={{ textAlign: 'center', color: '#aaa', marginBottom: '15px', fontSize: '14px' }}>{status}</div>}

        {currentSong && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#111', padding: '20px', borderTop: '2px solid #1DB954' }}>
            <div style={{ textAlign: 'center', marginBottom: '5px', color: currentSong.type.includes('Full') ? '#1DB954' : '#f1c40f', fontSize: '12px' }}>
              NOW PLAYING: {currentSong.type}
            </div>
            <audio controls autoPlay src={currentSong.url} style={{ width: '100%', height: '40px' }} />
          </div>
        )}

        <div style={{ paddingBottom: '120px' }}>
          {tracks.map((t, i) => (
            <div key={i} onClick={() => playSong(t)} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #222', padding: '15px 0', cursor: 'pointer', opacity: 0.9 }}>
              <img src={t.image} style={{ width: 60, height: 60, marginRight: 20, borderRadius: '4px' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{t.title}</div>
                <div style={{ fontSize: '14px', color: '#888' }}>{t.artist}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '24px', color: '#1DB954' }}>▶</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

