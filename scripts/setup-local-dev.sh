#!/bin/bash

###############################################################################
# Local Development Environment Setup Script
###############################################################################
# This script sets up a complete local development environment
# for the VNTG e-commerce platform.
#
# Usage:
#   ./scripts/setup-local-dev.sh [mode]
#
# Modes:
#   stub   - Set up stub mode (no external services)
#   local  - Set up local database with Supabase CLI
#   remote - Set up remote development environment
#   all    - Set up all modes (default)
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo -e "\n${BLUE}===============================================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===============================================================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

check_command() {
  if command -v "$1" &> /dev/null; then
    print_success "$1 is installed"
    return 0
  else
    print_error "$1 is not installed"
    return 1
  fi
}

###############################################################################
# Check Prerequisites
###############################################################################

check_prerequisites() {
  print_header "Checking Prerequisites"

  local all_installed=true

  # Check Node.js
  if check_command "node"; then
    NODE_VERSION=$(node -v)
    print_info "Node.js version: $NODE_VERSION"
  else
    all_installed=false
    print_warning "Install Node.js from: https://nodejs.org/"
  fi

  # Check npm
  if check_command "npm"; then
    NPM_VERSION=$(npm -v)
    print_info "npm version: $NPM_VERSION"
  else
    all_installed=false
  fi

  # Check Docker (optional, for local mode)
  if check_command "docker"; then
    print_info "Docker is available for local database mode"
  else
    print_warning "Docker not found - required for local database mode"
    print_info "Install from: https://www.docker.com/products/docker-desktop"
  fi

  # Check Supabase CLI (optional, for local mode)
  if check_command "supabase"; then
    SUPABASE_VERSION=$(supabase -v)
    print_info "Supabase CLI version: $SUPABASE_VERSION"
  else
    print_warning "Supabase CLI not found - required for local database mode"
    print_info "Install with: brew install supabase/tap/supabase (macOS)"
    print_info "Or visit: https://supabase.com/docs/guides/cli"
  fi

  if [ "$all_installed" = false ]; then
    print_error "Some prerequisites are missing. Please install them and try again."
    exit 1
  fi

  print_success "All required prerequisites are installed"
}

###############################################################################
# Install Dependencies
###############################################################################

install_dependencies() {
  print_header "Installing Dependencies"

  cd "$PROJECT_ROOT"

  if [ ! -d "node_modules" ]; then
    print_info "Installing npm packages..."
    npm install
    print_success "Dependencies installed"
  else
    print_info "Dependencies already installed. Run 'npm install' to update."
  fi
}

###############################################################################
# Setup Stub Mode
###############################################################################

setup_stub_mode() {
  print_header "Setting Up Stub Mode"

  print_info "Stub mode uses in-memory mocks and requires no external services"

  # Check if stub files exist
  if [ ! -f "$PROJECT_ROOT/.env.local.stub" ]; then
    print_error ".env.local.stub not found"
    exit 1
  fi

  print_success "Stub mode configuration ready"
  print_info "To activate: npm run dev:stub"
}

###############################################################################
# Setup Local Database Mode
###############################################################################

setup_local_mode() {
  print_header "Setting Up Local Database Mode"

  # Check Docker
  if ! command -v docker &> /dev/null; then
    print_error "Docker is required for local database mode"
    print_info "Install from: https://www.docker.com/products/docker-desktop"
    exit 1
  fi

  # Check Docker daemon
  if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running. Please start Docker Desktop."
    exit 1
  fi
  print_success "Docker is running"

  # Check Supabase CLI
  if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is required for local database mode"
    print_info "Install with: brew install supabase/tap/supabase (macOS)"
    exit 1
  fi
  print_success "Supabase CLI is installed"

  # Check if local DB files exist
  if [ ! -f "$PROJECT_ROOT/.env.local.db" ]; then
    print_error ".env.local.db not found"
    exit 1
  fi

  # Initialize Supabase if not already done
  if [ ! -f "$PROJECT_ROOT/supabase/config.toml" ]; then
    print_error "supabase/config.toml not found"
    exit 1
  fi
  print_success "Supabase configuration found"

  print_info "Starting local Supabase instance..."
  cd "$PROJECT_ROOT"

  # Start Supabase
  if supabase start; then
    print_success "Supabase started successfully"
  else
    print_warning "Supabase may already be running or failed to start"
  fi

  # Check if migrations need to be applied
  print_info "Checking database migrations..."
  if [ -d "$PROJECT_ROOT/supabase/migrations" ]; then
    print_info "Applying migrations..."
    supabase db reset --no-seed || print_warning "Could not reset database"
    print_success "Migrations applied"
  fi

  # Seed database
  print_info "Seeding database with test data..."
  if [ -f "$PROJECT_ROOT/supabase/seed.sql" ]; then
    supabase db seed || print_warning "Could not seed database"
    print_success "Database seeded"
  fi

  # Create test users
  print_info "Creating test users in auth..."
  print_info "Note: You may need to create auth users manually or via the Supabase Studio"
  print_info "Access Supabase Studio at: http://localhost:54323"

  print_success "Local database mode setup complete"
  print_info "Studio UI: http://localhost:54323"
  print_info "API URL: http://127.0.0.1:54321"
  print_info "Email testing (Inbucket): http://localhost:54324"
  print_info "\nTo activate: npm run dev:local"
}

###############################################################################
# Setup Remote Development Mode
###############################################################################

setup_remote_mode() {
  print_header "Setting Up Remote Development Mode"

  # Check if remote config exists
  if [ ! -f "$PROJECT_ROOT/.env.local.remote" ]; then
    print_error ".env.local.remote not found"
    exit 1
  fi

  print_info "Remote mode connects to a remote Supabase instance"
  print_warning "Ensure you have valid credentials in .env.local.remote"
  print_info "Get credentials from: https://supabase.com/dashboard/project/_/settings/api"

  print_success "Remote development mode configuration ready"
  print_info "To activate: npm run dev:remote"
}

###############################################################################
# Display Usage
###############################################################################

display_usage() {
  cat << EOF
Usage: ./scripts/setup-local-dev.sh [mode]

Modes:
  stub   - Set up stub mode (in-memory mocks, no external services)
  local  - Set up local database with Supabase CLI and Docker
  remote - Set up remote development environment
  all    - Set up all modes (default)

Examples:
  ./scripts/setup-local-dev.sh            # Setup all modes
  ./scripts/setup-local-dev.sh stub       # Setup stub mode only
  ./scripts/setup-local-dev.sh local      # Setup local database mode
  ./scripts/setup-local-dev.sh remote     # Setup remote development mode

EOF
}

###############################################################################
# Main Execution
###############################################################################

main() {
  MODE="${1:-all}"

  print_header "VNTG Local Development Setup"
  print_info "Mode: $MODE"

  # Check prerequisites
  check_prerequisites

  # Install dependencies
  install_dependencies

  # Setup based on mode
  case "$MODE" in
    stub)
      setup_stub_mode
      ;;
    local)
      setup_local_mode
      ;;
    remote)
      setup_remote_mode
      ;;
    all)
      setup_stub_mode
      setup_local_mode
      setup_remote_mode
      ;;
    --help|-h)
      display_usage
      exit 0
      ;;
    *)
      print_error "Invalid mode: $MODE"
      display_usage
      exit 1
      ;;
  esac

  print_header "Setup Complete!"

  cat << EOF
Next steps:

1. Choose your development mode:
   - Stub mode:   npm run dev:stub   (no external services)
   - Local DB:    npm run dev:local  (local Supabase)
   - Remote:      npm run dev:remote (remote Supabase)

2. Access your application:
   - Frontend:    http://localhost:3000
   - Studio UI:   http://localhost:54323 (local mode only)
   - Email Test:  http://localhost:54324 (local mode only)

3. Run tests:
   - Unit tests:  npm run test
   - E2E tests:   npm run test:e2e

For more information, see LOCAL_DEVELOPMENT.md

Happy coding! 🚀
EOF
}

# Run main function
main "$@"
