# Deployment Infrastructure Specification - Delta

## ADDED Requirements

### Requirement: Local Development Environment
The system SHALL provide a simplified local development environment using Docker for services only.

#### Scenario: Developer starts local development
- **WHEN** a developer runs the local setup script
- **THEN** PostgreSQL and Redis containers start successfully
- **AND** the developer can run client and server natively with hot reload
- **AND** the setup completes in under 5 minutes

#### Scenario: Database services accessible
- **WHEN** Docker Compose starts database services
- **THEN** PostgreSQL is accessible on localhost:5432
- **AND** Redis is accessible on localhost:6379
- **AND** health checks pass for both services

### Requirement: Platform-as-a-Service Deployment
The system SHALL support deployment to Vercel (frontend) and Railway (backend) as the primary deployment method.

#### Scenario: Frontend deployed to Vercel
- **WHEN** code is pushed to the main branch
- **THEN** Vercel automatically builds and deploys the Next.js application
- **AND** the deployment is accessible via HTTPS
- **AND** environment variables are configured through Vercel dashboard

#### Scenario: Backend deployed to Railway
- **WHEN** code is pushed to the main branch
- **THEN** Railway builds and deploys the Express backend
- **AND** PostgreSQL and Redis services are provisioned
- **AND** the backend is accessible via HTTPS
- **AND** WebSocket connections are supported

#### Scenario: Services connected end-to-end
- **WHEN** both frontend and backend are deployed
- **THEN** API calls from frontend reach backend successfully
- **AND** WebSocket real-time updates work
- **AND** database operations complete successfully
- **AND** all major features are functional

### Requirement: Alternative VPS Deployment
The system SHALL provide documentation for deploying to a single VPS (DigitalOcean) as an alternative option.

#### Scenario: VPS deployment documented
- **WHEN** a user chooses VPS deployment
- **THEN** step-by-step documentation is available
- **AND** Docker Compose configuration for production is provided
- **AND** security hardening steps are documented
- **AND** cost estimates are clearly stated

### Requirement: Deployment Documentation
The system SHALL provide a single comprehensive deployment guide under 500 lines.

#### Scenario: Developer follows deployment guide
- **WHEN** a developer reads the deployment README
- **THEN** they can choose between deployment options
- **AND** quick start instructions are clear
- **AND** all steps are actionable
- **AND** troubleshooting tips are provided
- **AND** cost breakdowns are transparent

#### Scenario: Local setup instructions
- **WHEN** a developer follows the local setup guide
- **THEN** they can start development in under 30 minutes
- **AND** all required services start successfully
- **AND** environment variables are configured correctly

### Requirement: Deployment Scripts
The system SHALL provide minimal, focused scripts for setup and maintenance.

#### Scenario: Local environment setup
- **WHEN** the setup script runs
- **THEN** it checks for Docker installation
- **AND** creates .env file from template
- **AND** generates secure JWT secrets
- **AND** starts Docker services
- **AND** runs database migrations
- **AND** optionally seeds demo data

#### Scenario: Database backup
- **WHEN** the backup script runs
- **THEN** it exports a PostgreSQL dump
- **AND** saves with timestamp
- **AND** compresses the output
- **AND** validates the backup succeeded

#### Scenario: Database restore
- **WHEN** the restore script runs with a backup file
- **THEN** it prompts for confirmation
- **AND** restores the database
- **AND** runs migrations if needed
- **AND** confirms successful restoration

### Requirement: Cost Optimization
The system SHALL target deployment costs of $0-5 per month for demonstration purposes.

#### Scenario: Free tier deployment
- **WHEN** using Vercel free tier and Railway $5 credit
- **THEN** monthly costs are $0 for Vercel
- **AND** Railway provides $5 worth of resources
- **AND** typical demo usage stays within free limits
- **AND** billing alerts warn of overages

#### Scenario: Cost monitoring
- **WHEN** the application is deployed
- **THEN** resource usage is visible in platform dashboards
- **AND** costs are tracked and reported
- **AND** optimization recommendations are provided

### Requirement: Deployment Security
The system SHALL ensure secure configuration for deployed applications.

#### Scenario: Secrets management
- **WHEN** the application is deployed
- **THEN** all secrets are stored as environment variables
- **AND** no secrets are committed to git
- **AND** secure random values are generated for JWT secrets
- **AND** .env.example provides generation instructions

#### Scenario: HTTPS enforcement
- **WHEN** the application is deployed
- **THEN** all traffic uses HTTPS
- **AND** SSL certificates are automatically provisioned
- **AND** HTTP requests redirect to HTTPS

#### Scenario: CORS configuration
- **WHEN** the backend receives requests
- **THEN** CORS allows only configured frontend URL
- **AND** unauthorized origins are rejected

## REMOVED Requirements

### Requirement: Multi-environment Docker Compose
The system previously provided separate Docker Compose files for development, production, and base configurations.

**Reason**: Over-engineered for a student demo project. Multiple files created confusion about which to use and increased maintenance burden.

**Migration**: Use single `deploy/docker-compose.yml` for local development only. Production uses platform-specific deployment (Vercel/Railway).

### Requirement: Reverse Proxy Configuration
The system previously provided Caddy and Nginx reverse proxy configurations.

**Reason**: Not needed when using PaaS (Vercel/Railway) which handles routing automatically. Added complexity without benefit for demo project.

**Migration**: Platforms provide automatic HTTPS and routing. For VPS deployment, simplified Caddy config can be added in DigitalOcean docs if needed.

### Requirement: Deployment Automation Scripts
The system previously provided complex deployment scripts (deploy.sh, rollback.sh, smoke-test.sh, generate-secrets.sh).

**Reason**: Over-engineered for simple deployments. Platform UIs and dashboards are more intuitive than custom scripts.

**Migration**: Platform-specific deployment handled by Vercel/Railway UIs. Minimal scripts (setup, backup, restore) provided for essential tasks only.

### Requirement: Makefile Commands
The system previously provided a Makefile with 30+ commands for Docker operations.

**Reason**: Added complexity without matching typical Next.js + Express workflow. Most developers prefer direct npm/pnpm scripts or platform UIs.

**Migration**: Use platform-specific commands or simple shell scripts. Docker operations simplified to basic `docker-compose up/down`.

### Requirement: Comprehensive Production Infrastructure
The system previously planned for managed databases, CI/CD pipelines, blue-green deployments, and multi-region setup.

**Reason**: Production-grade features unnecessary for graduation thesis demo. Increased complexity and cost without matching project scope.

**Migration**: Focus on working demo deployment with basic features. Platforms provide automatic deployments on git push.

## MODIFIED Requirements

_No existing requirements are being modified, only added or removed._
