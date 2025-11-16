# Design: Migrate to Cloudflare R2

**Change ID**: `migrate-to-cloudflare-r2`

---

## Architecture Overview

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Storage Manager                        │
│  - Manages storage provider selection                    │
│  - Implements fallback logic                             │
│  - Supports runtime provider switching                   │
└────────────┬────────────────────────────────────────────┘
             │
             │ Uses StorageProvider interface
             │
     ┌───────┴────────┐
     │                │
┌────▼─────┐    ┌────▼──────────┐
│  Local   │    │  Cloudinary   │
│ Provider │    │   Provider    │
└──────────┘    └───────────────┘
```

### Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Storage Manager                        │
│  - Enhanced to support 3 providers                       │
│  - Priority: R2 (primary) → Local → Cloudinary (legacy) │
│  - Implements fallback chain                             │
└────────────┬────────────────────────────────────────────┘
             │
             │ Uses StorageProvider interface
             │
     ┌───────┴────────┬──────────────┐
     │                │              │
┌────▼─────┐    ┌────▼─────┐   ┌───▼────────────┐
│  Local   │    │    R2    │   │  Cloudinary    │
│ Provider │    │ Provider │   │ (DEPRECATED)   │
└──────────┘    └──────────┘   └────────────────┘
                     │
                     │ S3-compatible API
                     │
            ┌────────▼───────────┐
            │  Cloudflare R2     │
            │  Object Storage    │
            │  - Global CDN      │
            │  - Zero egress     │
            │  - S3-compatible   │
            └────────────────────┘
```

---

## Component Design

### 1. R2 Storage Provider

**Class**: `R2StorageProvider`  
**File**: `app/server/src/features/storage/services/storage/r2.storage.ts`

```typescript
/**
 * Cloudflare R2 Storage Provider
 * Implements S3-compatible storage using AWS SDK
 */
export class R2StorageProvider implements StorageProvider {
    private s3Client: S3Client;
    private bucketName: string;
    private isInitialized: boolean = false;
    private publicUrl: string; // e.g., https://pub-xxxxx.r2.dev

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        // Initialize AWS S3 client with R2 endpoint
        // Use credentials from environment variables
    }

    async upload(file: Express.Multer.File, folder?: string): Promise<StorageUploadResult> {
        // Upload to R2 using PutObjectCommand
        // Return public URL
    }

    async delete(filePath: string): Promise<StorageDeleteResult> {
        // Delete from R2 using DeleteObjectCommand
    }

    async isAvailable(): Promise<boolean> {
        // Check R2 connectivity with HeadBucketCommand
    }

    getName(): string {
        return 'r2';
    }
}
```

**Dependencies**:
- `@aws-sdk/client-s3` - AWS SDK v3 for S3-compatible operations
- Uses standard S3 API commands: `PutObjectCommand`, `DeleteObjectCommand`, `HeadBucketCommand`

**Configuration** (Environment Variables):
```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id
R2_BUCKET_NAME=restaurant-files
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 2. Storage Type Extension

**File**: `app/server/src/features/storage/services/storage/storage.interface.ts`

```typescript
// Update StorageType union
export type StorageType = 'local' | 'cloudinary' | 'r2';
```

### 3. Storage Manager Updates

**File**: `app/server/src/features/storage/services/storage/storage.manager.ts`

**Changes**:
1. Import and register R2 provider
2. Update `getProvider()` to handle 'r2' type
3. Update fallback logic: R2 → Local → Cloudinary
4. Update file path detection for R2 URLs (e.g., `r2://` prefix or public URL)

**Fallback Chain Logic**:
```
Primary = R2 (from env STORAGE_TYPE=r2)
  ↓ (if R2 fails or unavailable)
Fallback 1 = Local
  ↓ (if Local fails)
Fallback 2 = Cloudinary (legacy, gradually phased out)
```

### 4. Configuration Updates

**File**: `app/server/src/config/index.ts`

```typescript
export const config = {
    // ... existing config
    storageType: (process.env['STORAGE_TYPE'] || 'local') as 'local' | 'cloudinary' | 'r2',
    r2: {
        accountId: process.env['R2_ACCOUNT_ID'] || '',
        bucketName: process.env['R2_BUCKET_NAME'] || '',
        accessKeyId: process.env['R2_ACCESS_KEY_ID'] || '',
        secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'] || '',
        publicUrl: process.env['R2_PUBLIC_URL'] || '',
    },
};
```

---

## Data Flow

### Upload Flow with R2

```
1. Client uploads file
        │
        ▼
2. Express Multer middleware saves to temp directory
        │
        ▼
3. Upload controller receives file
        │
        ▼
4. Storage Manager checks primary provider (R2)
        │
        ├─── R2 available? ─── YES ──▶ Upload to R2
        │                              │
        │                              ▼
        │                         Delete temp file
        │                              │
        │                              ▼
        │                    Return R2 public URL
        │
        └─── NO ──▶ Try Local fallback
                         │
                         └─── If fails ──▶ Try Cloudinary (legacy)
```

### Delete Flow

```
1. Client sends DELETE request with filePath
        │
        ▼
2. Storage Manager analyzes filePath
        │
        ├─── Starts with "r2://" or R2 public URL? ─── YES ──▶ Delete from R2
        │
        ├─── Starts with "cloudinary://"? ──────────── YES ──▶ Delete from Cloudinary
        │
        └─── Otherwise ─────────────────────────────── Local ─▶ Delete from Local filesystem
```

---

## File Path Convention

To distinguish between providers, file paths will follow these patterns:

| Provider | Path Format | Example |
|----------|-------------|---------|
| **Local** | `uploads/...` | `uploads/menu/file_123.jpg` |
| **Cloudinary** | `cloudinary://...` | `cloudinary://restaurant/menu/abc123` |
| **R2** | `r2://...` or Public URL | `r2://restaurant/menu/file_123.jpg` or `https://pub-xxxxx.r2.dev/menu/file_123.jpg` |

**URL Structure in R2**:
- **Bucket**: `restaurant-files`
- **Key (Object Path)**: `restaurant/menu/file_123.jpg`
- **Public URL**: `https://pub-xxxxx.r2.dev/restaurant/menu/file_123.jpg`

---

## Security Considerations

### 1. Credentials Management

- ✅ Store R2 credentials in environment variables (never in code)
- ✅ Use R2 token authentication with read/write API tokens
- ✅ Rotate tokens periodically (document in deployment guide)
- ✅ Use least-privilege principle (only grant necessary R2 permissions)

### 2. Bucket Access Control

- ✅ Configure R2 bucket as **public-read** for served content
- ✅ Restrict write access to authenticated API tokens only
- ✅ Enable CORS for client-side uploads (if needed in future)

### 3. File Validation

- ✅ Existing middleware validates file types and sizes (no changes needed)
- ✅ R2 provider inherits same validation logic
- ✅ Consider adding virus scanning for production (future enhancement)

---

## Migration Strategy

### Phase 1: Implementation (This Change)
1. Implement R2 provider
2. Add R2 configuration
3. Set R2 as default for new uploads
4. Keep Cloudinary active for existing files

### Phase 2: Data Migration (Future)
1. Create migration script to copy files from Cloudinary to R2
2. Update database references to new R2 URLs
3. Verify all files accessible
4. Run in batches to avoid rate limits

### Phase 3: Deprecation (Future)
1. Mark Cloudinary provider as deprecated
2. Monitor usage, ensure no new uploads to Cloudinary
3. After 6-12 months, remove Cloudinary provider code

---

## Testing Strategy

### Unit Tests
- R2Provider upload/delete operations
- R2 connectivity check (isAvailable)
- URL parsing and detection logic
- Fallback mechanism when R2 unavailable

### Integration Tests
- Full upload flow: Client → API → R2
- Delete operation: API → R2
- Provider switching: R2 ↔ Local ↔ Cloudinary
- Fallback chain execution

### Manual Testing
- Upload various file types (images, documents, videos)
- Delete files and verify removal from R2
- Test with R2 unavailable (simulate network failure)
- Verify existing Cloudinary files still accessible

---

## Performance Considerations

### Upload Performance
- R2 uses S3 multipart uploads for large files (AWS SDK handles automatically)
- Cloudflare's global network ensures low-latency uploads
- Temp file cleanup happens after successful R2 upload (async operation)

### Download Performance
- R2 public URLs served via Cloudflare CDN (automatic edge caching)
- Zero egress costs enable unlimited bandwidth
- Consider enabling Cloudflare Cache-Control headers for optimal caching

### Monitoring
- Log R2 API response times
- Track upload/delete success rates
- Monitor R2 storage usage via Cloudflare dashboard

---

## Rollback Plan

If issues arise with R2 in production:

1. **Immediate**: Switch `STORAGE_TYPE` environment variable to `local` or `cloudinary`
2. **Restart**: Restart server to pick up new storage type
3. **Verify**: Confirm uploads working with fallback provider
4. **Debug**: Investigate R2 issues in logs
5. **Fix & Redeploy**: Correct R2 configuration and redeploy

Rollback is **non-destructive** - existing files on R2 remain intact and accessible.

---

## Documentation Updates

### Files to Update

1. **docs/FILE_STORAGE_GUIDE.md**
   - Add "Cloudflare R2 Storage" section
   - Mark "Cloudinary Storage" as "⚠️ Outdated/Legacy"
   - Update architecture diagrams
   - Add R2 setup instructions

2. **docs/DEPLOYMENT.md** (or deployment docs)
   - Add R2 environment variables setup
   - Document R2 bucket creation steps
   - Add troubleshooting section for R2

3. **scripts/generate-secrets.sh**
   - Add R2 credential prompts
   - Update .env template with R2 variables

4. **README.md** (if applicable)
   - Update technology stack to mention R2
   - Update setup instructions with R2 configuration

5. **openspec/project.md**
   - Update tech stack: Replace "Cloudinary" with "Cloudflare R2 (primary) + Cloudinary (legacy)"

---

## Dependencies & Installation

### NPM Package
```bash
pnpm add @aws-sdk/client-s3
```

**Why AWS SDK?**
- Cloudflare R2 is fully S3-compatible
- AWS SDK v3 is modular, tree-shakeable, and well-maintained
- Industry standard for S3-compatible storage

### Alternative Consideration
- Could use Cloudflare's official R2 client (when available), but AWS SDK is more mature and widely adopted

---

## Cost Analysis (for Student Project)

### Current (Cloudinary Free Tier)
- Storage: 25GB free
- Bandwidth: 25GB/month free
- **Overage Cost**: ~$0.10/GB bandwidth

### After Migration (Cloudflare R2)
- Storage: $0.015/GB/month (~$0.38/month for 25GB)
- Bandwidth: **$0** (zero egress fees)
- API Requests: Class A (writes): $4.50/million, Class B (reads): $0.36/million

**Example Cost for 25GB, 1000 uploads/month, 10k downloads/month**:
- Storage: $0.38
- Uploads: ~$0.005
- Downloads: ~$0.004
- **Total: ~$0.39/month** (vs Cloudinary free tier limit risk)

**Benefit**: Predictable, extremely low cost suitable for student budget.

---

## Open Technical Questions

1. **R2 Bucket Naming Convention**
   - Recommendation: `restaurant-management-prod` (prod), `restaurant-management-dev` (dev)

2. **Folder Structure in R2**
   - Recommendation: Same as current - `restaurant/menu/`, `restaurant/staff/`, etc.

3. **Public URL Strategy**
   - Option A: Use R2 public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)
   - Option B: Use custom domain via Cloudflare Workers
   - **Recommendation**: Start with Option A (simpler), upgrade to custom domain if needed

4. **Content-Type Handling**
   - R2 SDK automatically sets Content-Type based on file extension
   - Verify correct MIME types in response headers

5. **File Naming Strategy**
   - Keep current strategy: `{folder}_{timestamp}_{randomString}.{ext}`
   - R2 keys will mirror this structure

---

**Design Status**: Ready for Implementation  
**Next**: Review design, then proceed to implementation tasks in `tasks.md`
