** This file is outdated. Please only use it for historical context. **

# Exercise Library API Research
## Research Date: 2026-01-08

---

## Executive Summary

**Recommendation: Free Exercise DB (Primary) + Optional ExerciseDB Integration (Premium)**

The Free Exercise DB offers the best foundation for Intensely:
- Public domain (no licensing concerns)
- 800+ exercises with bodyweight filtering
- Fully cacheable/bundleable (perfect for mobile)
- Zero ongoing costs
- Offline-capable

We can optionally integrate ExerciseDB's professional GIFs for a premium tier later.

---

## Comparison Matrix

| Feature | wger.de | ExerciseDB (RapidAPI) | Free Exercise DB | API Ninjas |
|---------|---------|----------------------|------------------|------------|
| **Total Exercises** | ~500-785 | 1,300-11,000+ | 800+ | 3,000+ |
| **Bodyweight Filter** | Indirect | Direct | Direct | Direct |
| **HIIT/Cardio** | Limited | Cardio category | Basic | Cardio + Plyometrics |
| **Media Type** | Images (PNG) | GIFs + Images + Videos | Images (JPEG) | Text only |
| **GIF Animations** | No | Yes (High quality) | No | No |
| **API or Static** | REST API | REST API | Static JSON | REST API |
| **Caching Allowed** | Yes | **NO** | Yes | Check terms |
| **License** | AGPLv3 (restrictive) | Proprietary | **Public Domain** | Proprietary |
| **Cost** | Free | $0-$29.99/month | **$0 forever** | Freemium |
| **Offline Capable** | With self-hosting | **No** | **Yes** | No |
| **Best For** | Full platform | Professional GIFs | **Offline/bundled apps** | HIIT focus |

---

## 1. wger.de API

### Pros
- Free and open-source
- Well-documented REST API
- Self-hostable with Docker
- ~500-785 exercises
- Multi-language support

### Cons
- **AGPLv3 license requires source code disclosure** for commercial apps
- Smaller exercise database
- No GIF animations
- Community-contributed media (variable quality)

### Best For
- Open-source projects
- Self-hosted solutions
- Projects comfortable with AGPLv3 copyleft

---

## 2. ExerciseDB (RapidAPI)

### Pros
- Largest database (1,300-11,000+ exercises)
- Professional-quality GIFs
- Excellent filtering (bodyweight, target muscles, etc.)
- Comprehensive taxonomy
- Step-by-step instructions

### Cons
- **No caching allowed** (must fetch fresh every time)
- Expensive at scale ($11.99-$29.99/month)
- Free tier very limited (23 requests/day)
- Requires constant internet connectivity
- Watermarked media on lower tiers

### Pricing
- **Basic (Free)**: 690 req/month, 180px GIFs, watermarked
- **Pro**: $11.99/month, 2,300 req/month, 180-360px GIFs
- **Ultra**: $17.99/month, 8,625 req/month, all resolutions, non-watermarked
- **Mega**: $29.99/month, 28,750 req/month

### Best For
- Premium web apps with reliable connectivity
- Apps prioritizing professional GIF quality
- Projects with budget for ongoing API costs

---

## 3. Free Exercise DB ⭐ RECOMMENDED

### Pros
- **Public domain (Unlicense) - zero licensing concerns**
- **Fully cacheable/bundleable**
- **No ongoing costs**
- **Offline-capable**
- 800+ exercises
- Bodyweight filtering via equipment field
- Difficulty levels (beginner, intermediate, advanced)
- Primary + secondary muscles
- Step-by-step instructions
- Clean JSON format

### Cons
- No GIF animations (static images only)
- Smaller dataset than ExerciseDB
- Some duplicate exercises
- No API (just static JSON files)

### Data Structure
```json
{
  "id": "Alternate_Incline_Dumbbell_Curl",
  "name": "Alternate Incline Dumbbell Curl",
  "force": "pull",
  "level": "beginner|intermediate|advanced",
  "mechanic": "isolation|compound",
  "equipment": "dumbbell|barbell|body weight|etc",
  "primaryMuscles": ["biceps"],
  "secondaryMuscles": ["forearms"],
  "instructions": ["Step 1...", "Step 2..."],
  "category": "strength|cardio|stretching",
  "images": ["path/0.jpg", "path/1.jpg"]
}
```

### Access
- GitHub: https://github.com/yuhonas/free-exercise-db
- Browse: https://yuhonas.github.io/free-exercise-db/
- Download entire dataset as JSON
- Clone repo for images

### Best For
- Mobile apps requiring offline functionality
- Budget-conscious projects
- Apps wanting full data control
- Projects planning to add custom GIFs later

---

## 4. API Ninjas Exercises API

### Pros
- 3,000+ exercises
- **Plyometrics category** (perfect for HIIT)
- Cardio, strength, stretching categories
- Difficulty levels
- Good HIIT coverage

### Cons
- No visual media (text/instructions only)
- Freemium pricing (check current rates)
- Online-only

### Best For
- HIIT-focused applications
- Apps prioritizing exercise variety over visuals
- Projects comfortable with text-only instructions

---

## Implementation Strategy

### Phase 1: Foundation (Recommended)
1. **Download Free Exercise DB** entire dataset
2. **Filter for bodyweight exercises** during build time
3. **Bundle JSON + images** with the app
4. **Self-host images** on CDN for faster loading
5. **Zero runtime API dependencies**

**Benefits:**
- Instant offline functionality
- No API costs
- Fast performance (no network calls)
- Full data control

### Phase 2: Enhancement (Optional)
1. **Source or create custom GIF animations** for popular exercises
2. **Or integrate ExerciseDB** for premium tier:
   - Free users: static images from Free Exercise DB
   - Premium users: professional GIFs from ExerciseDB
3. **Hybrid approach** maximizes value

### Phase 3: Growth (Future)
1. **Community contributions** for missing exercises
2. **Professional video content** for proper form tutorials
3. **AI-generated animations** (future tech)

---

## Cost Projections (Year 1)

| Option | Setup | Monthly | Annual | Notes |
|--------|-------|---------|--------|-------|
| Free Exercise DB | $0 | $0 | **$0** | Hosting images on your CDN |
| ExerciseDB Pro | $0 | $11.99 | $143.88 | 2,300 req/month |
| ExerciseDB Ultra | $0 | $17.99 | $215.88 | Non-watermarked |
| wger (self-hosted) | ~$50 | ~$5-10 | ~$110-170 | VPS costs |
| **Hybrid** | $0 | $0-11.99 | **$0-143.88** | Free base + optional premium |

---

## Technical Considerations

### Mobile App Performance
- **Free Exercise DB**: Fastest (bundled, no network)
- **ExerciseDB**: Slowest (network calls, can't cache)
- **wger**: Medium (cacheable but requires hosting)

### Bundle Size
- **Free Exercise DB JSON**: ~5MB (800+ exercises)
- **Images**: Variable (can optimize/lazy load)
- **Total**: ~10-20MB bundled (acceptable for mobile)

### Offline Functionality
- **Free Exercise DB**: ✅ Full offline support
- **ExerciseDB**: ❌ Online-only (no caching allowed)
- **wger**: ✅ If self-hosted with local caching
- **API Ninjas**: ❌ Online-only

### Scalability
- **Free Exercise DB**: Infinite (no API rate limits)
- **ExerciseDB**: Limited by plan (2,300-28,750 req/month)
- **wger**: Limited by self-hosted infrastructure
- **API Ninjas**: Limited by API plan

---

## Legal & Compliance

### Free Exercise DB
- **License**: Unlicense (Public Domain)
- **Commercial use**: ✅ Fully allowed
- **Attribution**: Not required (but nice)
- **Modifications**: ✅ Allowed
- **Redistribution**: ✅ Allowed
- **Risk**: Zero

### ExerciseDB
- **License**: Proprietary
- **Commercial use**: ✅ With paid subscription
- **Caching**: ❌ Strictly prohibited
- **Data retention**: Must delete upon cancellation
- **Risk**: Low (clear terms)

### wger.de
- **License**: GNU AGPLv3
- **Commercial use**: ⚠️ Allowed BUT requires source disclosure
- **Copyleft**: Network interaction triggers obligations
- **Risk**: High for proprietary/commercial apps

### API Ninjas
- **License**: Proprietary
- **Terms**: Review their specific ToS
- **Risk**: Medium (depends on terms)

---

## Decision Matrix

### Choose Free Exercise DB if:
- ✅ You want zero licensing concerns
- ✅ Offline functionality is important
- ✅ Budget is constrained
- ✅ You plan to add custom GIFs later
- ✅ Mobile-first approach
- ✅ You want full data control

### Choose ExerciseDB if:
- ✅ Professional GIF quality is non-negotiable from day one
- ✅ You have budget for $12-30/month
- ✅ Your app is always-online
- ✅ You want the largest exercise database
- ✅ You're building a web app (not mobile)

### Choose wger.de if:
- ✅ Your project is open-source
- ✅ You're comfortable with AGPLv3
- ✅ You want a complete fitness platform
- ✅ You can self-host infrastructure

### Choose API Ninjas if:
- ✅ HIIT/plyometrics are your primary focus
- ✅ Visual media is not critical
- ✅ You want a large exercise variety

---

## Final Recommendation for Intensely

**Start with Free Exercise DB, plan for hybrid approach**

### Immediate (MVP)
1. Use Free Exercise DB as the foundation
2. Bundle entire dataset with the app
3. Filter for bodyweight/HICT exercises
4. Use static images for demonstrations
5. **Checkpoint**: TAXONOMY_BUILT with zero ongoing costs

### Near-term (Post-MVP)
1. Source or create custom GIF animations for top 50 exercises
2. Add more HICT-specific exercises manually
3. Community contribution feature for exercises

### Long-term (Scale)
1. Offer premium tier with ExerciseDB GIF integration
2. Professional video content for form tutorials
3. AI-powered exercise recommendations
4. User-generated content with moderation

### Why This Approach Wins
- ✅ **Zero costs to validate MVP**
- ✅ **No licensing landmines**
- ✅ **Offline-first mobile experience**
- ✅ **Full control over data**
- ✅ **Scalable to premium tier**
- ✅ **No vendor lock-in**

---

## Next Steps

1. ✅ Download Free Exercise DB repository
2. ✅ Filter for bodyweight/HICT exercises
3. ✅ Design database schema around this structure
4. ⏭️ Research additional HICT exercises not in library
5. ⏭️ Define exercise taxonomy structure
6. ⏭️ Source/create GIF animations strategy

---

## Resources

- [Free Exercise DB GitHub](https://github.com/yuhonas/free-exercise-db)
- [Free Exercise DB Browser](https://yuhonas.github.io/free-exercise-db/)
- [ExerciseDB API Docs](https://v2.exercisedb.io/docs)
- [wger API Docs](https://wger.readthedocs.io/)
- [API Ninjas Exercises](https://www.api-ninjas.com/api/exercises)

---

*Research completed: 2026-01-08*
*Decision: Free Exercise DB (primary) + ExerciseDB (optional premium)*
