# Deployment Guide

This guide covers deploying the Intensely HICT Workout App for public use.

## Architecture Overview

- **Backend API**: Express.js/TypeScript server
- **Database**: PostgreSQL (via Supabase - already hosted)
- **Mobile App**: Expo/React Native
- **Authentication**: Supabase Auth

---

## Option 1: Railway (Recommended - Easiest)

### Backend Deployment

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   In Railway dashboard, add these environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<your-supabase-postgres-connection-string>
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_KEY=<your-supabase-service-key>
   JWT_SECRET=<generate-a-random-secret>
   ```

4. **Configure Build Settings**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Deploy**
   - Railway will automatically deploy on every push to main branch
   - Your API will be available at: `https://your-app-name.up.railway.app`

### Get Your Supabase Database URL
1. Go to your Supabase project dashboard
2. Settings → Database
3. Copy the "Connection string" (URI format)
4. Replace `[YOUR-PASSWORD]` with your database password

---

## Option 2: Render (Free Tier Available)

### Backend Deployment

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: `intensely-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   Same as Railway (see above)

5. **Deploy**
   - Render will build and deploy automatically
   - Your API will be at: `https://intensely-backend.onrender.com`

**Note**: Free tier services on Render spin down after 15 minutes of inactivity. Consider upgrading for production.

---

## Option 3: Vercel (Serverless)

### Backend Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json` in backend directory**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   cd backend
   vercel
   ```

4. **Set Environment Variables**
   - In Vercel dashboard, add all environment variables

**Note**: Vercel is serverless, so long-running connections may timeout. Consider Railway/Render for better compatibility.

---

## Mobile App Distribution

### Development/Testing (Expo Go)

1. **Start Development Server**
   ```bash
   cd mobile
   npm start
   ```

2. **Share with Testers**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or share the development URL

### Production Build (EAS Build)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   cd mobile
   eas build:configure
   ```

4. **Update `app.json`**
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "https://your-backend-url.com/api"
       }
     }
   }
   ```

5. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

6. **Build for Android**
   ```bash
   eas build --platform android
   ```

7. **Submit to App Stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Web Deployment (Optional)

If you want a web version:

1. **Build Web**
   ```bash
   cd mobile
   npx expo export:web
   ```

2. **Deploy to Vercel/Netlify**
   - Connect your repo
   - Build directory: `mobile/web-build`
   - Deploy automatically

---

## Environment Variables Checklist

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
```

### Mobile (Update API client)
Update `mobile/src/api/client.ts` to point to your production API URL.

---

## Post-Deployment Steps

1. **Run Database Migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Seed Database (if needed)**
   ```bash
   npm run prisma:seed
   ```

3. **Update CORS Settings**
   - In your backend, ensure CORS allows your mobile app domains
   - Update `backend/src/index.ts` if needed:
   ```typescript
   app.use(cors({
     origin: [
       'https://your-expo-app.com',
       'exp://your-expo-url',
       // Add other allowed origins
     ]
   }));
   ```

4. **Test API Endpoints**
   ```bash
   curl https://your-api-url.com/health
   ```

5. **Update Mobile App Configuration**
   - Update API base URL in `mobile/src/api/client.ts`
   - Rebuild and redistribute mobile app

---

## Monitoring & Maintenance

### Recommended Tools

1. **Error Tracking**: Sentry
   - Free tier available
   - Track errors in both backend and mobile app

2. **Analytics**: PostHog or Mixpanel
   - Track user behavior
   - Free tiers available

3. **Uptime Monitoring**: UptimeRobot
   - Free tier: 50 monitors
   - Get alerts if API goes down

### Database Backups

Supabase automatically handles backups, but you can:
- Enable Point-in-Time Recovery (PITR) in Supabase dashboard
- Export database schema regularly

---

## Cost Estimates

### Free Tier Options
- **Railway**: $5/month credit (usually enough for small apps)
- **Render**: Free tier (with limitations)
- **Vercel**: Free tier (generous limits)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **EAS Build**: Free tier (limited builds)

### Paid Options (as you scale)
- **Railway**: ~$5-20/month
- **Render**: ~$7-25/month
- **Supabase**: ~$25/month (Pro plan)
- **EAS Build**: Pay per build or subscription

---

## Quick Start (Railway - Recommended)

1. Push your code to GitHub
2. Sign up at [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Set environment variables
5. Deploy!
6. Update mobile app with new API URL
7. Build mobile app with EAS

Your app will be live in ~10 minutes! 🚀

---

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check build logs in deployment platform

### Database connection errors
- Verify Supabase connection string
- Check IP allowlist in Supabase (if enabled)
- Ensure database password is correct

### Mobile app can't connect to API
- Verify API URL in mobile app config
- Check CORS settings in backend
- Ensure API is publicly accessible

### Build failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Review build logs for specific errors
