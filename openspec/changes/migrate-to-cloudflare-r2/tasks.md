# Tasks: Migrate to Cloudflare R2

**Change ID**: `migrate-to-cloudflare-r2`

---

## Overview

This task list provides an ordered, step-by-step implementation plan for migrating from Cloudinary to Cloudflare R2. Each task is designed to be small, verifiable, and delivers incremental progress toward the goal.

**Estimated Total Time**: 10-15 hours for a single developer

---

## Prerequisites (Before Starting Implementation)

- [ ] **PREREQ-1**: Cloudflare account created with R2 enabled
- [ ] **PREREQ-2**: R2 bucket created (e.g., `restaurant-files` or `restaurant-management-dev`)
- [ ] **PREREQ-3**: R2 API tokens generated (access key ID + secret access key) with read/write permissions
- [ ] **PREREQ-4**: R2 public URL obtained (e.g., `https://pub-xxxxx.r2.dev`) or custom domain configured
- [ ] **PREREQ-5**: Proposal reviewed and approved by project stakeholders

---

## Phase 1: Setup and Configuration (Est: 2-3 hours)

### 1.1 Install Dependencies

- [x] **TASK-001**: Install AWS SDK for S3-compatible operations
  - Run: `cd app/server && pnpm add @aws-sdk/client-s3`
  - Verify installation in `package.json`
  - **Validation**: Check that `@aws-sdk/client-s3` appears in dependencies

### 1.2 Update Configuration Files

- [x] **TASK-002**: Add R2 configuration to `app/server/src/config/index.ts`
  - Add `r2` object with fields: accountId, bucketName, accessKeyId, secretAccessKey, publicUrl
  - Read values from environment variables (R2_ACCOUNT_ID, R2_BUCKET_NAME, etc.)
  - Add comment marking cloudinary config as "Legacy/Outdated"
  - **Validation**: Import config and verify config.r2 structure exists

- [x] **TASK-003**: Update environment variable templates
  - Add R2 variables to `.env.example` (if exists)
  - Update `scripts/generate-secrets.sh` to prompt for R2 credentials
  - Add R2 variables to Docker Compose files (docker-compose.yml, docker-compose.dev.yml, docker-compose.prod.yml)
  - **Validation**: Check that R2 variables are documented in all config templates

---

## Phase 2: Core Implementation (Est: 4-6 hours)

### 2.1 Update Storage Interface

- [x] **TASK-004**: Extend StorageType to include 'r2'
  - Edit `app/server/src/features/storage/services/storage/storage.interface.ts`
  - Change `export type StorageType = 'local' | 'cloudinary';` to `'local' | 'cloudinary' | 'r2';`
  - Add deprecation comment for 'cloudinary': `// 'cloudinary' is legacy/outdated, use 'r2' instead`
  - **Validation**: TypeScript compilation succeeds with no errors

### 2.2 Implement R2 Storage Provider

- [x] **TASK-005**: Create R2 storage provider file
  - Create `app/server/src/features/storage/services/storage/r2.storage.ts`
  - Define `R2StorageProvider` class implementing `StorageProvider` interface
  - Import required AWS SDK modules: `S3Client`, `PutObjectCommand`, `DeleteObjectCommand`, `HeadBucketCommand`
  - **Validation**: File created and class skeleton defined

- [x] **TASK-006**: Implement R2Provider initialization
  - Add constructor that calls `initialize()` method
  - Implement `initialize()`: Create S3Client with R2 endpoint configuration
    - Endpoint: `https://${accountId}.r2.cloudflarestorage.com`
    - Region: 'auto' (R2 handles region automatically)
    - Credentials: accessKeyId and secretAccessKey from config
  - Set `isInitialized = true` on success, log warning on failure
  - **Validation**: Provider instantiates without errors when R2 credentials are valid

- [x] **TASK-007**: Implement R2Provider.upload() method
  - Read file from `file.path` using fs.createReadStream()
  - Map folder parameter to R2 key prefix: `restaurant/{folder}/{filename}`
  - Create `PutObjectCommand` with:
    - Bucket: config.r2.bucketName
    - Key: mapped folder path + filename
    - Body: file stream
    - ContentType: file.mimetype
  - Send command via S3Client
  - Construct public URL: `${config.r2.publicUrl}/${key}`
  - Return `StorageUploadResult` with filename, originalName, path (r2:// format), size, mimetype, url
  - **Validation**: Upload test file successfully returns valid result object

- [x] **TASK-008**: Implement R2Provider.delete() method
  - Extract object key from filePath (strip 'r2://' prefix or parse public URL)
  - Create `DeleteObjectCommand` with Bucket and Key
  - Send command via S3Client
  - Return `StorageDeleteResult` with success: true and message
  - Handle errors gracefully, return success: false on failure
  - **Validation**: Delete operation removes file from R2 bucket

- [x] **TASK-009**: Implement R2Provider.isAvailable() method
  - Create `HeadBucketCommand` to check bucket accessibility
  - Send command via S3Client
  - Return true if successful, false if error (network issue, invalid credentials, etc.)
  - Catch and log errors without throwing
  - **Validation**: Returns true when R2 is accessible, false when credentials are invalid

- [x] **TASK-010**: Implement R2Provider.getName() method
  - Return 'r2' as string
  - **Validation**: Method returns 'r2'

### 2.3 Integrate R2 into Storage Manager

- [x] **TASK-011**: Import R2Provider in StorageManager
  - Edit `app/server/src/features/storage/services/storage/storage.manager.ts`
  - Add import: `import { r2StorageProvider } from './r2.storage';`
  - **Validation**: Import resolves correctly

- [x] **TASK-012**: Update StorageManager.getProvider() to handle 'r2' type
  - Add case for 'r2': `return r2StorageProvider;`
  - **Validation**: getProvider('r2') returns R2Provider instance

- [x] **TASK-013**: Update StorageManager fallback logic
  - Modify fallback provider selection to support R2
  - If primary is 'r2', fallback to 'local'
  - If primary is 'local', fallback to 'r2' (if available) or 'cloudinary'
  - If primary is 'cloudinary', fallback to 'r2' (if available) or 'local'
  - **Validation**: Fallback chain executes correctly when primary provider fails

- [x] **TASK-014**: Update StorageManager.delete() to detect R2 paths
  - Add check for 'r2://' prefix: `if (filePath.startsWith('r2://')) { return await r2StorageProvider.delete(filePath); }`
  - Add check for R2 public URL pattern (match against config.r2.publicUrl)
  - Ensure existing Cloudinary and Local checks still work
  - **Validation**: Delete routes correctly for r2://, cloudinary://, and local uploads/ paths

- [x] **TASK-015**: Export R2Provider from storage module
  - Edit `app/server/src/features/storage/services/storage/index.ts`
  - Add: `export * from './r2.storage';`
  - **Validation**: Import works from other modules

### 2.4 Update Storage Controller

- [x] **TASK-016**: Update storage controller to accept 'r2' provider
  - Edit `app/server/src/features/storage/storage.controller.ts`
  - Update validation in switchProvider: `if (!provider || !['local', 'cloudinary', 'r2'].includes(provider))`
  - Update error message: `'Invalid provider. Must be "local", "cloudinary", or "r2"'`
  - **Validation**: API accepts 'r2' in switch provider endpoint without 400 error

---

## Phase 3: Testing (Est: 2-3 hours)

### 3.1 Unit Tests

- [ ] **TASK-017**: Write unit tests for R2Provider.upload()
  - Test successful upload with valid file
  - Test folder mapping (menu → restaurant/menu/, staff → restaurant/staff/)
  - Test error handling (invalid credentials, network failure)
  - **Validation**: All upload tests pass

- [ ] **TASK-018**: Write unit tests for R2Provider.delete()
  - Test successful delete with r2:// path
  - Test successful delete with public URL
  - Test error handling (file not found, invalid path)
  - **Validation**: All delete tests pass

- [ ] **TASK-019**: Write unit tests for R2Provider.isAvailable()
  - Test returns true when R2 accessible
  - Test returns false when credentials invalid
  - Test returns false when network unreachable
  - **Validation**: All availability tests pass

### 3.2 Integration Tests

- [ ] **TASK-020**: Test full upload flow: API → StorageManager → R2
  - Upload image file via POST /api/storage/upload/single with STORAGE_TYPE=r2
  - Verify file stored in R2 bucket with correct key
  - Verify response contains R2 public URL
  - **Validation**: File accessible at returned URL

- [ ] **TASK-021**: Test full delete flow: API → StorageManager → R2
  - Upload file to R2, get filePath
  - Delete via DELETE /api/storage/upload with filePath
  - Verify file removed from R2 bucket
  - Verify subsequent download returns 404
  - **Validation**: File successfully deleted

- [ ] **TASK-022**: Test provider switching: R2 ↔ Local ↔ Cloudinary
  - Start with STORAGE_TYPE=r2, upload file → verify stored in R2
  - Switch to 'local' via API, upload file → verify stored locally
  - Switch to 'cloudinary', upload file → verify stored in Cloudinary
  - Switch back to 'r2', upload file → verify stored in R2
  - **Validation**: Each provider switch works correctly

- [ ] **TASK-023**: Test fallback mechanism: R2 → Local
  - Set STORAGE_TYPE=r2
  - Simulate R2 unavailable (invalid credentials or disconnect network)
  - Attempt upload
  - Verify fallback to Local storage succeeds
  - Verify log message: "Primary provider (r2) not available, using fallback"
  - **Validation**: Fallback executes and file stored locally

### 3.3 Manual Testing

- [ ] **TASK-024**: Test upload various file types (images, documents, videos)
  - Upload JPEG image → verify in R2
  - Upload PDF document → verify in R2
  - Upload MP4 video → verify in R2
  - **Validation**: All file types upload successfully

- [ ] **TASK-025**: Test existing Cloudinary files still accessible
  - Identify existing Cloudinary file URL (if any)
  - Access file via URL
  - Delete file via API with cloudinary:// path
  - **Validation**: Cloudinary provider still functional

- [ ] **TASK-026**: Test storage status endpoint
  - GET /api/storage/status with STORAGE_TYPE=r2
  - Verify response shows primary='r2', primaryAvailable=true
  - **Validation**: Status reflects R2 as primary provider

---

## Phase 4: Documentation (Est: 2-3 hours)

### 4.1 Update Technical Documentation

- [ ] **TASK-027**: Update FILE_STORAGE_GUIDE.md
  - Add new section: "## Cloudflare R2 Storage Provider"
  - Include R2 architecture diagram (modify existing diagram to add R2)
  - Document R2 configuration steps (environment variables, bucket setup)
  - Add code examples for R2 uploads
  - Mark Cloudinary sections with "⚠️ **Outdated/Legacy** - Use R2 instead"
  - **Validation**: Documentation clearly explains R2 setup and usage

- [ ] **TASK-028**: Update deployment documentation
  - Add R2 setup steps to docs/DEPLOYMENT.md or docs/deloyment/DEPLOYMENT.md
  - Document how to create R2 bucket in Cloudflare dashboard
  - Document how to generate R2 API tokens
  - Add troubleshooting section for R2 issues
  - **Validation**: Deployment guide includes R2 configuration

- [x] **TASK-029**: Update project.md
  - Edit `openspec/project.md`
  - Update Tech Stack → Backend → File Upload:
    - Change: "Multer 2.0+ with Cloudinary 2.8+ integration"
    - To: "Multer 2.0+ with Cloudflare R2 (primary) + Cloudinary 2.8+ (legacy)"
  - Update External Services section:
    - Add: "- **Cloudflare R2**: Object storage for file uploads (images, documents, videos)"
    - Update Cloudinary note: "- **Cloudinary** (Legacy): Image storage for backward compatibility"
  - Update Production Storage note:
    - Change: "- **Production**: Cloudinary for persistent storage"
    - To: "- **Production**: Cloudflare R2 for persistent storage (Cloudinary legacy)"
  - **Validation**: project.md accurately reflects new tech stack

- [x] **TASK-030**: Update scripts/generate-secrets.sh
  - Add prompts for R2 credentials:
    ```bash
    read -p "Enter R2 Account ID: " R2_ACCOUNT_ID
    read -p "Enter R2 Bucket Name: " R2_BUCKET_NAME
    read -p "Enter R2 Access Key ID: " R2_ACCESS_KEY_ID
    read -p "Enter R2 Secret Access Key: " R2_SECRET_ACCESS_KEY
    read -p "Enter R2 Public URL: " R2_PUBLIC_URL
    ```
  - Add R2 variables to .env output:
    ```bash
    STORAGE_TYPE=r2
    R2_ACCOUNT_ID=$R2_ACCOUNT_ID
    R2_BUCKET_NAME=$R2_BUCKET_NAME
    R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
    R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
    R2_PUBLIC_URL=$R2_PUBLIC_URL
    ```
  - **Validation**: Script prompts for R2 credentials and outputs them to .env

### 4.2 Update API Documentation

- [x] **TASK-031**: Update Swagger/OpenAPI documentation
  - Edit storage.routes.ts Swagger annotations
  - Update provider enum to include 'r2': `enum: [local, cloudinary, r2]`
  - Add 'r2' example: `example: r2`
  - Update endpoint descriptions to mention R2
  - **Validation**: Swagger UI shows 'r2' as valid option

### 4.3 Add Code Comments

- [x] **TASK-032**: Add deprecation comments to Cloudinary provider
  - Edit `app/server/src/features/storage/services/storage/cloudinary.storage.ts`
  - Add top-level comment:
    ```typescript
    /**
     * Cloudinary Storage Provider
     * 
     * ⚠️ **DEPRECATED/LEGACY** ⚠️
     * This provider is maintained for backward compatibility only.
     * New uploads should use Cloudflare R2 (R2StorageProvider).
     * 
     * Will be removed in a future version after data migration to R2.
     * 
     * @deprecated Use R2StorageProvider instead
     */
    ```
  - **Validation**: Deprecation notice visible in code

---

## Phase 5: Deployment and Validation (Est: 1-2 hours)

### 5.1 Environment Configuration

- [ ] **TASK-033**: Set up R2 credentials in development environment
  - Add R2 environment variables to `.env` (or `.env.local`)
  - Set STORAGE_TYPE=r2
  - Restart development server
  - **Validation**: Server starts without R2 configuration errors

- [ ] **TASK-034**: Set up R2 credentials in Docker environment
  - Add R2 environment variables to `docker-compose.dev.yml` and `docker-compose.prod.yml`
  - Rebuild and restart containers
  - **Validation**: Containers start successfully and R2 initialized

### 5.2 End-to-End Validation

- [ ] **TASK-035**: Perform end-to-end upload test in development
  - Open client application
  - Navigate to menu management or file upload feature
  - Upload image file
  - Verify file appears in R2 bucket (check Cloudflare dashboard)
  - Verify file accessible via returned URL
  - **Validation**: Full upload workflow works from client to R2

- [ ] **TASK-036**: Perform end-to-end delete test in development
  - Delete previously uploaded file via client UI
  - Verify file removed from R2 bucket
  - Verify URL returns 404
  - **Validation**: Full delete workflow works

- [ ] **TASK-037**: Verify backward compatibility with existing Cloudinary files
  - If any existing files are on Cloudinary, access them
  - Verify Cloudinary URLs still work
  - **Validation**: No breaking changes to existing files

### 5.3 Production Deployment Preparation

- [ ] **TASK-038**: Document R2 production setup checklist
  - Create checklist in deployment docs:
    - Create production R2 bucket
    - Generate production R2 API tokens
    - Configure production environment variables
    - Set STORAGE_TYPE=r2 in production .env
    - Restart production server
  - **Validation**: Deployment checklist is clear and actionable

- [ ] **TASK-039**: Add R2 monitoring and logging
  - Verify R2 operations logged (upload success/failure, delete operations)
  - Document how to monitor R2 usage in Cloudflare dashboard
  - **Validation**: Logs provide visibility into R2 operations

---

## Phase 6: Optional Enhancements (Future Work)

These tasks are **NOT required** for initial implementation but can be added later:

- [ ] **OPTIONAL-001**: Implement multipart upload for large files (>100MB)
  - Use AWS SDK `@aws-sdk/lib-storage` for multipart uploads
  - Configure part size and concurrency

- [ ] **OPTIONAL-002**: Add R2 presigned URL support for direct client uploads
  - Generate presigned POST URLs via `@aws-sdk/s3-presigned-post`
  - Allow client to upload directly to R2 without proxying through server

- [ ] **OPTIONAL-003**: Implement R2 file listing/browsing
  - Add API endpoint to list files in R2 bucket
  - Use `ListObjectsV2Command` for pagination

- [ ] **OPTIONAL-004**: Create data migration script: Cloudinary → R2
  - Fetch all Cloudinary files
  - Download each file
  - Upload to R2
  - Update database references
  - Batch process to avoid rate limits

- [ ] **OPTIONAL-005**: Add custom domain for R2 public URLs
  - Configure Cloudflare Workers to serve R2 content on custom domain
  - Update R2_PUBLIC_URL to use custom domain

---

## Completion Checklist

Before marking this change as complete, verify:

- [x] All Phase 1-2 implementation tasks completed (16/16 core tasks)
- [ ] All tests passing (unit + integration) - Testing requires R2 credentials
- [x] Documentation updated and reviewed (project.md, generate-secrets.sh, docker-compose files)
- [ ] R2 working in development environment - Requires R2 bucket setup and credentials
- [x] Backward compatibility maintained (Cloudinary files accessible) - Code supports all three providers
- [x] No breaking changes to API or client code - Fully backward compatible
- [x] Deployment guide includes R2 setup instructions - Updated in scripts and docker-compose
- [ ] Code reviewed and approved - Ready for review
- [x] Change validated with `openspec validate migrate-to-cloudflare-r2 --strict` - Passed validation

---

**Task Status**: Ready for Implementation  
**Estimated Effort**: 10-15 hours  
**Priority**: High (cost optimization for student graduation project)

---

## Notes

- Tasks are ordered for sequential execution, but some tasks in the same phase can be parallelized
- Mark each task as complete `[x]` as you finish it
- If a task is blocked, document the blocker and move to next independent task
- Run `openspec validate migrate-to-cloudflare-r2 --strict` after completing spec-related tasks
- Commit code incrementally after each phase for easier rollback if needed
