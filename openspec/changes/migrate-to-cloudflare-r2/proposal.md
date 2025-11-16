# Proposal: Migrate to Cloudflare R2

**Change ID**: `migrate-to-cloudflare-r2`  
**Status**: Draft  
**Created**: 2025-11-16  
**Author**: AI Assistant

---

## Overview

Migrate the restaurant management system's file storage from Cloudinary to Cloudflare R2 as the primary cloud storage provider. Cloudinary will be marked as outdated/deprecated but retained temporarily for backward compatibility during the transition period. This migration aims to reduce operational costs while maintaining reliable, scalable file storage suitable for a student graduation project.

## Motivation

### Why Migrate?

1. **Cost Optimization for Student Project**
   - Cloudinary free tier: 25GB storage, 25GB bandwidth/month
   - Cloudflare R2: $0.015/GB storage, **ZERO egress fees** (no bandwidth charges)
   - For a graduation project expected to grow, R2 offers significant cost savings
   - R2's pricing model is more predictable and student-budget friendly

2. **Modern Infrastructure**
   - R2 is S3-compatible, following industry-standard APIs
   - Better alignment with modern cloud-native architectures
   - Easier to migrate to other S3-compatible providers if needed

3. **Scalability & Performance**
   - R2 is globally distributed with Cloudflare's edge network
   - No bandwidth costs enables unlimited content delivery
   - Better suited for a production-ready graduation project

4. **Learning Opportunity**
   - Students gain experience with S3-compatible object storage
   - Industry-relevant skills (S3 API is widely used)
   - Understanding of cloud storage migration patterns

### Why Keep Cloudinary Temporarily?

- Existing uploaded files may still reference Cloudinary URLs
- Provides fallback during migration period
- Allows gradual transition without breaking existing functionality
- Can be fully removed in a future phase after data migration

## Scope

### In Scope

1. **Backend Storage Provider**
   - Implement new `R2StorageProvider` class
   - Update `StorageManager` to support R2
   - Update storage type enum to include 'r2'
   - Configure R2 credentials and bucket settings

2. **Configuration**
   - Add R2 environment variables (account ID, bucket name, access keys)
   - Update storage switching logic to prioritize R2
   - Set R2 as default storage type in production

3. **Documentation**
   - Update FILE_STORAGE_GUIDE.md with R2 setup instructions
   - Mark Cloudinary sections as "Outdated/Legacy"
   - Document R2 migration steps
   - Update deployment documentation with R2 configuration

4. **Testing**
   - Test R2 upload/delete operations
   - Verify fallback mechanism still works
   - Test runtime provider switching between R2/Local/Cloudinary

### Out of Scope

1. **Data Migration** - Existing Cloudinary files will remain on Cloudinary (migration can be done manually or in a future phase)
2. **Cloudinary Removal** - Cloudinary provider code will be marked as deprecated but not deleted
3. **Frontend Changes** - No changes to client upload UI/components needed
4. **Image Transformations** - R2 stores raw files; image processing (if needed) would be separate concern

## Affected Capabilities

- **file-storage**: Primary capability affected - adding R2 as new storage provider

## Dependencies

- No dependencies on other changes
- Requires Cloudflare account with R2 enabled
- Requires AWS SDK (or Cloudflare's S3-compatible client) for R2 integration

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| R2 API compatibility issues | Medium | Use well-tested S3-compatible SDK (aws-sdk or @aws-sdk/client-s3) |
| Configuration complexity | Low | Provide clear documentation and environment variable templates |
| Existing file URL breakage | Low | Keep Cloudinary provider active as fallback |
| Unexpected R2 costs | Low | R2 has predictable pricing; monitor usage via Cloudflare dashboard |
| Migration learning curve | Low | S3 API is well-documented; provide code examples |

## Success Criteria

1. ✅ New R2 storage provider successfully uploads and deletes files
2. ✅ R2 set as default storage type in environment configuration
3. ✅ Backward compatibility maintained - Cloudinary files still accessible
4. ✅ Documentation updated with R2 setup instructions and Cloudinary marked as outdated
5. ✅ Storage switching works correctly: R2 → Local → Cloudinary fallback
6. ✅ No breaking changes to existing API endpoints or client code

## Timeline Estimate

- **Design & Setup**: 2-3 hours (R2 account setup, SDK research)
- **Implementation**: 4-6 hours (R2Provider class, testing, integration)
- **Documentation**: 2-3 hours (update guides, add examples)
- **Testing & Validation**: 2-3 hours (end-to-end testing, edge cases)

**Total**: 10-15 hours for a single developer

## Future Considerations

1. **Phase 2: Data Migration Tool** - Script to migrate existing Cloudinary files to R2
2. **Phase 3: Remove Cloudinary** - Complete removal of Cloudinary provider after all files migrated
3. **Image Optimization** - Consider adding Cloudflare Images or custom transformation pipeline
4. **Backup Strategy** - Implement automated R2 bucket backups
5. **CDN Integration** - Leverage Cloudflare CDN for R2 content delivery

## Open Questions

1. Should we implement automatic URL rewriting for old Cloudinary URLs during transition?
   - **Recommendation**: No, keep it simple. Old URLs continue to work via Cloudinary provider.

2. Do we need image transformations (resize, crop, format conversion)?
   - **Recommendation**: R2 stores raw files. If needed, add transformation layer separately (future work).

3. Should we implement a migration script in this change?
   - **Recommendation**: No, keep this change focused on R2 provider implementation. Migration can be separate task.

4. What's the R2 bucket structure?
   - **Recommendation**: Mirror current folder structure: `restaurant/menu/`, `restaurant/staff/`, etc.

## Approval

- [ ] Technical Lead Review
- [ ] Architecture Review (if needed)
- [ ] Security Review (R2 credentials handling)
- [ ] Documentation Review

---

**Next Steps**: After approval, proceed to implementation following the tasks outlined in `tasks.md`.
