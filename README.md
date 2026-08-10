# Sayyarti (سيارتي)

Bilingual (Arabic / English) car diagnostics and trusted-garage directory for the UAE, KSA & Egypt. Built with React + Vite + Tailwind CSS.

## Run it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
```

This outputs a static site to the `dist/` folder — that folder is what you deploy.

## Deploy for free (pick one)

### Option A — Vercel (recommended, easiest)
1. Push this folder to a new GitHub repository
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub
3. Click **Add New → Project**, select the repo
4. Vercel auto-detects Vite — just click **Deploy**
5. You'll get a live URL like `sayyarti.vercel.app` in about a minute

### Option B — Netlify
1. Push this folder to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
3. Select the repo. Build command: `npm run build`. Publish directory: `dist`
4. Deploy — you'll get a URL like `sayyarti.netlify.app`

### Option C — Cloudflare Pages
Same idea as above: connect the GitHub repo, build command `npm run build`, output directory `dist`.

### Custom domain
All three platforms let you attach a custom domain (e.g. `sayyarti.com`) for free once you own the domain — just add it in the project's settings and update your domain's DNS records as instructed.

## Project structure

```
sayyarti-app/
├── index.html          # HTML entry point
├── src/
│   ├── main.jsx         # React root
│   ├── App.jsx          # The entire app (screens, data, translations)
│   └── index.css        # Tailwind + font imports
├── public/
│   └── favicon.svg
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## What's real vs. placeholder

- **Car issue content** (symptoms/causes/fix steps, EN + AR) is written content, reviewed for accuracy but not a substitute for a licensed mechanic.
- **"Watch fix video" buttons** open a live YouTube search for that issue rather than linking to a specific video, so nothing goes stale or dead.
- **Garage listings** are a starter set pulled from public directories/review sites — names and areas are real, but hours, phone numbers, and pricing should be verified (or replaced with a live Google Places API integration) before you rely on them in production.

## Turning this into an iOS/Android app

This is a responsive web app. To publish to the App Store / Google Play as a native app, the two common paths are:
1. **Wrap it** with a tool like Capacitor or a PWA-to-app service (fastest, keeps this exact codebase)
2. **Rebuild the UI** in React Native or Flutter (more work, but fully native feel)

Either way you'll need an Apple Developer Program membership ($99/yr) and a Google Play Console account ($25 one-time) to publish.
