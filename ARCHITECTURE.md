# AI & Robotics News App - Architecture & Tech Stack

## 🏗 High-Level Architecture
This project is structured as a **Monorepo** containing two main applications:
1. **Frontend (`apps/mobile`)**: A React Native (Expo) mobile application.
2. **Backend (`apps/backend`)**: A Node.js Express server acting as an automated intelligence gatherer.
3. **Database**: Supabase (PostgreSQL) acting as the single source of truth connecting both apps.

---

## 💻 1. The Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native / Expo (SDK 50+)
- **Language:** TypeScript
- **State Management:** Zustand (Global store handling category filtering and pagination)
- **Styling:** Vanilla StyleSheet with `expo-linear-gradient` for glassmorphism and modern UI overlays.
- **Icons:** `lucide-react-native`
- **In-App Browser:** `expo-web-browser` for natively opening article sources.
- **Scrolling & Gestures:** React Native `FlatList` with `viewabilityConfigCallbackPairs` for smooth, snapped, vertical TikTok-like scrolling.

### Backend (Aggregator Server)
- **Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Task Scheduling:** `node-cron`
- **HTTP Client:** `axios` (for fetching external APIs)
- **Security & Optimization:** `helmet`, `cors`, `compression`, `morgan`

### Database & Backend-as-a-Service
- **Provider:** Supabase
- **Database:** PostgreSQL
- **Connection:** `@supabase/supabase-js`

### Artificial Intelligence
- **Provider:** Google Gemini API (`@google/generative-ai`)
- **Model:** `gemini-2.0-flash`
- **Task:** Strict 60-word context-dense summarization.

### External APIs
- **News Aggregation:** GNews API v4

---

## ⚙️ 2. Automated Aggregation Flow (The "Brain")
The magic of this application happens entirely in the background.

### The Cron Job (Timing & Triggers)
- The backend utilizes `node-cron` to execute `runAggregatorJob()` **exactly every 30 minutes**.
- **The Math:** 24 hours = 48 runs. 

### The Request Flow
1. **Fetching the News:**
   - Every 30 minutes, the server queries the GNews API twice:
     - Query 1: `"Artificial Intelligence" OR "Machine Learning"`
     - Query 2: `"Robotics" OR "Humanoid Robot"`
   - It requests exactly **5 articles per query**.
   - **API Limits:** 2 queries per 30 minutes = 4 queries per hour = **96 queries per day**. This perfectly insulates the application from GNews's **100 requests/day Free Tier Limit**.

2. **The AI Summarization Pipeline:**
   - The server iterates through the 10 fetched articles.
   - It ships the raw article content to the **Google Gemini API** with a strict prompt: *"Summarize the following article in STRICTLY 60 words or fewer... omit unnecessary fluff."*
   - **Fallback Mechanism:** The Google Gemini Free Tier is subject to intense `429 Too Many Requests` quota limits. If Gemini rejects the request, the backend gracefully falls back to a custom local-slicing function that cleans and truncates the original GNews description to exactly 55 words to ensure the database always gets populated without crashing.

3. **Database Insertion:**
   - The summarized article, along with its original source URL, author, and high-res image URL, is pushed to **Supabase**.
   - Supabase utilizes the `original_url` as a Unique Constraint. If the server tries to insert an article it already found 30 minutes ago, Supabase quietly rejects it, preventing database duplication.

---

## 📱 3. Mobile UI / UX Flow
- **Data Hydration:** Upon launching, `App.tsx` calls `useNewsStore().fetchNews(true)`. The app connects directly to Supabase, bypassing the Node.js server, ensuring ultra-fast loading times.
- **Segmented Control:** A custom glassmorphic tab navigator floats at the top to filter between "AI NEWS" and "ROBOTICS". Tapping a tab instantly queries the Zustand store to filter the active feed.
- **The NewsCard:** It uses an absolute-positioned `ImageBackground` covered by dark `LinearGradient` shadows to ensure white text is always perfectly readable regardless of the article's image.
- **In-App Surfing:** A massive invisible `TouchableOpacity` blankets the title, summary, and footer. Tapping it triggers `expo-web-browser`, sliding a native iOS/Android browser sheet over the interface rather than jarringly kicking the user out of the app to Safari/Chrome.
