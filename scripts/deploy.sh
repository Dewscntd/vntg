#!/bin/bash

echo "🚀 VNTG Deployment Setup Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking prerequisites...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

# Check if all files are committed
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Commit them first?${NC}"
    read -p "Commit changes now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo "Enter commit message:"
        read commit_message
        git commit -m "$commit_message"
    else
        echo -e "${RED}❌ Please commit your changes before deploying${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo

echo -e "${BLUE}Vercel Deployment Checklist:${NC}"
echo "1. 📝 Environment Variables Setup"
echo "2. 🗄️  Supabase Production Database"
echo "3. 💳 Stripe Production Configuration"
echo "4. 🚀 Vercel Deployment"
echo

echo -e "${YELLOW}📝 STEP 1: Environment Variables${NC}"
echo "You need to set up these environment variables in Vercel:"
echo
echo "Required variables:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "- STRIPE_SECRET_KEY"
echo "- STRIPE_WEBHOOK_SECRET"
echo "- NODE_ENV=production"
echo "- NEXTAUTH_URL=https://peakees.vercel.app"
echo "- NEXTAUTH_SECRET=your-random-secret"
echo

read -p "Have you set up all environment variables in Vercel? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please set up environment variables first:${NC}"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings > Environment Variables"
    echo "4. Add all required variables from .env.example"
    echo "5. Run this script again"
    exit 1
fi

echo -e "${YELLOW}🗄️  STEP 2: Supabase Production Database${NC}"
echo "Make sure you have:"
echo "- Created a production Supabase project"
echo "- Run database migrations"
echo "- Set up storage bucket for product images"
echo

read -p "Is your Supabase production database ready? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please set up Supabase first:${NC}"
    echo "1. Go to https://supabase.com"
    echo "2. Create a new project"
    echo "3. Run: supabase db push"
    echo "4. Create storage bucket 'product-images'"
    echo "5. Run this script again"
    exit 1
fi

echo -e "${YELLOW}💳 STEP 3: Stripe Configuration${NC}"
echo "Make sure you have:"
echo "- Stripe account with production keys"
echo "- Webhook endpoint configured"
echo "- Payment methods enabled"
echo

read -p "Is your Stripe configuration ready? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please set up Stripe first:${NC}"
    echo "1. Go to https://stripe.com"
    echo "2. Get production API keys"
    echo "3. Set up webhook: https://peakees.vercel.app/api/webhooks/stripe"
    echo "4. Enable required events in webhook"
    echo "5. Run this script again"
    exit 1
fi

echo -e "${YELLOW}🚀 STEP 4: Deploy to Vercel${NC}"
echo "Deploying your VNTG store..."

# Push to main branch (triggers automatic deployment)
echo "Pushing to main branch..."
git push origin master

echo
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo
echo "🎉 Your VNTG store is being deployed!"
echo
echo "📋 Next steps:"
echo "1. Check deployment status in Vercel dashboard"
echo "2. Test your store at the provided URL"
echo "3. Create an admin user: npm run db:create-admin"
echo "4. Add products through admin panel"
echo "5. Test guest and member checkout flows"
echo
echo "🔗 Useful links:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Deployment logs: Check Vercel dashboard"
echo "- Store URL: Will be shown in Vercel after deployment"
echo
echo -e "${GREEN}🛍️  Your e-commerce empire awaits!${NC}"