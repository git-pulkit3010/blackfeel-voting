# Trend Vote - T-Shirt Design Voting System

A modern, AI-powered voting system for trending t-shirt designs across multiple categories.

## 🎨 Features

- **Minimalist Duel UI**: Beautiful single-card experience with mesh gradients
- **AI-Powered Trends**: Monthly automated trend research using OpenRouter
- **Real-time Voting**: Live vote counts and percentages
- **Smart De-duplication**: Never repeats past designs
- **Built with Next.js 14**: App Router, Server Actions, TypeScript
- **Smooth Animations**: Framer Motion transitions
- **Supabase Backend**: PostgreSQL database with real-time capabilities

## 📦 Tech Stack

- Framework: Next.js 14 (App Router)
- UI: Tailwind CSS + shadcn/ui patterns
- Animations: Framer Motion
- Database: Supabase (PostgreSQL)
- AI: OpenRouter API (Perplexity Sonar models)
- Deployment: Vercel
- Cron: Vercel Cron Jobs

## 🎯 Categories

- TV Shows
- Movies
- Cricket
- Anime
- Music

## 🚀 Quick Start

#### Ensure you are on Node 24.
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to http://localhost:3000

## 📋 Detailed Setup

### 1. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to SQL Editor
3. Run the contents of `supabase-schema.sql`
4. Get your credentials from Project Settings > API:
   - Project URL
   - anon public key
   - service_role key

### 2. OpenRouter Setup

1. Sign up at https://openrouter.ai
2. Create an API key
3. Add credits (or use free models)
4. The project uses `perplexity/sonar-online` for web search

### 3. Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
CRON_SECRET=any_random_string
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.
The cron job is automatically configured via `vercel.json`.

## 🔧 Manual Cron Trigger

Test the trend research locally:
```bash
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer your_cron_secret"
```

## 📁 Project Structure

```
trend-vote-app/
├── app/
│   ├── api/          # API routes
│   ├── page.tsx      # Home page
│   ├── layout.tsx    # Root layout
│   └── globals.css   # Global styles
├── components/
│   ├── ui/           # UI components
│   └── MinimalistDuel.tsx  # Main component
├── lib/
│   ├── supabase.ts   # Supabase client
│   └── openrouter.ts # OpenRouter integration
└── types/
    └── index.ts      # TypeScript types
```

## 🎨 Customization

### Change gradients:
Edit `CATEGORIES` in `components/MinimalistDuel.tsx`

### Modify AI prompt:
Edit prompt in `app/api/cron/route.ts`

### Adjust cron schedule:
Edit `vercel.json` (format: cron syntax)

## 📝 License

MIT

## 🤝 Contributing

Pull requests are welcome!