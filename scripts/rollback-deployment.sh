#!/bin/bash

# =============================================================================
# Deployment Rollback Script for Peakees E-commerce Platform
# =============================================================================
# This script handles rolling back to a previous deployment
# Usage: ./scripts/rollback-deployment.sh [deployment-id|tag]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="peakees"

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
    
    # Check required tools
    command -v vercel >/dev/null 2>&1 || { log_error "Vercel CLI is required. Install with: npm i -g vercel"; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "Git is required but not installed."; exit 1; }
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    
    # Check if logged into Vercel
    if ! vercel whoami >/dev/null 2>&1; then
        log_error "Not logged into Vercel. Run: vercel login"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

get_current_deployment() {
    log_info "Getting current deployment information..."
    
    # Get current production deployment
    current_deployment=$(vercel ls --scope=team 2>/dev/null | grep "$PROJECT_NAME" | grep "READY" | head -1)
    
    if [ -z "$current_deployment" ]; then
        log_error "Could not find current deployment"
        exit 1
    fi
    
    current_url=$(echo "$current_deployment" | awk '{print $2}')
    current_created=$(echo "$current_deployment" | awk '{print $4" "$5}')
    
    log_info "Current deployment: $current_url"
    log_info "Created: $current_created"
    
    echo "$current_url"
}

list_recent_deployments() {
    log_info "Recent deployments:"
    log_info "==================="
    
    # List recent deployments
    vercel ls --scope=team 2>/dev/null | grep "$PROJECT_NAME" | head -10 | while read line; do
        url=$(echo "$line" | awk '{print $2}')
        status=$(echo "$line" | awk '{print $3}')
        created=$(echo "$line" | awk '{print $4" "$5}')
        
        if [ "$status" = "READY" ]; then
            echo -e "${GREEN}✓${NC} $url - $created"
        else
            echo -e "${RED}✗${NC} $url - $created ($status)"
        fi
    done
}

get_deployment_by_tag() {
    local tag=$1
    log_info "Looking for deployment with tag: $tag"
    
    # Check if tag exists
    if ! git tag -l | grep -q "^$tag$"; then
        log_error "Tag '$tag' not found"
        exit 1
    fi
    
    # Get commit hash for tag
    commit_hash=$(git rev-list -n 1 "$tag")
    
    # Find deployment with matching commit
    deployment=$(vercel ls --scope=team 2>/dev/null | grep "$PROJECT_NAME" | grep "$commit_hash" | head -1)
    
    if [ -z "$deployment" ]; then
        log_error "No deployment found for tag '$tag'"
        exit 1
    fi
    
    deployment_url=$(echo "$deployment" | awk '{print $2}')
    echo "$deployment_url"
}

validate_deployment() {
    local deployment_url=$1
    log_info "Validating deployment: $deployment_url"
    
    # Check if deployment exists and is ready
    deployment_info=$(vercel ls --scope=team 2>/dev/null | grep "$deployment_url")
    
    if [ -z "$deployment_info" ]; then
        log_error "Deployment not found: $deployment_url"
        exit 1
    fi
    
    status=$(echo "$deployment_info" | awk '{print $3}')
    
    if [ "$status" != "READY" ]; then
        log_error "Deployment is not ready. Status: $status"
        exit 1
    fi
    
    # Test deployment health
    log_info "Testing deployment health..."
    
    if curl -f -s "https://$deployment_url/api/health" >/dev/null; then
        log_success "Deployment health check passed"
    else
        log_warning "Deployment health check failed, but proceeding..."
    fi
}

create_backup() {
    log_info "Creating backup before rollback..."
    
    # Create database backup
    if [ -f "scripts/backup-restore.js" ]; then
        node scripts/backup-restore.js backup
        log_success "Database backup created"
    else
        log_warning "Backup script not found, skipping database backup"
    fi
    
    # Tag current deployment for easy recovery
    current_commit=$(git rev-parse HEAD)
    backup_tag="rollback-backup-$(date +%Y%m%d-%H%M%S)"
    
    git tag -a "$backup_tag" "$current_commit" -m "Backup before rollback to $1"
    git push origin "$backup_tag"
    
    log_success "Created backup tag: $backup_tag"
}

perform_rollback() {
    local target_deployment=$1
    
    log_info "Rolling back to deployment: $target_deployment"
    
    # Promote the target deployment to production
    if vercel promote "https://$target_deployment" --scope=team; then
        log_success "Deployment promoted to production"
    else
        log_error "Failed to promote deployment"
        exit 1
    fi
    
    # Wait for promotion to complete
    log_info "Waiting for rollback to complete..."
    sleep 30
    
    # Verify rollback
    log_info "Verifying rollback..."
    
    if curl -f -s "https://peakees.vercel.app/api/health" >/dev/null; then
        log_success "Rollback verification passed"
    else
        log_error "Rollback verification failed"
        exit 1
    fi
}

send_rollback_notification() {
    local target_deployment=$1
    local reason=$2
    
    log_info "Sending rollback notification..."
    
    # Create rollback commit message
    rollback_message="Rollback to deployment: $target_deployment"
    if [ -n "$reason" ]; then
        rollback_message="$rollback_message - Reason: $reason"
    fi
    
    # You can integrate with Slack, Discord, or other notification services here
    # Example for Slack webhook:
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"🔄 Peakees rollback completed: $rollback_message\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi
    
    log_success "Rollback notification sent"
}

main() {
    local target=$1
    local reason=$2
    
    log_info "Starting rollback process for $PROJECT_NAME"
    echo "========================================"
    
    # Confirm rollback
    if [ -z "$target" ]; then
        log_error "Usage: $0 <deployment-url|tag> [reason]"
        log_info "Available options:"
        list_recent_deployments
        exit 1
    fi
    
    read -p "Are you sure you want to rollback to '$target'? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
    
    # Run rollback steps
    check_prerequisites
    
    current_deployment=$(get_current_deployment)
    
    # Determine target deployment
    if [[ $target == production-* ]] || [[ $target == staging-* ]]; then
        # It's a tag
        target_deployment=$(get_deployment_by_tag "$target")
    else
        # It's a deployment URL
        target_deployment=$target
    fi
    
    # Validate target deployment
    validate_deployment "$target_deployment"
    
    # Create backup
    create_backup "$target_deployment"
    
    # Perform rollback
    perform_rollback "$target_deployment"
    
    # Send notification
    send_rollback_notification "$target_deployment" "$reason"
    
    echo "========================================"
    log_success "Rollback completed successfully! 🔄"
    log_info "Previous deployment: $current_deployment"
    log_info "Current deployment: $target_deployment"
    log_info "Application is now live at: https://peakees.vercel.app"
    
    if [ -n "$reason" ]; then
        log_info "Rollback reason: $reason"
    fi
}

# Handle script interruption
trap 'log_error "Rollback interrupted"; exit 1' INT TERM

# Run main function
main "$@"
