# Deployment Guide

Complete guide for deploying animations to production.

## Pre-Deployment Checklist

Before deploying animations:

- [ ] All 219 animations rendered (or acceptable coverage >95%)
- [ ] QA review completed and animations approved
- [ ] CSV updated with correct CDN URLs
- [ ] Backup of original CSV created
- [ ] Animations optimized (WebP <100 KB, Lottie <50 KB)
- [ ] Sample animations tested in mobile app
- [ ] CDN bucket/service configured
- [ ] DNS/CDN domains configured

## Deployment Options

### Option 1: CDN Hosting (Recommended)

Host animations on CDN for optimal performance and cost.

**Benefits:**
- ✅ Fast global delivery
- ✅ No mobile app bundle bloat
- ✅ Easy to update animations without app release
- ✅ Lower bandwidth costs
- ✅ Caching at edge locations

**Cons:**
- ❌ Requires network connection
- ❌ Initial load delay (mitigated by caching)
- ❌ Additional CDN costs

### Option 2: Local Bundling

Bundle animations directly in mobile app.

**Benefits:**
- ✅ Offline access
- ✅ Instant loading
- ✅ No CDN costs

**Cons:**
- ❌ Larger app bundle size (+6-12 MB)
- ❌ Can't update without app release
- ❌ Longer app install/update time

### Option 3: Hybrid (Recommended)

Combine both approaches for best UX.

**Strategy:**
- Bundle 20-30 most common exercises locally
- Load remaining 189 from CDN
- Pre-cache favorites/recent exercises
- Fallback to local if CDN fails

## Step-by-Step Deployment

### Step 1: Prepare Animations

```bash
cd animation-pipeline

# Generate all animations
python src/01_generate_prompts.py
python src/01b_enrich_prompts.py
python src/02_prepare_batch.py

# [Process on RunPod]

python src/03_project_to_2d.py
python src/04_render_webp.py
python src/05_render_lottie.py

# QA review
python src/06_qa_report.py
open output/qa_review.html

# Review and mark any for rework
# If needed, regenerate problematic animations
```

### Step 2: Update CSV

```bash
# Dry run to preview changes
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both \
  --dry-run

# Review the output, verify URLs look correct

# Apply changes
python src/07_update_csv.py \
  --cdn-base https://cdn.intensely.app \
  --update-both

# Verify CSV was updated
head -5 data/exercise_library_master.csv
```

### Step 3: Upload to CDN

**AWS S3 + CloudFront:**

```bash
# Configure AWS CLI (if not already done)
aws configure

# Upload WebP animations
aws s3 sync output/webp/ s3://your-cdn-bucket/animations/ \
  --acl public-read \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "image/webp"

# Upload Lottie animations
aws s3 sync output/lottie/ s3://your-cdn-bucket/animations/ \
  --acl public-read \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "application/json"

# Verify upload
aws s3 ls s3://your-cdn-bucket/animations/ | wc -l
# Should show ~438 files (219 WebP + 219 JSON)

# Test access
curl -I https://cdn.intensely.app/animations/push-up.webp
# Should return 200 OK with correct content-type
```

**Cloudflare R2:**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Upload animations
wrangler r2 object put intensely-cdn/animations/push-up.webp \
  --file output/webp/push-up.webp

# Or use rclone for bulk upload
rclone sync output/webp/ cloudflare:intensely-cdn/animations/
rclone sync output/lottie/ cloudflare:intensely-cdn/animations/
```

**Vercel Blob Storage:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Upload via script (see scripts/upload_to_vercel.sh)
./scripts/upload_to_vercel.sh
```

**Google Cloud Storage:**

```bash
# Upload animations
gsutil -m cp -r output/webp/* gs://your-cdn-bucket/animations/
gsutil -m cp -r output/lottie/* gs://your-cdn-bucket/animations/

# Set cache control
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://your-cdn-bucket/animations/*

# Make public
gsutil -m acl ch -u AllUsers:R gs://your-cdn-bucket/animations/*
```

### Step 4: Verify CDN Deployment

```bash
# Test a few URLs
curl -I https://cdn.intensely.app/animations/push-up.webp
curl -I https://cdn.intensely.app/animations/squat.webp
curl -I https://cdn.intensely.app/animations/burpee.json

# Check all URLs from CSV
cat data/exercise_library_master.csv | \
  grep -o 'https://[^,]*' | \
  head -10 | \
  xargs -I {} curl -o /dev/null -s -w "%{http_code} {}\n" {}

# All should return 200
```

### Step 5: Deploy Updated CSV to Backend

```bash
# Copy updated CSV to backend seed data
cp data/exercise_library_master.csv ../backend/prisma/seed/

# Or update database directly
cd ../backend
npx prisma db seed

# Verify database has new URLs
npx prisma studio
# Check exercise table, animationUrl column
```

### Step 6: Test in Mobile App

```bash
cd ../mobile

# Pull latest backend changes
git pull

# Install dependencies (if needed)
npm install

# Run on device (not simulator for best results)
npx expo run:ios --device
# Or
npx expo run:android --device

# Test checklist:
# - [ ] Animations load from CDN
# - [ ] Animations play smoothly
# - [ ] Transparent backgrounds work
# - [ ] Loading states show correctly
# - [ ] Offline fallback works (if implemented)
# - [ ] No console errors
```

### Step 7: Deploy to Production

```bash
# Tag release
git tag -a v1.0.0-animations -m "Add 219 exercise animations"
git push origin v1.0.0-animations

# Deploy backend
cd ../backend
git push production main

# Build and deploy mobile app
cd ../mobile
eas build --platform all --profile production
eas submit --platform all
```

## CDN Configuration

### Cache Headers

Set appropriate cache headers for long-term caching:

```
Cache-Control: public, max-age=31536000, immutable
```

**Why:**
- `public` - Can be cached by CDN and browsers
- `max-age=31536000` - Cache for 1 year
- `immutable` - Content never changes (safe to cache aggressively)

### Content Types

Ensure correct MIME types:

- WebP: `image/webp`
- Lottie: `application/json`

### CORS Headers

If serving from different domain, enable CORS:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### Compression

Enable gzip/brotli compression:

```
Content-Encoding: br
```

**Benefits:**
- Lottie JSON: ~40% smaller with brotli
- WebP: Already compressed (no benefit)

## Monitoring & Maintenance

### CDN Analytics

Monitor CDN metrics:

- Request count per animation
- Cache hit ratio (aim for >95%)
- Bandwidth usage
- Error rates (should be <0.1%)
- Average latency (aim for <100ms)

### Cost Tracking

Estimate costs:

**AWS S3 + CloudFront:**
- Storage: 10 MB × $0.023/GB = $0.0002/month
- Requests: 1M requests × $0.0004/1K = $400/month
- Data transfer: 10 GB × $0.085/GB = $0.85/month
- **Total: ~$401/month** (at 1M views/month)

**Cloudflare R2:**
- Storage: 10 MB × $0.015/GB = $0.0001/month
- Requests: Unlimited free
- Data transfer: Free
- **Total: ~$0.00/month** (much cheaper!)

### Update Workflow

When updating animations:

```bash
# 1. Regenerate specific animations
python src/04_render_webp.py --limit 5

# 2. QA review updated animations
python src/06_qa_report.py

# 3. Upload only changed files
aws s3 sync output/webp/ s3://your-cdn-bucket/animations/ \
  --exclude "*" \
  --include "push-up.webp" \
  --include "squat.webp"

# 4. Invalidate CDN cache
aws cloudfront create-invalidation \
  --distribution-id EDFDVBD6EXAMPLE \
  --paths "/animations/push-up.webp" "/animations/squat.webp"

# 5. No app update needed (animations load from CDN)
```

## Rollback Procedure

If animations cause issues:

### Quick Rollback (CDN)

```bash
# Revert to previous CSV
cp data/exercise_library_master.csv.backup data/exercise_library_master.csv

# Redeploy CSV to backend
cd ../backend
npx prisma db seed

# No need to remove files from CDN
# Just update CSV to point to old URLs or remove URLs
```

### Full Rollback

```bash
# Remove animations from CDN
aws s3 rm s3://your-cdn-bucket/animations/ --recursive

# Revert database
cd ../backend
git revert HEAD
git push production main

# Invalidate CDN cache
aws cloudfront create-invalidation \
  --distribution-id EDFDVBD6EXAMPLE \
  --paths "/animations/*"
```

## Troubleshooting

### Animations not loading

**Check:**
1. CDN URLs in CSV are correct
2. CDN files are public/accessible
3. CORS headers enabled
4. Network connectivity
5. Console errors in app

**Debug:**
```bash
# Test URL directly
curl -I https://cdn.intensely.app/animations/push-up.webp

# Check CORS
curl -H "Origin: https://intensely.app" \
  -H "Access-Control-Request-Method: GET" \
  -I https://cdn.intensely.app/animations/push-up.webp

# Check from mobile app
# Add console.log(exercise.animationUrl) in app code
```

### Slow loading

**Solutions:**
- Enable CDN caching
- Use brotli compression for Lottie
- Pre-cache common animations
- Reduce file sizes (more aggressive optimization)
- Use WebP instead of Lottie (faster decode)

### High CDN costs

**Solutions:**
- Switch to Cloudflare R2 (free egress)
- Implement client-side caching
- Bundle most common exercises locally
- Compress Lottie JSON more aggressively

### Cache invalidation issues

**Solution:**
```bash
# Invalidate all animations
aws cloudfront create-invalidation \
  --distribution-id EDFDVBD6EXAMPLE \
  --paths "/animations/*"

# Wait for invalidation to complete
aws cloudfront wait invalidation-completed \
  --distribution-id EDFDVBD6EXAMPLE \
  --id INVALIDATION_ID
```

## Best Practices

1. **Use version hashes**: Append `?v=hash` to URLs for cache busting
2. **Progressive loading**: Load placeholder → low-res → full animation
3. **Lazy loading**: Only load animations when exercise is viewed
4. **Pre-caching**: Cache user's favorite exercises
5. **Offline fallback**: Show static image if CDN fails
6. **Analytics**: Track which animations are most viewed
7. **A/B testing**: Test WebP vs Lottie performance
8. **Compression**: Enable brotli for Lottie JSON
9. **CDN redundancy**: Use multiple CDN providers as fallback
10. **Monitoring**: Alert on CDN errors or high costs

## Production Checklist

Before marking deployment complete:

- [ ] All 219 animations uploaded to CDN
- [ ] CSV updated with correct URLs
- [ ] Backend database updated
- [ ] Mobile app tested on physical devices
- [ ] iOS and Android both working
- [ ] Animations load within 2 seconds
- [ ] No console errors
- [ ] CDN caching configured (>95% hit rate)
- [ ] CORS headers enabled
- [ ] Analytics/monitoring setup
- [ ] Cost tracking enabled
- [ ] Rollback procedure documented
- [ ] Team trained on update workflow

---

**Congratulations!** Your animations are now live and ready for millions of users. 🎉
