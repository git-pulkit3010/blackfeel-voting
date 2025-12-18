# Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenRouter account
- Vercel account for deployment (optional)
- Git (for version control)

## Step-by-Step Setup

### 1. Extract Project Files

The project files are provided as JSON files. Extract them:

```bash
# Create project directory
mkdir trend-vote-app
cd trend-vote-app

# The files are in the JSON format - you'll need to manually create each file
# based on the paths and contents in the JSON files
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Framer Motion
- Supabase client
- Tailwind CSS
- TypeScript
- And all other dependencies

### 3. Supabase Configuration

#### Create Project:
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for initialization (~2 minutes)

#### Set Up Database:
1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy entire contents of `supabase-schema.sql`
4. Click "Run"
5. Verify tables were created in Table Editor

#### Get Credentials:
1. Go to Project Settings > API
2. Copy these values:
   - URL (starts with https://...supabase.co)
   - anon public key (starts with eyJ...)
   - service_role key (starts with eyJ...)

### 4. OpenRouter Configuration

#### Sign Up:
1. Visit https://openrouter.ai
2. Create account
3. Verify email

#### Get API Key:
1. Go to Keys section
2. Click "Create Key"
3. Name it "Trend Vote App"
4. Copy the key (starts with sk-or-...)

#### Add Credits (Optional):
- Free models available but limited
- $5 credit recommended for testing
- perplexity/sonar-online costs ~$0.003/request

### 5. Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...

# Cron Security (use any random string)
CRON_SECRET=my-super-secret-cron-key-12345

# Optional: Your site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Local Development

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see:
- "Loading trends..." briefly
- Then the voting interface
- Category indicator dots
- Sample trends (if you added them)

### 7. Test the Cron Job

Manually trigger trend research:

```bash
curl -X GET http://localhost:3000/api/cron \
  -H "Authorization: Bearer my-super-secret-cron-key-12345"
```

Check response:
- Should return `{ "success": true, "message": "..." }`
- Check Supabase trends table - should have new entries
- All old trends should have `active = false`

### 8. Deploy to Vercel

#### Install Vercel CLI:
```bash
npm i -g vercel
```

#### Deploy:
```bash
vercel
```

Follow prompts:
1. Link to existing project? No
2. Project name? trend-vote-app
3. Directory? ./
4. Override settings? No

#### Add Environment Variables:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.local`
5. Make sure to select all environments (Production, Preview, Development)

#### Verify Cron Job:
1. Check vercel.json exists in project
2. Go to project Settings > Cron Jobs
3. Should see: `/api/cron` running monthly
4. Can trigger manually for testing

### 9. Production Cron Setup

The cron runs automatically on the 1st of each month at midnight UTC.

To manually trigger in production:
```bash
curl -X GET https://your-app.vercel.app/api/cron \
  -H "Authorization: Bearer your_cron_secret"
```

### 10. Verify Everything Works

#### Frontend:
- [ ] Homepage loads
- [ ] Categories cycle smoothly
- [ ] Gradients animate
- [ ] Voting buttons work
- [ ] Vote counts update
- [ ] Percentages display correctly

#### Backend:
- [ ] Trends API returns data
- [ ] Vote API increments counts
- [ ] Cron creates new trends
- [ ] History prevents duplicates

#### Database:
- [ ] Trends table has data
- [ ] Design_history table populates
- [ ] RLS policies allow public read
- [ ] Active flag updates correctly

## Troubleshooting

### "Module not found" errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection errors:
- Verify URL format is correct
- Check API keys don't have extra spaces
- Ensure RLS policies are created
- Test with Supabase client in browser console

### OpenRouter API errors:
- Verify API key is valid
- Check you have credits
- Confirm model name is correct: `perplexity/sonar-online`
- Check OpenRouter status page

### Cron not running:
- Verify vercel.json is in root directory
- Check Vercel dashboard > Cron Jobs
- Ensure CRON_SECRET matches in both places
- Check function logs in Vercel

### Styling issues:
- Run `npm run build` to check for Tailwind errors
- Verify tailwind.config.ts paths are correct
- Check globals.css is imported in layout.tsx

### TypeScript errors:
- Run `npm run lint` to see all errors
- Check tsconfig.json paths configuration
- Verify all imports use `@/` prefix correctly

## Free Model Alternatives

If you want to avoid costs:

### Option 1: Free models (no web search)
Edit `lib/openrouter.ts`, change model to:
```typescript
model: 'google/gemini-flash-1.5:free'
```

### Option 2: Manual trend entry
Skip cron job, manually insert trends in Supabase:
```sql
INSERT INTO trends (category, option_a, option_b, active) 
VALUES ('tv-shows', 'Trend A', 'Trend B', true);
```

## Next Steps

1. Customize gradients in MinimalistDuel.tsx
2. Adjust AI prompts in cron/route.ts
3. Add user authentication (optional)
4. Implement winner announcements
5. Add analytics tracking
6. Create admin dashboard
7. Integrate with actual t-shirt design pipeline

## Support

For issues:
1. Check this guide thoroughly
2. Review error messages in console
3. Check Vercel function logs
4. Verify environment variables
5. Test API endpoints individually