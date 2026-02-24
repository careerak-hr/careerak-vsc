# Vercel Environment Variables - Quick Start Guide

## 🚀 5-Minute Setup

**Goal**: Set all required environment variables on Vercel and deploy successfully.

---

## Step 1: Prepare Your Values (2 minutes)

### Backend Variables (Copy and fill in)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerak

# Security
JWT_SECRET=your_32_char_secret_here_min_length
SESSION_SECRET=your_32_char_session_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=careerak
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu
```

### Frontend Variables (Copy and fill in)

```env
# API
VITE_API_URL=https://your-backend.vercel.app

# Pusher
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=eu

# App
VITE_APP_URL=https://your-domain.com
```

---

## Step 2: Add to Vercel (2 minutes)

### Option A: Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. For each variable:
   - Click **Add New**
   - Paste name (e.g., `MONGODB_URI`)
   - Paste value
   - Select **Production** ✅
   - Click **Save**

### Option B: CLI (Faster for many variables)

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Add variables one by one
vercel env add MONGODB_URI production
# Paste value when prompted

# Or bulk add from file
vercel env pull .env.production
# Edit .env.production with your values
vercel env push .env.production production
```

---

## Step 3: Redeploy (1 minute)

### Dashboard Method
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Click **Redeploy** again to confirm

### CLI Method
```bash
vercel --prod
```

---

## Step 4: Verify (30 seconds)

### Test Backend
```bash
curl https://your-backend.vercel.app/api/health
# Should return: {"status":"ok"}
```

### Test Frontend
1. Visit https://your-domain.com
2. Open browser console (F12)
3. Should see no environment errors
4. Try logging in

---

## ✅ Success Checklist

- [ ] All backend variables added
- [ ] All frontend variables added
- [ ] Redeployed successfully
- [ ] Backend API responds
- [ ] Frontend loads
- [ ] Can login
- [ ] Images load (Cloudinary working)
- [ ] Real-time works (Pusher working)

---

## ❌ Common Issues

### "Environment variable not found"
**Fix**: Redeploy after adding variables

### "Invalid credentials"
**Fix**: Check for typos, extra spaces

### "CORS error"
**Fix**: Verify `VITE_API_URL` matches backend URL

### "Build fails"
**Fix**: Check all required variables are set

---

## 📋 Minimum Required Variables

### Backend (8 required)
1. `MONGODB_URI`
2. `JWT_SECRET`
3. `CLOUDINARY_CLOUD_NAME`
4. `CLOUDINARY_API_KEY`
5. `CLOUDINARY_API_SECRET`
6. `PUSHER_APP_ID`
7. `PUSHER_KEY`
8. `PUSHER_SECRET`

### Frontend (2 required)
1. `VITE_API_URL`
2. `VITE_PUSHER_KEY`

---

## 🔐 Security Tips

1. **Generate strong secrets**:
   ```bash
   # Use this command
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Never commit secrets**:
   - Add `.env` to `.gitignore`
   - Never share in screenshots

3. **Use different secrets per environment**:
   - Production secrets ≠ Development secrets

---

## 📚 Full Documentation

For detailed information, see:
- [Full Environment Variables Guide](./VERCEL_ENVIRONMENT_VARIABLES.md)
- [Cloudinary Setup](./CLOUDINARY_TRANSFORMATIONS.md)
- [Pusher Setup](./PWA_PUSHER_INTEGRATION.md)

---

## 🆘 Need Help?

1. Check [Troubleshooting](./VERCEL_ENVIRONMENT_VARIABLES.md#troubleshooting)
2. Review [Vercel Logs](https://vercel.com/docs/concepts/deployments/logs)
3. Contact support

---

**Time to complete**: ~5 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to use
