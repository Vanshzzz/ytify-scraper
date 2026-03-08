# 🎵 YTIFY: UNLOCKED

> A stealth, multi-engine music streaming web app that refuses to die.

Built with **Next.js**, deployed on **Vercel**. When Spotify locked their API and YouTube blocked scrapers, this app pivoted — again and again — until it worked.

-----

## 🚀 What It Does

Search any song and play it instantly. No account. No subscription.

- Searches music via **Apple iTunes API**
- Plays a **preview instantly** while fetching the full version in the background
- Seamlessly **swaps to full audio** when ready (user never notices the switch)
- Falls back across **multiple audio engines** if any source fails

-----

## ⚙️ How It Works (The Architecture)

The entire backend is a **self-healing, multi-engine proxy system** built as Next.js serverless functions. The browser never touches external APIs directly — all requests go through our server to bypass CORS and avoid detection.

### Audio Engine Priority

```
Engine 1: JioSaavn (High Quality)
  └── saavn.me → saavn.dev → jiosaavn private instance

Engine 2: YouTube via Piped (Rescue)
  └── pipedapi.kavin.rocks → api.piped.yt → piped-api.privacy.com.de

Engine 3: Apple iTunes (Preview fallback)
  └── Always available as last resort
```

If Engine 1 fails → Engine 2 kicks in automatically. If that fails → Apple preview plays. The user always hears something.

### API Routes

|File          |Purpose                                                                   |
|--------------|--------------------------------------------------------------------------|
|`search.js`   |Apple iTunes bridge — bypasses CORS by proxying through our server        |
|`audio.js`    |Dual-engine audio resolver — Saavn first, YouTube/Piped as rescue         |
|`stealth.js`  |Mobile device header masking — spoofs User-Agent + Referer to avoid blocks|
|`music.js`    |Direct Saavn search with browser header spoofing                          |
|`converter.js`|Hydra search — loops Piped + Invidious mirrors until one responds         |
|`stream.js`   |YouTube stream ID resolver via Piped proxy                                |

-----

## 🧠 Problems Solved

This project was built by hitting walls and engineering around them:

|Problem                                 |Solution                                               |
|----------------------------------------|-------------------------------------------------------|
|Spotify locked API access for small devs|Pivoted to Apple iTunes + JioSaavn                     |
|YouTube blocked direct scraping         |Used Piped (open source YouTube proxy)                 |
|Azure flagged server for scraping       |Moved to Vercel serverless functions                   |
|CORS blocking browser → API calls       |Built server-side proxy bridge                         |
|Audio feels slow to load                |Play preview instantly, swap to full version seamlessly|
|Single API source goes down             |Multi-instance fallback with silent failover           |
|APIs detect and block bots              |Stealth headers masquerading as real mobile devices    |

-----

## 🛠️ Tech Stack

- **Framework:** Next.js
- **Deployment:** Vercel (serverless)
- **Frontend:** React, Axios
- **Audio Sources:** JioSaavn API, YouTube via Piped, Apple iTunes
- **Architecture:** Multi-engine proxy with silent failover

-----

## 🏃 Running Locally

```bash
git clone <your-repo-url>
cd ytify-unlocked
npm install
npm run dev
```

Open <http://localhost:3000>

-----

## 📚 What I Learned

- How CORS works and why server-side proxying solves it
- How to build resilient systems with fallback chains
- How cloud providers detect and flag scraping behavior
- How to spoof request headers to mimic real devices
- Serverless function architecture on Vercel
- How to aggregate multiple third-party APIs into one clean interface
- UX trick: never make the user wait — play something immediately, upgrade it silently

-----

## ⚠️ Disclaimer

This project was built for educational purposes to learn about APIs, proxying, and web architecture. All audio sources used are publicly accessible APIs. Not intended for commercial use.

-----

*Built on an AMD A6 laptop and a 2021 Android phone running Termux. Constraints breed creativity.*
