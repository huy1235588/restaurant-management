# Capability: File Storage

**Capability ID**: `file-storage`  
**Change**: `migrate-to-cloudflare-r2`

---

## ADDED Requirements

### Requirement: Cloudflare R2 Storage Provider Implementation

The system SHALL implement a new storage provider for Cloudflare R2 object storage that follows the existing `StorageProvider` interface contract.

**Rationale**: Enables file uploads to Cloudflare R2 as a cost-effective, S3-compatible cloud storage solution suitable for student graduation projects with predictable, low operational costs.

**Acceptance Criteria**:
- R2StorageProvider class implements all StorageProvider interface methods (upload, delete, isAvailable, getName)
- Uses AWS SDK v3 (@aws-sdk/client-s3) for S3-compatible API operations
- Properly handles R2 authentication using access key ID and secret access key
- Returns standardized StorageUploadResult and StorageDeleteResult objects

#### Scenario: Upload image file to R2 menu folder

**Given** the storage type is configured as 'r2'  
**And** R2 credentials are valid  
**And** the user uploads a 2MB JPEG image with folder='menu'  
**When** the upload method is called  
**Then** the file SHALL be uploaded to R2 bucket with key `restaurant/menu/{filename}`  
**And** the method SHALL return a public R2 URL (e.g., `https://pub-xxxxx.r2.dev/restaurant/menu/...`)  
**And** the returned StorageUploadResult SHALL include filename, originalName, path, size, mimetype, and url

#### Scenario: Delete file from R2

**Given** a file exists in R2 with path 'r2://restaurant/menu/photo_123.jpg'  
**When** the delete method is called with this path  
**Then** the file SHALL be removed from the R2 bucket  
**And** the method SHALL return success: true with appropriate message  
**And** subsequent download attempts SHALL return 404

#### Scenario: Check R2 availability

**Given** R2 is configured and accessible  
**When** isAvailable() is called  
**Then** the method SHALL attempt a HeadBucket operation  
**And** SHALL return true if R2 responds successfully  
**And** SHALL return false if R2 is unreachable or credentials are invalid

---

### Requirement: R2 Configuration Management

The system SHALL support configuration of Cloudflare R2 credentials and settings through environment variables.

**Rationale**: Separates configuration from code, follows 12-factor app principles, and allows different R2 buckets for dev/staging/production environments.

**Acceptance Criteria**:
- Environment variables defined for R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL
- Configuration module exports R2 settings in structured format
- R2Provider validates required environment variables during initialization
- Logs warning if R2 credentials are missing (but doesn't crash the application)

#### Scenario: Initialize R2 with valid credentials

**Given** environment variables are set correctly:
```
R2_ACCOUNT_ID=abc123
R2_BUCKET_NAME=restaurant-files
R2_ACCESS_KEY_ID=key123
R2_SECRET_ACCESS_KEY=secret456
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```
**When** the R2StorageProvider is instantiated  
**Then** it SHALL initialize the S3 client with R2 endpoint  
**And** SHALL log "R2 initialized successfully"  
**And** isInitialized flag SHALL be true

#### Scenario: Handle missing R2 configuration gracefully

**Given** R2_ACCOUNT_ID environment variable is not set  
**When** the R2StorageProvider is instantiated  
**Then** it SHALL log a warning "R2 not configured. Set R2_ACCOUNT_ID environment variable"  
**And** isInitialized SHALL be false  
**And** subsequent upload attempts SHALL fail with clear error message

---

### Requirement: Storage Manager R2 Integration

The StorageManager SHALL be updated to support R2 as a storage provider option with appropriate fallback logic.

**Rationale**: Integrates R2 into existing storage abstraction layer, maintains backward compatibility, and provides resilient multi-provider fallback.

**Acceptance Criteria**:
- StorageManager.getProvider() handles 'r2' storage type
- Default storage type can be set to 'r2' via STORAGE_TYPE environment variable
- R2 is prioritized as primary provider when configured
- Fallback chain supports: R2 → Local → Cloudinary (legacy)

#### Scenario: Use R2 as primary storage provider

**Given** STORAGE_TYPE environment variable is set to 'r2'  
**And** R2 is available  
**When** StorageManager uploads a file  
**Then** it SHALL use R2StorageProvider as the primary provider  
**And** the file SHALL be stored in the R2 bucket  
**And** SHALL NOT attempt fallback to Local or Cloudinary

#### Scenario: Fallback to Local when R2 unavailable

**Given** STORAGE_TYPE is 'r2'  
**And** R2.isAvailable() returns false (e.g., network issue)  
**When** StorageManager uploads a file  
**Then** it SHALL log "Primary provider (r2) not available, using fallback"  
**And** SHALL attempt upload using Local storage provider  
**And** the file SHALL be stored in local uploads/ directory

#### Scenario: Switch storage provider to R2 at runtime

**Given** the current storage type is 'local'  
**When** an admin calls storageManager.switchProvider('r2')  
**And** R2 is available  
**Then** the primary provider SHALL be updated to R2StorageProvider  
**And** subsequent uploads SHALL use R2  
**And** the API SHALL return success with updated provider status

---

### Requirement: File Path and URL Handling for R2

The system SHALL implement consistent file path and URL conventions for R2-stored files to enable proper identification and deletion.

**Rationale**: Enables the storage manager to correctly route delete operations to the appropriate provider based on file path patterns.

**Acceptance Criteria**:
- R2 file paths use 'r2://' prefix OR public R2 URL format
- StorageManager.delete() detects R2 paths and routes to R2Provider
- Upload operations return R2 public URLs in standardized format
- Client code can distinguish R2, Cloudinary, and Local files by path/URL

#### Scenario: Identify and delete R2 file by path

**Given** a file was uploaded to R2 with path 'r2://restaurant/menu/photo.jpg'  
**When** the delete endpoint is called with filePath='r2://restaurant/menu/photo.jpg'  
**Then** StorageManager SHALL detect the 'r2://' prefix  
**And** SHALL route the delete operation to R2StorageProvider  
**And** SHALL call R2.delete() with the extracted object key  
**And** the file SHALL be removed from R2

#### Scenario: Identify R2 file by public URL

**Given** a file exists with URL 'https://pub-xxxxx.r2.dev/restaurant/menu/photo.jpg'  
**When** the delete endpoint is called with this URL  
**Then** StorageManager SHALL detect the R2 public URL pattern  
**And** SHALL extract the object key 'restaurant/menu/photo.jpg'  
**And** SHALL delete the file from R2

---

### Requirement: Folder Structure Mapping for R2

The system SHALL map application folder names to R2 object key prefixes following the existing convention.

**Rationale**: Maintains organizational structure in R2 bucket consistent with current Local/Cloudinary implementation, simplifying migration and management.

**Acceptance Criteria**:
- Folder parameter values (temp, menu, staff, documents, images, others) map to R2 key prefixes
- R2 keys follow pattern: `restaurant/{folder}/{filename}`
- Folder mapping is consistent with existing Cloudinary folder mapping
- Invalid folder names default to 'restaurant/temp'

#### Scenario: Upload to menu folder creates correct R2 key

**Given** a file is uploaded with folder='menu' and filename='dish_123.jpg'  
**When** R2Provider.upload() is called  
**Then** the R2 object key SHALL be 'restaurant/menu/dish_123.jpg'  
**And** the file SHALL be stored at this key in the R2 bucket  
**And** the public URL SHALL be 'https://pub-xxxxx.r2.dev/restaurant/menu/dish_123.jpg'

#### Scenario: Default to temp folder for unspecified folder

**Given** a file is uploaded with folder=undefined  
**When** R2Provider.upload() is called  
**Then** the R2 object key SHALL be 'restaurant/temp/{filename}'  
**And** the file SHALL be stored in the temp prefix

---

## MODIFIED Requirements

### Requirement: Storage Type Enumeration

The system SHALL support storage types 'local', 'cloudinary', and 'r2', where 'cloudinary' is marked as legacy/outdated.

**Original Behavior**: The system supports storage types 'local' and 'cloudinary'

**Modified Behavior**: Extended to include 'r2' as a third storage type option.

**Rationale**: Extends storage type options to include R2 while maintaining backward compatibility with existing Cloudinary files.

**Changes**:
- Update `StorageType` type definition from `'local' | 'cloudinary'` to `'local' | 'cloudinary' | 'r2'`
- Update storage controller validation to accept 'r2' as valid provider
- Update API documentation to list 'r2' as available storage type
- Mark 'cloudinary' in documentation comments as "Legacy/Outdated"

#### Scenario: Accept R2 as valid storage type in API

**Given** the storage switch endpoint receives a request  
**When** the request body contains `{ "provider": "r2" }`  
**Then** the API SHALL accept 'r2' as a valid provider value  
**And** SHALL NOT return "Invalid provider" error  
**And** SHALL attempt to switch to R2 storage provider

#### Scenario: Reject invalid storage type

**Given** the storage switch endpoint receives a request  
**When** the request body contains `{ "provider": "s3" }`  
**Then** the API SHALL reject the request  
**And** SHALL return 400 error with message "Invalid provider. Must be 'local', 'cloudinary', or 'r2'"

---

### Requirement: Provider-Specific Delete Routing

StorageManager SHALL route delete operations to Local, Cloudinary, OR R2 provider based on path prefix or URL pattern.

**Original Behavior**: StorageManager routes delete operations to Local or Cloudinary provider based on path prefix

**Modified Behavior**: Extended to support R2 path detection and routing.

**Rationale**: Extends delete routing logic to handle R2 files alongside existing Local and Cloudinary files.

**Changes**:
- Add R2 path detection: 'r2://' prefix OR R2 public URL pattern
- Update delete method to check for R2 paths before Cloudinary/Local
- Ensure backward compatibility with existing Cloudinary ('cloudinary://') and Local ('uploads/') paths

#### Scenario: Route R2 delete correctly

**Given** a delete request with filePath='r2://restaurant/menu/photo.jpg'  
**When** StorageManager.delete() is called  
**Then** it SHALL detect R2 path pattern  
**And** SHALL call R2StorageProvider.delete()  
**And** SHALL NOT attempt Cloudinary or Local delete

#### Scenario: Maintain Cloudinary delete routing

**Given** a delete request with filePath='cloudinary://restaurant/menu/abc123'  
**When** StorageManager.delete() is called  
**Then** it SHALL detect Cloudinary path pattern  
**And** SHALL call CloudinaryStorageProvider.delete()  
**And** R2 and Local providers SHALL NOT be invoked

---

### Requirement: Storage Configuration Structure

Configuration SHALL include storageType and R2 settings, with cloudinary marked as legacy.

**Original Behavior**: Configuration includes storageType and cloudinary settings

**Modified Behavior**: Added R2 configuration object with all required fields.

**Rationale**: Adds R2 configuration structure while preserving existing Cloudinary config for backward compatibility.

**Changes**:
- Add `r2` configuration object with accountId, bucketName, accessKeyId, secretAccessKey, publicUrl fields
- Keep existing `cloudinary` configuration (marked as legacy in comments)
- Update storageType default recommendation to 'r2' for production

#### Scenario: Load R2 configuration from environment

**Given** environment variables are set for R2  
**When** the application configuration is loaded  
**Then** config.r2.accountId SHALL equal process.env.R2_ACCOUNT_ID  
**And** config.r2.bucketName SHALL equal process.env.R2_BUCKET_NAME  
**And** config.r2.accessKeyId SHALL equal process.env.R2_ACCESS_KEY_ID  
**And** config.r2.secretAccessKey SHALL equal process.env.R2_SECRET_ACCESS_KEY  
**And** config.r2.publicUrl SHALL equal process.env.R2_PUBLIC_URL

---

## REMOVED Requirements

None. No requirements are removed in this change.

---

## RENAMED Requirements

None. No requirements are renamed in this change.

---

## Cross-Capability References

**Related Capabilities**: None (file-storage is self-contained)

**Dependencies**: 
- Requires AWS SDK v3 (@aws-sdk/client-s3) NPM package
- Requires Cloudflare account with R2 enabled and bucket created

**Future Considerations**:
- **data-migration** capability (future): Script to migrate existing Cloudinary files to R2
- **image-optimization** capability (future): Optional image transformation layer for R2-stored images

---

## Migration Notes

### Breaking Changes
None. This change is **backward compatible**. Existing Cloudinary files continue to work.

### Deprecation Notices
- **Cloudinary Provider**: Marked as legacy/outdated. New uploads should use R2. Cloudinary will be removed in a future version after data migration is complete.

### Data Migration Strategy
1. **Phase 1** (This change): Implement R2, set as default for new uploads
2. **Phase 2** (Future): Create migration script to copy Cloudinary files to R2
3. **Phase 3** (Future): Update database file references from Cloudinary URLs to R2 URLs
4. **Phase 4** (Future): Remove Cloudinary provider code after all files migrated

---

**Spec Status**: Draft  
**Review Required**: Yes  
**Implementation Priority**: High (cost optimization for student project)
