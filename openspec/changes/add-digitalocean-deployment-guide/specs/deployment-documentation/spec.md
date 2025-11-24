# Deployment Documentation Specification

This specification defines the requirements for comprehensive deployment documentation to support multiple deployment strategies for the Restaurant Management System.

---

## ADDED Requirements

### Requirement: DigitalOcean VPS Deployment Guide (Vietnamese)

The system documentation SHALL provide a complete, step-by-step deployment guide in Vietnamese for deploying to DigitalOcean VPS using Docker Compose.

#### Scenario: Student deploys to DigitalOcean for thesis demo

- **GIVEN** a student with basic programming knowledge but limited Linux/DevOps experience
- **AND** the student has a GitHub Education account (for DigitalOcean credits)
- **WHEN** the student follows the Vietnamese deployment guide from start to finish
- **THEN** the student SHALL successfully deploy the full stack (PostgreSQL, Redis, Backend, Frontend) to a DigitalOcean Droplet
- **AND** the deployment SHALL complete in less than 2 hours
- **AND** the application SHALL be accessible via HTTPS with a valid SSL certificate
- **AND** all core features (authentication, menu, orders, reservations) SHALL work correctly
- **AND** the student SHALL understand the infrastructure components and security measures

#### Scenario: Student troubleshoots deployment issue

- **GIVEN** a student encounters an error during deployment
- **WHEN** the student consults the troubleshooting section of the guide
- **THEN** the guide SHALL provide solutions for common issues including:
  - Docker installation failures
  - Port conflicts
  - Database connection errors
  - SSL certificate issues
  - Memory/disk space problems
  - Firewall configuration issues
- **AND** each troubleshooting entry SHALL include:
  - Clear problem description
  - Diagnostic commands to verify the issue
  - Step-by-step solution
  - Prevention tips

#### Scenario: Student needs to restore from backup

- **GIVEN** a deployed application with automated backups running
- **AND** the student needs to restore data from a previous backup
- **WHEN** the student follows the backup restoration procedure
- **THEN** the database SHALL be successfully restored to the previous state
- **AND** the application SHALL continue functioning normally
- **AND** no data SHALL be lost

---

### Requirement: Automated VPS Setup Script

The deployment package SHALL include an automated setup script that prepares a fresh Ubuntu server for application deployment.

#### Scenario: Fresh Ubuntu droplet initialization

- **GIVEN** a newly created DigitalOcean Droplet running Ubuntu 22.04 LTS
- **AND** the user has SSH access to the server
- **WHEN** the user runs `./deploy/digitalocean/scripts/setup-vps.sh`
- **THEN** the script SHALL install:
  - Docker Engine (latest stable)
  - Docker Compose V2
  - Git
  - Necessary system utilities (curl, wget, etc.)
- **AND** the script SHALL configure:
  - UFW firewall (allow ports 22, 80, 443)
  - 1GB swap memory
  - Timezone to Asia/Ho_Chi_Minh
  - Create application deployment directory
- **AND** the script SHALL complete without errors
- **AND** the server SHALL be ready for application deployment

#### Scenario: Setup script error handling

- **GIVEN** the setup script encounters an error during execution
- **WHEN** a step fails (e.g., network error, permission issue)
- **THEN** the script SHALL:
  - Display a clear error message in Vietnamese
  - Log the error with timestamp
  - Stop execution (not continue with invalid state)
  - Provide guidance on how to resolve the issue
- **AND** the script SHALL be idempotent (can be run multiple times safely)

---

### Requirement: Automated Deployment Script

The deployment package SHALL include a script that automates application deployment and updates on the VPS.

#### Scenario: Initial application deployment

- **GIVEN** a configured VPS with Docker and Docker Compose installed
- **AND** the repository is cloned and `.env` is configured
- **WHEN** the user runs `./deploy/digitalocean/scripts/deploy.sh`
- **THEN** the script SHALL:
  1. Pull the latest code from Git repository
  2. Build Docker images for frontend and backend
  3. Run database migrations
  4. Start/restart all services (PostgreSQL, Redis, Backend, Frontend, Caddy)
  5. Wait for services to be healthy
  6. Verify health checks pass
- **AND** the deployment SHALL complete successfully
- **AND** all services SHALL be accessible
- **AND** the script SHALL log all actions with timestamps

#### Scenario: Application update deployment

- **GIVEN** an already deployed application running in production
- **AND** new code changes have been pushed to the repository
- **WHEN** the user runs `./deploy/digitalocean/scripts/deploy.sh`
- **THEN** the script SHALL:
  - Pull latest changes
  - Rebuild only changed services
  - Perform rolling restart (minimize downtime)
  - Run new database migrations
  - Verify health checks
- **AND** existing user sessions SHALL not be interrupted (graceful shutdown)
- **AND** if health checks fail, the script SHALL offer rollback option

#### Scenario: Deployment rollback

- **GIVEN** a deployment that fails health checks
- **WHEN** the deployment script detects unhealthy services
- **THEN** the script SHALL:
  - Display error messages and logs
  - Prompt user to rollback to previous version
  - If confirmed, restore previous Docker images
  - Restart services with previous version
  - Verify health checks pass
- **AND** the application SHALL return to working state

---

### Requirement: Automated Backup and Restore

The deployment package SHALL include scripts for automated database backups and restoration.

#### Scenario: Scheduled daily backup

- **GIVEN** a cron job configured to run the backup script daily at 3 AM
- **WHEN** the backup script executes
- **THEN** the script SHALL:
  1. Create PostgreSQL database dump
  2. Compress the dump file with gzip
  3. Save to `/backups` directory with timestamp
  4. Delete backups older than 7 days
  5. Log backup status (success/failure)
- **AND** the backup file SHALL be named `db_backup_YYYY-MM-DD_HHMMSS.sql.gz`
- **AND** the backup SHALL complete within 5 minutes
- **AND** the backup SHALL not interrupt application availability

#### Scenario: Manual backup creation

- **GIVEN** a user wants to create a backup before making major changes
- **WHEN** the user runs `./deploy/digitalocean/scripts/backup.sh`
- **THEN** a backup SHALL be created immediately
- **AND** the backup file path SHALL be displayed to the user
- **AND** the backup SHALL be added to the retention policy

#### Scenario: Restore from specific backup

- **GIVEN** one or more backup files exist in `/backups`
- **WHEN** the user runs `./deploy/digitalocean/scripts/restore.sh /backups/db_backup_2024-11-25_030000.sql.gz`
- **THEN** the script SHALL:
  1. Confirm restoration with user (destructive operation warning)
  2. Stop application containers
  3. Drop existing database (after confirmation)
  4. Restore data from backup file
  5. Run migrations if schema version differs
  6. Restart application containers
  7. Verify database connectivity
- **AND** the database SHALL contain data from the backup timestamp
- **AND** the application SHALL function normally with restored data

---

### Requirement: Reverse Proxy Configuration Templates

The deployment package SHALL include pre-configured templates for reverse proxy setup with automatic SSL.

#### Scenario: Caddy automatic SSL setup

- **GIVEN** a user with a registered domain name pointing to the Droplet IP
- **AND** the user configures the domain in `Caddyfile`
- **WHEN** Caddy starts via Docker Compose
- **THEN** Caddy SHALL:
  - Automatically obtain SSL certificate from Let's Encrypt
  - Configure HTTPS for the domain
  - Redirect HTTP to HTTPS
  - Proxy requests to appropriate services:
    - `https://domain.com/*` → Frontend (Next.js)
    - `https://domain.com/api/*` → Backend (NestJS)
    - `https://domain.com/socket.io/*` → Backend WebSocket
- **AND** SSL certificate SHALL be valid and trusted by browsers
- **AND** certificates SHALL auto-renew before expiration

#### Scenario: Nginx SSL setup (alternative)

- **GIVEN** a user prefers Nginx over Caddy
- **WHEN** the user follows the Nginx configuration guide
- **THEN** the guide SHALL provide:
  - nginx.conf template with SSL configuration
  - Instructions to obtain Let's Encrypt certificate with certbot
  - Setup for certificate auto-renewal
  - Reverse proxy configuration for all services
- **AND** the setup SHALL achieve the same result as Caddy (HTTPS with auto-renew)

---

### Requirement: Health Check and Monitoring Script

The deployment package SHALL include a script that verifies all services are running correctly.

#### Scenario: Manual health check execution

- **GIVEN** a deployed application
- **WHEN** the user runs `./deploy/digitalocean/scripts/health-check.sh`
- **THEN** the script SHALL check:
  - All Docker containers are running
  - PostgreSQL is accepting connections
  - Redis is responding
  - Frontend endpoint returns 200 OK
  - Backend API endpoint returns 200 OK
  - Backend WebSocket is accepting connections
  - Disk space usage < 90%
  - Memory usage < 90%
- **AND** the script SHALL output status for each check (✅ or ❌)
- **AND** the script SHALL exit with code 0 if all checks pass, non-zero otherwise

#### Scenario: Automated health monitoring via cron

- **GIVEN** a cron job configured to run health checks every 5 minutes
- **WHEN** a service becomes unhealthy
- **THEN** the health check script SHALL log the failure with timestamp
- **AND** optionally send notification (if configured)
- **AND** provide diagnostic information in the log

---

### Requirement: Security Configuration Checklist

The deployment documentation SHALL include a comprehensive security checklist and guidance.

#### Scenario: Security hardening verification

- **GIVEN** a user has completed the deployment
- **WHEN** the user reviews the security checklist
- **THEN** the checklist SHALL include verification for:
  - SSH key-based authentication enabled (password login disabled)
  - UFW firewall active with minimal open ports
  - Strong passwords for database services
  - JWT secrets are strong random values (32+ characters)
  - CORS configured to allow only specific origins
  - Database ports not exposed to public internet
  - HTTPS enforced (HTTP redirects to HTTPS)
  - Docker containers run as non-root users
  - Security updates applied (`apt update && apt upgrade`)
- **AND** each item SHALL have instructions for verification
- **AND** each item SHALL have instructions for remediation if not secure

#### Scenario: Security audit after deployment

- **GIVEN** a deployed application
- **WHEN** a user performs security audit using the checklist
- **THEN** the user SHALL be able to verify compliance with security best practices
- **AND** identify any security gaps
- **AND** know how to fix identified issues

---

### Requirement: Cost Optimization Guide

The deployment documentation SHALL include guidance on optimizing costs for student budgets.

#### Scenario: Student applies GitHub Education credits

- **GIVEN** a student with a GitHub account
- **WHEN** the student follows the cost optimization guide
- **THEN** the guide SHALL provide:
  - Link to GitHub Education Pack application
  - Instructions to redeem $200 DigitalOcean credit
  - Verification steps to confirm credit applied
- **AND** the student SHALL be able to run the deployment for free using the credit

#### Scenario: Resource optimization recommendations

- **GIVEN** a user wants to minimize monthly costs
- **WHEN** the user follows resource optimization guidance
- **THEN** the guide SHALL recommend:
  - Appropriate Droplet size for usage level (start with $6/month)
  - Cleanup of unused Docker images and volumes
  - Log rotation to prevent disk space waste
  - Optional: DigitalOcean Spaces vs local storage trade-offs
- **AND** provide commands for each optimization
- **AND** estimate cost impact of each recommendation

---

### Requirement: Quick Reference Documentation

The deployment package SHALL include a quick reference guide for common operations.

#### Scenario: User needs to perform routine maintenance

- **GIVEN** a deployed application running for several weeks
- **WHEN** the user consults the quick reference guide
- **THEN** the guide SHALL provide copy-pasteable commands for:
  - Viewing logs for each service
  - Restarting specific services
  - Checking service status
  - Running database migrations
  - Creating manual backups
  - Updating application code
  - Checking disk space and memory usage
  - SSH connection commands
  - Docker Compose common operations
- **AND** each command SHALL include a brief description
- **AND** commands SHALL be organized by category (Logs, Deployment, Database, etc.)

---

### Requirement: Vietnamese Technical Terminology Consistency

All Vietnamese documentation SHALL use consistent technical terminology with English terms provided for clarity.

#### Scenario: Student reads Vietnamese documentation

- **GIVEN** a Vietnamese-speaking student reading the deployment guide
- **WHEN** technical terms are used
- **THEN** the documentation SHALL:
  - Use consistent Vietnamese translations for technical terms
  - Include English terms in parentheses on first use (e.g., "Máy chủ ảo (VPS - Virtual Private Server)")
  - Maintain a glossary of technical terms
  - Use Vietnamese for explanations but English for code/commands
- **AND** the language SHALL be clear and appropriate for junior developers
- **AND** avoid overly complex academic language

#### Scenario: Student encounters unfamiliar term

- **GIVEN** the documentation uses a technical term the student doesn't know
- **WHEN** the student looks for the term
- **THEN** the term SHALL be defined in context or in the glossary
- **AND** include practical examples of usage
- **AND** provide links to further reading if appropriate

---

## MODIFIED Requirements

_None - This is a new documentation capability, no existing requirements modified._

---

## REMOVED Requirements

_None - This is additive documentation, nothing is being removed._

---

## RENAMED Requirements

_None._
