** This file is outdated. Please only use it for historical context. **

# Exercise Demonstration Media Sourcing Strategy
## Version 1.0 | 2026-01-08

---

## Overview

Strategy for sourcing, managing, and delivering high-quality exercise demonstration media (images, GIFs, videos) for Intensely.

**Guiding Principles:**
- Start with free, public domain content (MVP)
- Prioritize offline capability
- Plan for premium tier with professional GIFs
- Future: custom professional content

---

## Media Requirements

### Media Types

| Type | Purpose | Priority | Size | Format |
|------|---------|----------|------|--------|
| **Thumbnails** | Browse/search results | ⭐⭐⭐ High | <50KB | JPEG/WebP |
| **Static Images** | Exercise details, fallback | ⭐⭐⭐ High | 100-300KB | JPEG/WebP |
| **Animated GIFs** | In-workout demonstration | ⭐⭐ Medium | 500KB-2MB | GIF/WebP |
| **Videos** | Form tutorials (future) | ⭐ Low | 2-10MB | MP4/WebM |

---

## Phase 0: MVP - Free Exercise DB Images

### Source
**Free Exercise DB** (yuhonas/free-exercise-db)
- **License:** Unlicense (Public Domain)
- **Format:** JPEG static images
- **Count:** 800+ exercises with images
- **Repository:** https://github.com/yuhonas/free-exercise-db

### What's Included
- 2 images per exercise (typically start and end positions)
- Good quality, consistent style
- Public domain - can bundle, modify, redistribute

### Implementation Strategy

#### 1. Download & Process
```bash
# Clone repository
git clone https://github.com/yuhonas/free-exercise-db.git

# Extract images and JSON data
cd free-exercise-db
```

#### 2. Image Optimization
```bash
# Compress images for web/mobile
# Use sharp (Node.js) or ImageMagick

# Generate thumbnails (150x150px)
sharp input.jpg -o thumbnail.jpg --resize 150x150

# Optimize full images (800px max width)
sharp input.jpg -o optimized.jpg --resize 800 --quality 85

# Convert to WebP (better compression)
sharp input.jpg -o optimized.webp --resize 800
```

#### 3. Storage Options

**Option A: Bundle with App (Recommended for MVP)**
- Bundle all thumbnails with mobile app
- Lazy load full images on demand
- **Pros:** Instant access, offline-capable, no CDN costs
- **Cons:** Larger app bundle (~20-30MB)

**Option B: CDN Hosting**
- Upload to Cloudflare R2 or AWS S3
- CDN for fast delivery
- **Pros:** Smaller app bundle, easy updates
- **Cons:** Requires internet, CDN costs

**Hybrid Approach (Recommended):**
- Bundle thumbnails with app (~5-10MB)
- Host full images on CDN
- Cache full images after first view
- Fall back to thumbnails if offline

#### 4. Naming Convention
```
exercises/
  thumbnails/
    push-up.webp
    squat.webp
  images/
    push-up-1.webp
    push-up-2.webp
    squat-1.webp
    squat-2.webp
```

---

## Phase 1: Enhanced Media (Post-MVP)

### Option 1: ExerciseDB GIF Integration (Premium Tier)

**Source:** ExerciseDB via RapidAPI
- **License:** Proprietary, subscription required
- **Format:** Animated GIFs
- **Count:** 1,300+ exercises
- **Quality:** Professional, consistent
- **Cost:** $11.99-$17.99/month

#### Implementation
```typescript
// Free users: Static images from Free Exercise DB
// Premium users: Animated GIFs from ExerciseDB

async function getExerciseMedia(exerciseId, userTier) {
  if (userTier === 'premium') {
    // Fetch GIF from ExerciseDB
    const gif = await fetchExerciseDBGif(exerciseId);
    return { type: 'gif', url: gif };
  } else {
    // Use static image from Free Exercise DB
    const image = getLocalExerciseImage(exerciseId);
    return { type: 'image', url: image };
  }
}
```

#### Caching Strategy
**Problem:** ExerciseDB prohibits caching

**Workaround:**
- Cache for 24 hours (reasonable for UX)
- Clear cache on subscription end
- Or: Only fetch during active workout
- Store reference, not actual media

---

### Option 2: Custom GIF Creation

#### Approach A: Source from Open Communities
- Reddit (r/bodyweightfitness)
- YouTube (with permission)
- Wikimedia Commons
- Pexels/Unsplash (limited exercise content)

**Pros:** Free or low-cost
**Cons:** Quality varies, licensing complex, time-intensive

#### Approach B: Create Our Own
- Hire fitness model or trainer
- Professional videographer
- Create high-quality GIFs
- Own all rights

**Investment:**
- 50 exercises: ~$2,000-$5,000
- 200 exercises: ~$8,000-$20,000

**Timeline:** 2-4 weeks for 50 exercises

#### Approach C: User-Generated Content
- Allow users to upload demonstration videos
- Moderation and quality control
- Credit contributors
- Build community

**Pros:** Scalable, community-driven, low cost
**Cons:** Moderation effort, variable quality

---

### Option 3: AI-Generated Animations (Future)

Emerging technology for generating exercise animations:
- Motion capture synthesis
- Pose estimation + animation
- 3D character generation

**Timeline:** 2-3 years for production quality
**Keep monitoring:** RunwayML, Synthesia, motion AI tools

---

## Media Specifications

### Image Specs

| Asset | Dimensions | Format | Quality | Max Size |
|-------|-----------|--------|---------|----------|
| Thumbnail | 150x150px | WebP | 80% | 30KB |
| Mobile Image | 600x600px | WebP | 85% | 150KB |
| Web Image | 1200x1200px | WebP | 90% | 400KB |

### GIF Specs

| Asset | Dimensions | FPS | Colors | Max Size |
|-------|-----------|-----|--------|----------|
| Mobile GIF | 360x360px | 15 | 128 | 1MB |
| Web GIF | 480x480px | 20 | 256 | 2MB |

### Video Specs (Future)

| Asset | Resolution | Format | Bitrate | Max Size |
|-------|-----------|--------|---------|----------|
| Mobile Video | 720p | H.264/MP4 | 2Mbps | 5MB |
| Web Video | 1080p | H.264/MP4 | 4Mbps | 10MB |

---

## CDN & Delivery Strategy

### CDN Provider Options

#### Option 1: Cloudflare R2 (Recommended)
**Pricing:**
- Storage: $0.015/GB/month
- Egress: FREE (unlike S3)
- Operations: $0.36/million reads

**Pros:** No egress fees, fast global CDN, affordable
**Cons:** Newer service (less proven than S3)

**Estimated Cost (MVP):**
- 5GB images: $0.08/month
- 1 million requests: $0.36/month
- **Total:** ~$0.50/month

#### Option 2: AWS S3 + CloudFront
**Pricing:**
- S3 Storage: $0.023/GB/month
- CloudFront: $0.085/GB egress
- Operations: $0.40/million GET requests

**Pros:** Battle-tested, reliable, feature-rich
**Cons:** Egress costs can scale quickly

**Estimated Cost (MVP):**
- 5GB storage: $0.12/month
- 10GB egress: $0.85/month
- 100K requests: $0.04/month
- **Total:** ~$1/month (grows with traffic)

#### Option 3: Vercel/Netlify Blob Storage
**Pricing:** Included in hosting plan

**Pros:** Simple, integrated with deployment
**Cons:** More expensive at scale

---

### Image Delivery Optimization

#### 1. Responsive Images
```html
<picture>
  <source srcset="thumbnail.webp" type="image/webp" media="(max-width: 320px)">
  <source srcset="mobile.webp" type="image/webp" media="(max-width: 768px)">
  <source srcset="web.webp" type="image/webp">
  <img src="fallback.jpg" alt="Exercise name">
</picture>
```

#### 2. Lazy Loading
```typescript
// Only load images when in viewport
<Image
  src={exerciseImage}
  loading="lazy"
  placeholder="blur"
  blurDataURL={thumbnailBase64}
/>
```

#### 3. Caching Headers
```
Cache-Control: public, max-age=31536000, immutable
```
Images never change (versioned URLs), cache forever.

---

## Missing Exercise Media Strategy

### Gap Analysis
After importing Free Exercise DB, we'll have ~800 exercises with images. Based on our research, we need ~40 additional HICT-specific exercises.

**Missing Exercises (Priority):**
1. Shrimp Squats
2. Archer Pull-ups
3. Typewriter Pull-ups
4. Windshield Wipers
5. Dragon Flags
6. Nordic Hamstring Curls
7. Tuck Jumps
8. Bounding
9. Depth Jumps
10. 180-degree Squat Jumps
11. Explosive Step-ups
12. Cossack Squats
13. Curtsy Lunges
14. Towel Hamstring Curls
15. Spiderman Climbers
... (25 more)

### Sourcing Plan for Missing Media

#### Phase 1 (MVP): Placeholder Images
- Use generic icons or illustrations
- AI-generated placeholder images
- Text-only descriptions

#### Phase 2 (Post-MVP): Source Real Media
- Commission custom photography/GIFs
- Partner with fitness influencers
- User contributions

---

## Media Management Workflow

### 1. Ingestion Pipeline

```typescript
// Media ingestion workflow
async function ingestExerciseMedia(exerciseName, sourceImages) {
  // 1. Download source images
  const images = await downloadImages(sourceImages);

  // 2. Optimize & resize
  const thumbnail = await createThumbnail(images[0], { size: 150 });
  const mobile = await resizeImage(images[0], { width: 600 });
  const web = await resizeImage(images[0], { width: 1200 });

  // 3. Convert to WebP
  const thumbnailWebP = await convertToWebP(thumbnail);
  const mobileWebP = await convertToWebP(mobile);
  const webWebP = await convertToWebP(web);

  // 4. Upload to CDN
  const thumbnailUrl = await uploadToCDN(thumbnailWebP, 'thumbnails/');
  const mobileUrl = await uploadToCDN(mobileWebP, 'images/');
  const webUrl = await uploadToCDN(webWebP, 'images/');

  // 5. Update database
  await updateExerciseMedia(exerciseName, {
    thumbnail_url: thumbnailUrl,
    mobile_url: mobileUrl,
    web_url: webUrl
  });
}
```

### 2. Versioning Strategy

**Filename versioning:**
```
push-up-v1.webp
push-up-v2.webp
push-up-v3.webp
```

When updating media:
- Upload new version
- Update database with new URL
- Old URL cached indefinitely (no breaking changes)

---

## Quality Control

### Acceptance Criteria

Every exercise image must:
- [ ] Show clear start/end positions
- [ ] Demonstrate proper form
- [ ] Have good lighting
- [ ] Show full body (or relevant body part)
- [ ] Consistent background style
- [ ] No watermarks (for owned content)
- [ ] Properly licensed

### Review Process
1. Source/create media
2. QA review (check criteria)
3. Optimize & process
4. Upload to staging CDN
5. Test in app
6. Deploy to production CDN
7. Update database

---

## Implementation Timeline

### MVP (Phase 0) - Weeks 1-2
- [ ] Clone Free Exercise DB repository
- [ ] Extract and optimize images
- [ ] Generate thumbnails and WebP versions
- [ ] Set up Cloudflare R2 bucket
- [ ] Upload optimized images to R2
- [ ] Update database with media URLs
- [ ] Test image loading in dev environment

### Post-MVP (Phase 1) - Month 2-3
- [ ] Research ExerciseDB integration feasibility
- [ ] Source/create media for 40 missing exercises
- [ ] Implement premium tier GIF support
- [ ] A/B test static vs. animated demonstrations

### Future (Phase 2) - Month 6+
- [ ] Commission custom professional content (top 100 exercises)
- [ ] Implement user-generated content system
- [ ] Add video tutorials for complex exercises
- [ ] Explore AI-generated animations

---

## Costs Summary

### MVP (Year 1)

| Item | Cost |
|------|------|
| Free Exercise DB | $0 (public domain) |
| Cloudflare R2 Storage (5GB) | $1/month = $12/year |
| Image processing tools | $0 (open-source) |
| Missing exercise media (placeholder) | $0 |
| **Total Year 1** | **~$12** |

### Post-MVP Enhancement Options

| Item | Cost |
|------|------|
| ExerciseDB Pro (GIF integration) | $144/year |
| ExerciseDB Ultra (non-watermarked) | $216/year |
| Custom GIF creation (50 exercises) | $2,000-$5,000 one-time |
| Professional video tutorials (20 exercises) | $5,000-$10,000 one-time |

---

## Monitoring & Analytics

### Key Metrics to Track
- Image load times (P50, P95, P99)
- CDN cache hit rate
- Media bandwidth usage
- User engagement with GIF vs static
- Most viewed exercises

### Optimization Based on Data
- Pre-cache popular exercises
- Upgrade media quality for top exercises
- Archive rarely-viewed exercise media

---

## Legal & Licensing

### Content We Own
- Free Exercise DB content (public domain)
- Custom-created content
- User-generated content (with license)

### Content We License
- ExerciseDB content (subscription)
- Third-party stock images/videos (check license)

### User-Generated Content
**License Agreement:**
"By uploading exercise media, you grant Intensely a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content."

---

## Next Steps

1. ✅ Media sourcing strategy defined
2. ⏭️ Clone Free Exercise DB repository
3. ⏭️ Set up image processing pipeline
4. ⏭️ Create Cloudflare R2 bucket
5. ⏭️ Process and upload images
6. ⏭️ Update database schema with media URLs
7. ⏭️ Test media delivery in app

---

## Resources

- [Free Exercise DB GitHub](https://github.com/yuhonas/free-exercise-db)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [WebP Conversion Guide](https://web.dev/serve-images-webp/)
- [Lazy Loading Images](https://web.dev/lazy-loading-images/)

---

*Version 1.0 | Created: 2026-01-08*
*MVP Strategy: Free Exercise DB images via Cloudflare R2*
*Total Cost Year 1: ~$12*
