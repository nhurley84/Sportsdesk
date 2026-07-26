# SportsDesk Pro - Client Handover and Maintenance Manual

This document provides complete instructions for setting up, managing, customizing, and deploying the SportsDesk Pro web application. It is written for developers and site managers who need to maintain or update the project after handover.

---

## Table of Contents
1. Project Overview
2. Core Features
3. Technology Stack
4. Project Folder Structure
5. Local Setup and Installation
6. Maintenance and Customization Guide
   - Adding or Editing Podcasts
   - Updating News RSS Sources
   - Managing Teams and Sports Categories
   - Theme and Style Customization
7. Vercel Deployment Instructions
8. Pre-Flight Check and Build Validation

---

## 1. Project Overview

SportsDesk Pro is a web application that aggregates live sports content across multiple leagues, including AFL, NRL, Cricket, Soccer (A-League), Rugby Union, Basketball (NBA), NFL, and Motorsport. 

The application fetches data directly from live RSS feeds, external API endpoints, and media sources, presenting them in a clean, modern user interface.

---

## 2. Core Features

- Live RSS News Feed: Automatically fetches and parses sports articles from major publishers.
- Dedicated Podcast Hub: Displays primary podcast show titles, release dates, episode durations, and includes an inline audio player bar.
- Video Highlights Engine: Integrated YouTube video card layout with built-in modal player.
- Real-Time Score Ticker: Live ticker bar for active match updates.
- User Customization: Allows users to follow specific teams, saving preferences locally in their browser.
- Bookmarks: Enables visitors to save and filter favorite articles.

---

## 3. Technology Stack

- Framework: Next.js (App Router, React 19)
- Language: TypeScript
- Styling: Custom Vanilla CSS (located in `src/app/globals.css`)
- RSS Engine: `rss-parser` package
- Host / Deployment Platform: Vercel

---

## 4. Project Folder Structure

```text
sports-website/
├── src/
│   ├── app/
│   │   ├── api/             # Backend API routes for feeds, podcasts, videos, and match updates
│   │   ├── favicon.ico
│   │   ├── globals.css      # Main CSS design system and variables
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Main page dashboard component
│   ├── data/
│   │   ├── sources.json     # Configuration file for podcast and news RSS feeds
│   │   └── teams.ts         # List of teams, sports mappings, and color accents
│   └── lib/
│       ├── podcasts.ts      # Podcast feed fetching and parsing logic
│       ├── rss.ts           # News RSS fetching logic
│       └── youtube.ts       # Video highlights parser logic
├── public/                  # Static assets and images
├── package.json             # NPM package dependencies and scripts
├── tsconfig.json            # TypeScript configuration file
└── CLIENT_DOCUMENTATION.md  # Client handover manual
```

---

## 5. Local Setup and Installation

Follow these steps to run the application locally on your machine:

1. Extract the project ZIP file to your workspace directory.
2. Open your terminal or command prompt inside the `sports-website` folder.
3. Install project dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 6. Maintenance and Customization Guide

### Adding or Editing Podcasts
Podcast configurations are stored in `src/data/sources.json` and processed in `src/lib/podcasts.ts`.

To add a new podcast show, open `src/data/sources.json` and add an entry under the `podcasts` array:
```json
{
  "name": "The Rush Hour with JB & Billy",
  "hosts": "James Brayshaw & Billy Brownless",
  "url": "https://www.triplem.com.au",
  "rss": "https://www.omnycontent.com/d/playlist/.../podcast.rss",
  "sport": "afl"
}
```

The layout in `src/app/page.tsx` will automatically render the main show title (`name`), the publication date, and the audio duration without showing long episode descriptions.

---

### Updating News RSS Sources
To add or modify news outlets, edit the news sources array in `src/data/sources.json`:
```json
{
  "name": "AFL Official News",
  "url": "https://www.afl.com.au/news",
  "rss": "https://www.afl.com.au/rss",
  "sport": "afl",
  "publisherColor": "#E8230A"
}
```

---

### Managing Teams and Sports Categories
To add new teams or update existing team accents, edit `src/data/teams.ts`:
```typescript
export const TEAMS: Team[] = [
  { id: 'collingwood', name: 'Collingwood Magpies', sport: 'afl' },
  { id: 'broncos', name: 'Brisbane Broncos', sport: 'nrl' },
];
```

---

### Theme and Style Customization
Global theme variables, colors, typography rules, and responsive layouts are defined in `src/app/globals.css`.

You can adjust primary colors directly in the `:root` block:
```css
:root {
  --bg:        #F5F5F0;   /* Page background color */
  --surface:   #FFFFFF;   /* Card background color */
  --ink:       #0D0D0D;   /* Text color */
  --red:       #E8230A;   /* Primary accent color */
}
```

---

## 7. Vercel Deployment Instructions

The application is fully compatible with Vercel for continuous deployment.

### Option A: Automatic Deployment via GitHub (Recommended)
1. Push all project files to your GitHub repository (`Danialwattoo/Sports-website`).
2. Log into your account at https://vercel.com.
3. Select "New Project" and choose the `Danialwattoo/Sports-website` repository.
4. Next.js will be detected automatically. Click "Deploy".
5. Any subsequent push to the `main` branch will automatically update the live site.

### Option B: Manual CLI Deployment
If you prefer to deploy directly from your local terminal:
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in and publish:
   ```bash
   vercel --prod
   ```

---

## 8. Pre-Flight Check and Build Validation

Before delivering updates or deploying to production, run the TypeScript compiler to ensure there are no syntax or type errors:

```bash
npx tsc --noEmit
```

If the command finishes with no output, the build is clean and ready for production deployment.
