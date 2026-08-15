# Kali — Grade 2 Kannada (NPS Varthur)

A Duolingo-style web app for **non-native speakers** learning **CBSE Grade 2 Kannada** as taught at **National Public School, Varthur**.

NPS Bangalore schools use **Kali Kannada (Parichaya Bhashe)** Parts 1 & 2 — Kannada as a new language — not first-language Savi Kannada. This app follows that path: sound first, then script, then words, then classroom sentences.

## What children practise

- Greetings and polite talk (`ನಮಸ್ಕಾರ`, `ಧನ್ಯವಾದ`, respectful `ನೀವು`)
- ಸ್ವರಗಳು (vowels) and ವ್ಯಂಜನಗಳು (consonants)
- Kali Kannada-2 **akshara groups**
- Family, school, numbers, colours, animals, food, body, home
- Poem **themes** from Kali Kannada-2: morning prayer (ನಂದನಾಮ), our flag (ನಮ್ಮ ಬಾವುಟ), rain, rainbow, harvest
- Story values: kindness, sharing, greed
- Kagunita of `ಕ` and survival sentences for class

Textbook verses are **not copied**. Lines in Stories are original, simple Kannada with English and transliteration.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Progress is saved **in this browser only** (not on a server). The same site on the same device shares one family save. A private/incognito window is empty until you paste **Family → Copy family save**. Four profiles: **Riddhi**, **Siddhi**, **Sandeep**, and **Pragati**. Hearts and gems never run out. Sandeep and Pragati can jump to any lesson; Riddhi and Siddhi follow the path in order. Open the **Family** tab for a dashboard of everyone.

```bash
npm run build
npm run preview
```

## How to use with a Grade 2 child

1. Chrome or Android works best for **Kannada audio** (`kn-IN` voice).
2. Sit together for the first week. Tap the speaker on every new word.
3. Follow the green path in order. Hearts refill over time or with gems.
4. Use **Letters** as a varnamale chart and **Stories** as listening practice.

Built for parents and teachers supporting children who speak English (or another language) at home and meet Kannada at NPS Varthur.

## Deploy on Vercel

This is a Vite SPA. `vercel.json` sets the Vite framework, `dist` output, and SPA rewrites.

To create a **new Vercel project** from this repo:

1. Open [vercel.com/new](https://vercel.com/new) and import `sandeep-gutal/Kannada`.
2. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
3. Deploy.

Or from a machine logged into the Vercel CLI:

```bash
npx vercel login
npx vercel --yes --name kali-kannada --prod
```
