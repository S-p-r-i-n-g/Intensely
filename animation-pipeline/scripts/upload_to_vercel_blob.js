#!/usr/bin/env node

/**
 * Upload Animation Files to Vercel Blob Storage
 *
 * Uploads all WebP, Lottie JSON, and manifest.json files to Vercel Blob Storage.
 *
 * Prerequisites:
 * 1. Create a Vercel Blob store in your dashboard
 * 2. Connect it to your project (adds BLOB_READ_WRITE_TOKEN automatically)
 * 3. Install SDK: npm install @vercel/blob
 * 4. Add token to .env.local file
 *
 * Usage:
 *   node scripts/upload_to_vercel_blob.js
 *
 * Environment Variables:
 *   BLOB_READ_WRITE_TOKEN - From Vercel Dashboard (required)
 */

const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Load .env.local file if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✅ Loaded environment from .env.local\n');
}

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const WEBP_DIR = path.join(OUTPUT_DIR, 'webp');
const LOTTIE_DIR = path.join(OUTPUT_DIR, 'lottie');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

// Verify token is available
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found');
  console.error('');
  console.error('Please ensure:');
  console.error('1. You created a Vercel Blob store in your dashboard');
  console.error('2. You connected it to your project');
  console.error('3. You added BLOB_READ_WRITE_TOKEN to animation-pipeline/.env.local');
  console.error('');
  console.error('Get token from: Vercel Dashboard → Project Settings → Environment Variables');
  process.exit(1);
}

/**
 * Upload a single file to Vercel Blob
 */
async function uploadFile(filePath, blobPathname) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = await put(blobPathname, fileBuffer, {
      access: 'public',
      addRandomSuffix: false, // Keep predictable URLs
    });

    return blob;
  } catch (error) {
    console.error(`❌ Failed to upload ${blobPathname}:`, error.message);
    throw error;
  }
}

/**
 * Get all files in a directory with a specific extension
 */
function getFiles(dir, extension) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir)
    .filter(file => file.endsWith(extension))
    .map(file => path.join(dir, file));
}

/**
 * Main upload function
 */
async function uploadAnimations() {
  console.log('🚀 Starting upload to Vercel Blob Storage...\n');

  const stats = {
    webp: { uploaded: 0, failed: 0 },
    lottie: { uploaded: 0, failed: 0 },
    manifest: { uploaded: 0, failed: 0 },
  };

  const uploadedUrls = [];

  // Upload WebP files
  console.log('📦 Uploading WebP animations...');
  const webpFiles = getFiles(WEBP_DIR, '.webp');

  for (const filePath of webpFiles) {
    const filename = path.basename(filePath);
    const blobPathname = `animations/${filename}`;

    try {
      const blob = await uploadFile(filePath, blobPathname);
      stats.webp.uploaded++;
      uploadedUrls.push({ type: 'webp', url: blob.url });
      console.log(`  ✅ ${filename} → ${blob.url}`);
    } catch (error) {
      stats.webp.failed++;
    }
  }

  // Upload Lottie JSON files
  console.log('\n📦 Uploading Lottie animations...');
  const lottieFiles = getFiles(LOTTIE_DIR, '.json');

  for (const filePath of lottieFiles) {
    const filename = path.basename(filePath);
    const blobPathname = `animations/${filename}`;

    try {
      const blob = await uploadFile(filePath, blobPathname);
      stats.lottie.uploaded++;
      uploadedUrls.push({ type: 'lottie', url: blob.url });
      console.log(`  ✅ ${filename} → ${blob.url}`);
    } catch (error) {
      stats.lottie.failed++;
    }
  }

  // Upload manifest.json
  console.log('\n📦 Uploading manifest...');
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const blob = await uploadFile(MANIFEST_PATH, 'animations/manifest.json');
      stats.manifest.uploaded++;
      uploadedUrls.push({ type: 'manifest', url: blob.url });
      console.log(`  ✅ manifest.json → ${blob.url}`);
    } catch (error) {
      stats.manifest.failed++;
    }
  } else {
    console.log('  ⚠️  manifest.json not found, skipping');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`WebP files:    ${stats.webp.uploaded} uploaded, ${stats.webp.failed} failed`);
  console.log(`Lottie files:  ${stats.lottie.uploaded} uploaded, ${stats.lottie.failed} failed`);
  console.log(`Manifest:      ${stats.manifest.uploaded} uploaded, ${stats.manifest.failed} failed`);
  console.log('='.repeat(60));

  // Extract CDN base URL from first uploaded file
  if (uploadedUrls.length > 0) {
    const firstUrl = uploadedUrls[0].url;
    const cdnBaseUrl = firstUrl.substring(0, firstUrl.indexOf('/animations'));

    console.log('\n✅ Upload Complete!\n');
    console.log('🔗 Your CDN Base URL:');
    console.log(`   ${cdnBaseUrl}\n`);
    console.log('📝 Add this to your Vercel environment variables:');
    console.log(`   EXPO_PUBLIC_CDN_BASE_URL=${cdnBaseUrl}\n`);
    console.log('💡 Update in Vercel Dashboard:');
    console.log('   Project Settings → Environment Variables');
    console.log('   Add for: Production, Preview, Development\n');
  }

  return stats;
}

// Run the upload
uploadAnimations()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Upload failed:', error.message);
    process.exit(1);
  });
