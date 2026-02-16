# Vercel Deployment Guide

Complete guide for deploying the Intensely mobile app to Vercel.

## Project URL

https://vercel.com/daniel-springs-projects/intenselyapp

## Overview

The Intensely app is an Expo/React Native application with web support. This guide covers deploying the web version to Vercel.

## Prerequisites

- [x] Vercel account
- [x] GitHub repository connected to Vercel
- [x] Supabase project credentials
- [x] CDN URL for animations (optional)

## Quick Setup

### 1. Import Project to Vercel

If not already done:
```bash
# Via Vercel CLI
npm install -g vercel
cd mobile
vercel

# Or via Vercel Dashboard
# https://vercel.com/new
# Import from: https://github.com/S-p-r-i-n-g/Intensely
```

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

**Required:**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Optional (for animations):**
```bash
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.intensely.app
```

**IMPORTANT:** Make sure to set these for:
- ✅ Production
- ✅ Preview
- ✅ Development

### 3. Configure Build Settings

In Vercel Dashboard → Settings → General:

**Framework Preset:** Other

**Root Directory:** `mobile` (if deploying from monorepo)

**Build & Development Settings:**
- Build Command: `npm run vercel-build` or `expo export --platform web`
- Output Directory: `web-build`
- Install Command: `npm install`

### 4. Deploy

Trigger a deployment:
```bash
# Via CLI
vercel --prod

# Or via Dashboard
# Push to main branch (auto-deploys)
```

## Project Structure

```
mobile/
├── app.json              # Expo configuration
├── package.json          # Dependencies + build scripts
├── vercel.json           # Vercel deployment config
├── .env.example          # Environment variables template
├── src/                  # Application source
├── assets/               # Static assets (icons, images)
└── web-build/            # Build output (generated)
```

## Configuration Files

### vercel.json

```json
{
  "version": 2,
  "name": "intensely-mobile",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "web-build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### package.json (build scripts)

```json
{
  "scripts": {
    "start": "expo start",
    "web": "expo start --web",
    "build": "expo export --platform web",
    "vercel-build": "expo export --platform web"
  }
}
```

## Environment Variables

### Supabase

Get from: https://app.supabase.com/project/_/settings/api

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### CDN (Animation Assets)

```bash
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.intensely.app
```

## Build Process

When you deploy, Vercel will:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run build command**
   ```bash
   expo export --platform web
   ```

3. **Output to web-build/**
   - index.html
   - static/ (JS, CSS, assets)
   - Asset manifest

4. **Deploy to CDN**
   - Globally distributed
   - HTTPS enabled
   - Auto-scaling

## Deployment Checklist

Before going to production:

- [ ] Environment variables configured
- [ ] Supabase credentials valid
- [ ] CDN URL correct (if using animations)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview deployment works
- [ ] All routes accessible
- [ ] Assets loading correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Authentication works
- [ ] API calls succeed

## Testing Deployment

### Local Build Test

```bash
cd mobile

# Install dependencies
npm install

# Build for web
npm run build

# Serve locally
npx serve web-build

# Open http://localhost:3000
```

### Preview Deployment

Every pull request automatically creates a preview deployment:
- URL: `https://intenselyapp-{hash}.vercel.app`
- Test before merging to main
- Share with team for review

### Production Deployment

Main branch deploys to production:
- URL: `https://intenselyapp.vercel.app` (or custom domain)
- Triggered automatically on push to main
- View deployment logs in Vercel Dashboard

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add domain: `intensely.app` or `app.intensely.com`
3. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. HTTPS automatically enabled

## Troubleshooting

### Build Fails

**Error:** `expo: command not found`
```bash
# Solution: Ensure expo is in dependencies
npm install expo --save
```

**Error:** `Cannot find module 'react-native-web'`
```bash
# Solution: Install web dependencies
npm install react-native-web react-dom
```

**Error:** `Build timeout`
```bash
# Solution: Upgrade Vercel plan or optimize build
# - Remove unnecessary dependencies
# - Check for circular imports
```

### Environment Variables Not Working

**Issue:** Variables undefined at runtime

**Solution:**
- Ensure variables start with `EXPO_PUBLIC_`
- Redeploy after adding variables
- Check variable scope (Production/Preview/Development)

### Routes Not Working (404)

**Issue:** Direct URLs return 404

**Solution:**
- Verify `vercel.json` routes configuration
- Ensure SPA fallback: `"dest": "/index.html"`
- Check output directory is correct

### Assets Not Loading

**Issue:** Images/fonts not found

**Solution:**
- Verify assets in `assets/` directory
- Check `app.json` paths are correct
- Ensure assets bundled during build
- Test with `expo export --platform web` locally

### Slow Performance

**Optimize:**
- Enable code splitting
- Lazy load components
- Optimize images
- Use CDN for static assets
- Enable gzip compression

## Monitoring

### Vercel Analytics

Enable in Dashboard → Analytics:
- Page views
- Unique visitors
- Performance metrics
- Web Vitals

### Error Tracking

Integrate error tracking:
```bash
npm install @sentry/react-native
```

Configure in app:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## CI/CD Workflow

Automatic deployment pipeline:

```
Push to GitHub
     ↓
Vercel detects push
     ↓
Runs build command
     ↓
     ├─ Success → Deploy
     └─ Failure → Notify
     ↓
Deploy to edge network
     ↓
Update DNS
     ↓
Live! 🎉
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
```

### 2. Image Optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### 3. Bundle Analysis

```bash
# Install analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze build
npx expo export --platform web --dev=false
npx webpack-bundle-analyzer web-build/static/js/*.js
```

## Security

### 1. Environment Variables

- ✅ Never commit `.env` to git
- ✅ Use `EXPO_PUBLIC_` prefix for client-side vars
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/prod

### 2. API Security

- ✅ Enable Supabase RLS (Row Level Security)
- ✅ Use anon key (not service role key)
- ✅ Implement rate limiting
- ✅ Validate all inputs

### 3. Headers

Add security headers in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Costs

Vercel Pricing (as of 2024):

**Hobby (Free):**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- **Best for:** Development, small projects

**Pro ($20/month):**
- 1 TB bandwidth
- Priority support
- Analytics included
- Team collaboration
- **Best for:** Production apps

**Enterprise (Custom):**
- Unlimited bandwidth
- SLA guarantees
- Dedicated support
- **Best for:** Large-scale apps

## Support

### Vercel Support

- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

### Project Issues

- GitHub Issues: https://github.com/S-p-r-i-n-g/Intensely/issues
- Email: daniel@intensely.app (replace with actual)

## Next Steps

After successful deployment:

1. ✅ Test all functionality
2. ✅ Set up custom domain
3. ✅ Enable analytics
4. ✅ Configure error tracking
5. ✅ Set up monitoring
6. ✅ Document deployment process
7. ✅ Train team on Vercel workflow

---

**Deployment Status:** https://vercel.com/daniel-springs-projects/intenselyapp

**Production URL:** https://intenselyapp.vercel.app (once deployed)

**Last Updated:** 2024-02-16
