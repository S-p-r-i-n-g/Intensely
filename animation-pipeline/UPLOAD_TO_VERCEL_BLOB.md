# Uploading Animations to Vercel Blob Storage

Complete guide for uploading exercise animation files to Vercel Blob Storage.

## Overview

Vercel Blob Storage provides a simple, scalable CDN for your animation files:
- ✅ Globally distributed
- ✅ Automatic HTTPS
- ✅ Public URLs for each file
- ✅ Integrated with Vercel projects
- ✅ Free tier available

## Prerequisites

- [x] Vercel account
- [x] Intensely project in Vercel (`intenselyapp`)
- [x] Generated animation files in `output/` directory
- [x] Node.js installed
- [x] `@vercel/blob` package installed

## Step 1: Create Vercel Blob Store

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **Storage** in left sidebar
   - Click **Create Database** → Select **Blob**

2. **Configure Store**
   ```
   Name: intensely-animations
   Region: us-east-1 (or closest to your users)
   ```

3. **Connect to Project**
   - Select `intenselyapp` from project list
   - Click **Connect**
   - This automatically adds `BLOB_READ_WRITE_TOKEN` to your project

4. **Copy the Token**
   - Go to Project Settings → Environment Variables
   - Copy the value of `BLOB_READ_WRITE_TOKEN`

## Step 2: Configure Local Environment

1. **Open `.env.local`**
   ```bash
   cd animation-pipeline
   nano .env.local
   ```

2. **Add your token:**
   ```bash
   # Vercel Blob Storage Token
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx_xxxxxxxxxx
   ```

3. **Save and close** (Ctrl+X, Y, Enter)

## Step 3: Upload Animations

Run the upload script:

```bash
cd animation-pipeline
node scripts/upload_to_vercel_blob.js
```

### What It Does

The script will:
1. ✅ Load environment from `.env.local`
2. ✅ Find all WebP files in `output/webp/`
3. ✅ Find all Lottie JSON files in `output/lottie/`
4. ✅ Find `manifest.json` in `output/`
5. ✅ Upload each file to Vercel Blob as `animations/{filename}`
6. ✅ Output your CDN base URL

### Expected Output

```
✅ Loaded environment from .env.local

🚀 Starting upload to Vercel Blob Storage...

📦 Uploading WebP animations...
  ✅ burpee.webp → https://abc123.public.blob.vercel-storage.com/animations/burpee.webp
  ✅ push-up.webp → https://abc123.public.blob.vercel-storage.com/animations/push-up.webp
  ...

📦 Uploading Lottie animations...
  ✅ burpee.json → https://abc123.public.blob.vercel-storage.com/animations/burpee.json
  ✅ push-up.json → https://abc123.public.blob.vercel-storage.com/animations/push-up.json
  ...

📦 Uploading manifest...
  ✅ manifest.json → https://abc123.public.blob.vercel-storage.com/animations/manifest.json

============================================================
📊 Upload Summary
============================================================
WebP files:    219 uploaded, 0 failed
Lottie files:  219 uploaded, 0 failed
Manifest:      1 uploaded, 0 failed
============================================================

✅ Upload Complete!

🔗 Your CDN Base URL:
   https://abc123.public.blob.vercel-storage.com

📝 Add this to your Vercel environment variables:
   EXPO_PUBLIC_CDN_BASE_URL=https://abc123.public.blob.vercel-storage.com

💡 Update in Vercel Dashboard:
   Project Settings → Environment Variables
   Add for: Production, Preview, Development

✨ Done!
```

## Step 4: Add CDN URL to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Project: `intenselyapp`
   - Settings → Environment Variables

2. **Add New Variable**
   ```
   Key:   EXPO_PUBLIC_CDN_BASE_URL
   Value: https://abc123.public.blob.vercel-storage.com
   ```
   (Use the URL from upload script output)

3. **Select Environments**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Save**

## Step 5: Verify Upload

### Check Files in Vercel Dashboard

1. Go to: Storage → `intensely-animations`
2. You should see:
   ```
   📁 animations/
      ├── burpee.webp
      ├── burpee.json
      ├── push-up.webp
      ├── push-up.json
      ├── manifest.json
      └── ...
   ```

### Test URLs in Browser

Visit a file directly:
```
https://abc123.public.blob.vercel-storage.com/animations/burpee.webp
https://abc123.public.blob.vercel-storage.com/animations/manifest.json
```

You should see:
- **WebP:** Animation plays in browser (or downloads)
- **JSON:** Lottie animation data displayed
- **manifest.json:** Full metadata

## Step 6: Deploy Mobile App

Once environment variables are set, deploy your mobile app:

```bash
cd mobile
git add .
git commit -m "feat: add Vercel Blob CDN configuration"
git push
```

Vercel will automatically:
1. ✅ Detect the push
2. ✅ Build the app with new environment variables
3. ✅ Deploy to production

Your app will now load animations from Vercel Blob CDN! 🎉

## File Structure in Blob Storage

```
animations/
├── burpee.webp              # WebP animation
├── burpee.json              # Lottie animation
├── push-up.webp
├── push-up.json
├── mountain-climber.webp
├── mountain-climber.json
├── ...
└── manifest.json            # Metadata for all animations
```

## URL Format

Files are accessible at:
```
{CDN_BASE_URL}/animations/{slug}.{extension}
```

Examples:
```
https://abc123.public.blob.vercel-storage.com/animations/burpee.webp
https://abc123.public.blob.vercel-storage.com/animations/burpee.json
https://abc123.public.blob.vercel-storage.com/animations/manifest.json
```

## Mobile App Usage

Your React Native components will automatically fetch from this CDN:

```tsx
// ExerciseAnimation.tsx
const animationUrl = `${process.env.EXPO_PUBLIC_CDN_BASE_URL}/animations/${slug}.webp`;

<Image
  source={{ uri: animationUrl }}
  style={{ width: 240, height: 240 }}
  contentFit="contain"
/>
```

The `EXPO_PUBLIC_CDN_BASE_URL` environment variable is automatically injected at build time.

## Re-uploading Files

To update animations (e.g., after regenerating):

```bash
# Re-run the upload script
node scripts/upload_to_vercel_blob.js
```

Files with the same pathname will **not** be overwritten by default. To force overwrite:

1. Delete files in Vercel Dashboard (Storage → intensely-animations)
2. Re-run upload script

Or modify the script to use `allowOverwrite: true`:
```js
const blob = await put(blobPathname, fileBuffer, {
  access: 'public',
  allowOverwrite: true, // Enable overwriting
});
```

## Costs

**Vercel Blob Pricing (as of 2024):**

### Hobby (Free)
- **Storage:** 100 GB included
- **Data Transfer:** 100 GB/month included
- **Operations:** Unlimited

### Pro ($20/month)
- **Storage:** $0.15/GB-month
- **Data Transfer:** $0.15/GB
- **Operations:** Unlimited

**Estimate for Intensely:**
- 219 exercises × 2 formats (WebP + Lottie) = 438 files
- Average file size: ~50 KB (WebP) + ~30 KB (Lottie) = ~80 KB
- Total storage: 438 × 80 KB ≈ **35 MB**
- Monthly data transfer (1000 users, 10 animations each): ~800 MB

**Cost:** Free tier is more than enough! 🎉

## Troubleshooting

### Error: BLOB_READ_WRITE_TOKEN not found

**Solution:**
1. Verify token is in `.env.local`
2. Check for typos in variable name
3. Ensure no extra spaces around `=`

### Error: Failed to upload

**Solution:**
1. Check internet connection
2. Verify token is valid (not expired)
3. Check Vercel Blob store exists and is connected to project

### Files not appearing in mobile app

**Solution:**
1. Verify `EXPO_PUBLIC_CDN_BASE_URL` is set in Vercel
2. Redeploy mobile app after adding environment variable
3. Clear app cache or reinstall app
4. Check browser network tab for 404 errors

### Upload is slow

**Solution:**
- Upload is sequential by default (one file at a time)
- For faster uploads, modify script to use `Promise.all()` for parallel uploads
- Vercel Blob supports multipart uploads for files >100 MB

## Next Steps

After successful upload:

1. ✅ Verify files in Vercel Dashboard
2. ✅ Test URLs in browser
3. ✅ Add `EXPO_PUBLIC_CDN_BASE_URL` to Vercel environment variables
4. ✅ Deploy mobile app
5. ✅ Test animations in mobile app

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob SDK](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
- [Vercel Blob Pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)

---

**Status:** Ready to upload animations to Vercel Blob! 🚀
