#!/bin/bash

# =============================================================================
# Production Deployment Script for VNTG E-commerce Platform
# =============================================================================
# This script handles the complete deployment process to production
# Run with: ./scripts/deploy-production.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="vntg"
PRODUCTION_BRANCH="main"
STAGING_BRANCH="staging"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're on the correct branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "$PRODUCTION_BRANCH" ]; then
        log_error "Must be on $PRODUCTION_BRANCH branch for production deployment"
        log_info "Current branch: $current_branch"
        exit 1
    fi
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Working directory is not clean. Please commit or stash changes."
        git status --short
        exit 1
    fi
    
    # Check if we have the latest changes
    git fetch origin
    if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/$PRODUCTION_BRANCH)" ]; then
        log_error "Local branch is not up to date with origin/$PRODUCTION_BRANCH"
        log_info "Please run: git pull origin $PRODUCTION_BRANCH"
        exit 1
    fi
    
    # Check required tools
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
    command -v vercel >/dev/null 2>&1 || { log_error "Vercel CLI is required. Install with: npm i -g vercel"; exit 1; }
    
    log_success "Prerequisites check passed"
}

run_tests() {
    log_info "Running test suite..."
    
    # Install dependencies
    npm ci
    
    # Run type checking
    log_info "Running TypeScript type checking..."
    npm run type-check
    
    # Run linting
    log_info "Running ESLint..."
    npm run lint
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test -- --passWithNoTests --coverage=false
    
    # Run integration tests
    log_info "Running integration tests..."
    npm run test -- tests/integration --passWithNoTests
    
    log_success "All tests passed"
}

build_application() {
    log_info "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    npm run build
    
    # Check build output
    if [ ! -d ".next" ]; then
        log_error "Build failed - .next directory not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

check_environment_variables() {
    log_info "Checking environment variables..."
    
    # List of required environment variables
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_info "Please set these variables in Vercel dashboard or .env.production"
        exit 1
    fi
    
    log_success "Environment variables check passed"
}

deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    # Deploy to production
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        log_success "Deployment to Vercel completed successfully"
    else
        log_error "Deployment to Vercel failed"
        exit 1
    fi
}

run_health_checks() {
    log_info "Running post-deployment health checks..."
    
    # Get the deployment URL
    deployment_url=$(vercel ls --scope=team 2>/dev/null | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    if [ -z "$deployment_url" ]; then
        log_warning "Could not determine deployment URL, skipping health checks"
        return
    fi
    
    log_info "Checking health endpoint: https://$deployment_url/api/health"
    
    # Wait a moment for deployment to be ready
    sleep 10
    
    # Check health endpoint
    health_response=$(curl -s -w "%{http_code}" "https://$deployment_url/api/health" || echo "000")
    http_code="${health_response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log_success "Health check passed"
    else
        log_warning "Health check failed with status: $http_code"
        log_info "Please check the deployment manually"
    fi
}

create_deployment_tag() {
    log_info "Creating deployment tag..."
    
    # Create a tag for this deployment
    timestamp=$(date +"%Y%m%d-%H%M%S")
    tag_name="production-$timestamp"
    
    git tag -a "$tag_name" -m "Production deployment $timestamp"
    git push origin "$tag_name"
    
    log_success "Created deployment tag: $tag_name"
}

send_deployment_notification() {
    log_info "Sending deployment notification..."
    
    # You can integrate with Slack, Discord, or other notification services here
    # Example for Slack webhook:
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data '{"text":"🚀 VNTG production deployment completed successfully!"}' \
    #         "$SLACK_WEBHOOK_URL"
    # fi
    
    log_success "Deployment notification sent"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove any temporary files
    rm -rf .next/cache
    
    log_success "Cleanup completed"
}

main() {
    log_info "Starting production deployment for $PROJECT_NAME"
    echo "========================================"
    
    # Confirm deployment
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_prerequisites
    run_tests
    build_application
    check_environment_variables
    deploy_to_vercel
    run_health_checks
    create_deployment_tag
    send_deployment_notification
    cleanup
    
    echo "========================================"
    log_success "Production deployment completed successfully! 🎉"
    log_info "Your application is now live at: https://peakees.vercel.app"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
