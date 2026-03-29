# Trend Vote - T-Shirt Design Voting System

A modern, secure voting system for trending t-shirt designs across multiple categories with integrated authentication.

## 🎨 Features

- **Secure Authentication**: Email/password + Google OAuth with email & WhatsApp verification
- **One Vote Per User**: Global vote restriction prevents duplicate voting
- **Minimalist Duel UI**: Beautiful single-card experience with mesh gradients
- **Real-time Voting**: Live vote counts and percentages
- **Smart De-duplication**: Never repeats past designs
- **Built with Next.js 14**: App Router, Server Actions, TypeScript
- **Smooth Animations**: Framer Motion transitions
- **Dual Database Setup**: NeonDB for voting + PostgreSQL for auth

## 📦 Tech Stack

### Frontend
- Framework: Next.js 14 (App Router)
- UI: Tailwind CSS + shadcn/ui patterns
- Animations: Framer Motion
- Auth: JWT with HTTP-only cookies

### Backend
- Auth Service: FastAPI (Python)
- Database: PostgreSQL (Auth) + NeonDB (Voting)
- Email: Resend API
- WhatsApp: Meta WhatsApp Business API
- OAuth: Google OAuth 2.1 with PKCE

### Security
- Password Hashing: Argon2id
- JWT Tokens: Access (15min) + Refresh (30 days)
- Account Lockout: 5 failed attempts = 20 min lockout
- Rate Limiting: 10/min signin, 5/min signup
- CSRF Protection: SameSite cookies, OAuth state parameter

## 🎯 Categories

- TV Shows
- Movies
- Cricket
- Anime
- Music

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run setup script**:
   ```bash
   ./setup.sh
   ```

2. **Start both servers**:
   ```bash
   ./start.sh
   ```

3. **Open browser**:
   Navigate to http://localhost:3000

### Option 2: Manual Setup

#### Prerequisites
- Node.js 20+
- Python 3.9+
- PostgreSQL 14+
- Redis (optional, for rate limiting)

#### Step 1: Install Dependencies

**Voting App:**
```bash
npm install
```

**Auth Backend:**
```bash
cd blackfeel-auth/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

#### Step 2: Database Setup

**1. Create PostgreSQL databases:**
```sql
-- Voting Database (trends, votes, design history)
CREATE DATABASE blackweave_db;

-- Auth Database (users, tokens, verification)
CREATE DATABASE blackweave_auth;

-- Create user (if not exists)
CREATE USER blackweave_user WITH PASSWORD 'pulkit3010';
GRANT ALL PRIVILEGES ON DATABASE blackweave_db TO blackweave_user;
GRANT ALL PRIVILEGES ON DATABASE blackweave_auth TO blackweave_user;
```

> ⚠️ **Both databases are required:**
> - `blackweave_db` - Stores voting data (trends, votes, design history)
> - `blackweave_auth` - Stores authentication data (users, tokens, verification)

**2. Set up voting tables:**
```bash
psql -U blackweave_user -d blackweave_db -f supabase-schema.sql
```

**3. Auth tables:**
Auto-created by the backend on first run.

#### Step 3: Environment Variables

**Voting App (.env.local):**
```env
# Database (NeonDB or local PostgreSQL)
DATABASE_URL=postgresql://blackweave_user:pulkit3010@localhost:5432/blackweave_db

# Auth (MUST match backend SECRET_KEY)
AUTH_SECRET_KEY=your_access_token_secret_here

# Auth Backend URL
AUTH_BACKEND_URL=http://127.0.0.1:8000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENROUTER_API_KEY=sk-or-v1-xxx  # For AI trend generation
```

**Auth Backend (blackfeel-auth/backend/.env):**
```env
# Database
DATABASE_URL=postgresql://blackweave_user:pulkit3010@localhost/blackweave_auth

# Security (MUST match voting app AUTH_SECRET_KEY)
SECRET_KEY=your_access_token_secret_here
REFRESH_SECRET_KEY=your_refresh_token_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# Account Security
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Verification (Resend)
RESEND_API_KEY=re_xxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# WhatsApp (Optional)
REDIS_URL=redis://localhost:6379/0
```

#### Step 4: Start Servers

**Terminal 1 - Auth Backend:**
```bash
cd blackfeel-auth/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Voting App:**
```bash
npm run dev
```

#### Step 5: Open Browser

Navigate to http://localhost:3000

## 🔐 Authentication Flow

1. **Sign Up**: User provides email, password, and phone number
2. **Verification**: System sends verification code via:
   - Email (Resend API)
   - WhatsApp (Meta Business API)
3. **Sign In**: User logs in with credentials or Google OAuth
4. **Voting**: Authenticated users can vote (one vote per user globally)
5. **Session**: JWT tokens stored in HTTP-only cookies

## 🗳️ Voting System

- **Global One Vote**: Each user can vote once across all categories
- **Smart Reset**: If options change, users can vote again
- **Atomic Updates**: Vote counts updated atomically in database
- **User Tracking**: Votes tracked by email (from JWT token)

## 📋 API Endpoints

### Auth (FastAPI Backend)
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend code
- `GET /api/auth/callback/google` - Google OAuth callback

### Voting (Next.js)
- `GET /api/auth/me` - Check auth status
- `POST /api/auth/logout` - Logout
- `POST /api/vote` - Submit vote
- `GET /api/trends` - Get active trends

## 🔧 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env` files

## 📁 Project Structure

```
blackfeel-voting/
├── app/
│   ├── api/
│   │   ├── auth/          # Auth endpoints (me, logout)
│   │   ├── vote/          # Vote submission
│   │   └── trends/        # Fetch trends
│   ├── auth/page.tsx      # Auth page (signin/signup)
│   ├── vote/page.tsx      # Protected voting page
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home (redirects based on auth)
├── components/
│   ├── auth/
│   │   ├── AuthContext.tsx      # Auth state management
│   │   ├── AuthPage.tsx         # Auth UI container
│   │   ├── SignInForm.tsx       # Login form
│   │   ├── SignUpForm.tsx       # Registration form
│   │   ├── GoogleOAuthButton.tsx # OAuth button
│   │   └── VerificationPending.tsx
│   ├── MinimalistDuel.tsx # Main voting component
│   └── vote-cast-animation.tsx
├── blackfeel-auth/        # Auth backend (FastAPI)
│   ├── backend/
│   │   ├── app/
│   │   │   ├── auth/      # Auth routes, models, security
│   │   │   ├── services/  # Email, WhatsApp
│   │   │   └── main.py    # FastAPI entry point
│   │   └── requirements.txt
│   └── frontend/          # Standalone auth frontend (optional)
├── lib/
│   ├── db.ts              # NeonDB connection
│   └── utils/
└── setup.sh               # Automated setup script
```

## 🚨 Important Notes

### Security
- **Never commit `.env` files** to version control
- Use strong, unique `SECRET_KEY` values in production
- Enable HTTPS in production for secure cookies
- Rotate secrets regularly

### Production Deployment
1. Set `FRONTEND_URL` in backend to your production domain
2. Update CORS origins in `blackfeel-auth/backend/app/main.py`
3. Use environment-specific secrets
4. Enable rate limiting with Redis
5. Set up proper email/WhatsApp services

## 🛠️ Scripts

- `./setup.sh` - Automated setup (install deps, create venv)
- `./start.sh` - Start both backend and frontend
- `npm run dev` - Start voting app only
- `npm run build` - Build for production
- `npm run start` - Start production server

## 📝 License

MIT

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.