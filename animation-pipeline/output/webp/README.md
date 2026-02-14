# Animated WebP Output

Final stick-figure animations ready for the Intensely mobile app.

## File Format

- **Format**: Animated WebP
- **Size**: 400×400 pixels
- **Background**: Transparent (RGBA)
- **FPS**: 15 frames per second
- **Loop**: Infinite
- **Compression**: Lossless, method 6 (best quality)

## Visual Style

**Bones:**
- Color: `#374151` (dark gray)
- Width: 4 pixels
- Connected according to SMPL-H skeleton

**Joints:**
- Color: `#3B82F6` (blue accent)
- Radius: 6 pixels (regular joints)
- Radius: 14 pixels (head joint)

**Canvas:**
- Size: 400×400px
- Background: Fully transparent
- Character centered with 15% padding

## File Sizes

Typical file sizes:
- Simple exercise (30 frames): ~15-25 KB
- Complex exercise (60 frames): ~30-50 KB
- Very dynamic (90 frames): ~50-75 KB

**Total for 219 exercises**: ~8-12 MB

Compare to GIF:
- GIF (same quality): ~100-200 KB per file
- WebP savings: **75-85% smaller**

## Usage in Intensely App

### With expo-image (Recommended)

```typescript
import { Image } from 'expo-image';

<Image
  source={require('./animations/push-up.webp')}
  style={{ width: 200, height: 200 }}
  contentFit="contain"
  placeholder={blurhash}
/>
```

### Benefits
- ✅ Hardware-accelerated decoding
- ✅ Smooth 60fps rendering
- ✅ Automatic memory management
- ✅ Small bundle size
- ✅ Transparent backgrounds
- ✅ Infinite loop built-in

## Verification

Check animation quality:

```bash
# View file info
file push-up.webp

# Check size
du -h push-up.webp

# Extract frame count
webpmux -info push-up.webp | grep "Number of frames"
```

With Python:
```python
from PIL import Image

img = Image.open('push-up.webp')

print(f"Format: {img.format}")
print(f"Size: {img.size}")
print(f"Frames: {img.n_frames}")
print(f"Duration: {img.info.get('duration')} ms per frame")

# Verify transparency
assert img.mode == 'RGBA', "Should have alpha channel"
```

## File Naming

Filenames match exercise slugs from database:
```
push-up.webp              → slug: "push-up"
bodyweight-squat.webp     → slug: "bodyweight-squat"
burpee.webp               → slug: "burpee"
```

## Integration Checklist

Before deploying to app:

- [ ] All 219 animations generated
- [ ] File sizes reasonable (< 100 KB each)
- [ ] Animations loop smoothly
- [ ] Transparent backgrounds preserved
- [ ] No visual artifacts or clipping
- [ ] Characters stay centered
- [ ] Movements look natural at 15fps

## Troubleshooting

**Animation doesn't loop:**
- Check `loop=0` parameter (0 = infinite)
- Verify with: `webpmux -info file.webp`

**File size too large:**
- Reduce frame count (subsample more)
- Use lossy compression (trade quality for size)
- Simplify visual style (thinner bones)

**Choppy playback:**
- 15fps should be smooth for stick figures
- Check device performance
- Ensure hardware acceleration enabled

**Transparency not working:**
- Verify RGBA mode: `img.mode == 'RGBA'`
- Check app rendering context supports alpha

## Next Steps

1. Upload to app assets: `mobile/assets/animations/`
2. Update exercise model with animation URLs
3. Test on iOS and Android devices
4. Optimize loading (lazy load, precache favorites)
