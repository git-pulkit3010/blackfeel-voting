#!/bin/bash

# BlackFeel Voting App - Setup Script
# This script sets up both the voting app and auth backend

set -e

echo "🚀 BlackFeel Voting App - Setup Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running in correct directory
if [ ! -f "package.json" ] || [ ! -d "blackfeel-auth" ]; then
    print_error "Please run this script from the root of blackfeel-voting directory"
    exit 1
fi

# Step 1: Install voting app dependencies
print_info "Installing voting app dependencies..."
npm install
print_success "Voting app dependencies installed"

# Step 2: Install backend dependencies
print_info "Setting up auth backend..."
cd blackfeel-auth/backend

if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

print_info "Activating virtual environment..."
source venv/bin/activate

print_info "Installing Python dependencies..."
pip install -r requirements.txt
print_success "Backend dependencies installed"

cd ../..

# Step 3: Check environment files
print_info "Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    print_error ".env.local not found in voting app root"
    print_info "Please create .env.local with the following variables:"
    echo ""
    echo "DATABASE_URL=postgresql://blackweave_user:pulkit3010@localhost:5432/blackweave_db"
    echo "AUTH_SECRET_KEY=your_access_token_secret_here"
    echo "AUTH_BACKEND_URL=http://127.0.0.1:8000"
    echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id"
    echo ""
else
    print_success ".env.local found"
fi

if [ ! -f "blackfeel-auth/backend/.env" ]; then
    print_error ".env not found in backend directory"
    exit 1
else
    print_success "Backend .env found"
fi

# Step 4: Database setup
print_info "Setting up databases..."
print_info "Please ensure the following databases are created:"
echo ""
echo "1. Voting DB: blackweave_db (PostgreSQL)"
echo "   User: blackweave_user"
echo "   Password: pulkit3010"
echo ""
echo "2. Auth DB: blackweave_auth (PostgreSQL)"
echo "   User: blackweave_user"
echo "   Password: pulkit3010"
echo ""
print_info "Run the SQL scripts to create tables:"
echo "   - supabase-schema.sql (for voting DB)"
echo "   - Auth tables will be auto-created by backend"
echo ""

# Step 5: Build voting app
print_info "Building voting app..."
npm run build
print_success "Voting app built successfully"

echo ""
echo "======================================="
print_success "Setup Complete!"
echo "======================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the auth backend (in one terminal):"
echo "   cd blackfeel-auth/backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start the voting app (in another terminal):"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "======================================="
