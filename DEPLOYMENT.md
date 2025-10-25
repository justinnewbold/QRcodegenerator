# Deployment Guide - QR Code Generator

## Quick Setup (Vercel + Vercel-hosted Domain)

Since `newbold.cloud` is already hosted on Vercel, the setup is straightforward!

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `justinnewbold/QRcodegenerator`
4. Click "Import"

### Step 2: Configure Project (Auto-detected)

Vercel will automatically detect these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

**No changes needed** - just click **"Deploy"**!

### Step 3: Wait for Initial Deployment

- First deployment takes ~2-3 minutes
- You'll get a temporary URL: `qrcodegenerator-xyz.vercel.app`
- Test it to make sure everything works!

### Step 4: Add Custom Domain (Super Easy!)

Since `newbold.cloud` is already on Vercel:

1. In your new project, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Type: `qrgen.newbold.cloud`
4. Click **"Add"**
5. Vercel will ask if you want to add it - click **"Add qrgen.newbold.cloud"**
6. **Done!** Vercel automatically configures DNS since it manages your domain

No DNS records to copy, no waiting for propagation - Vercel handles it all!

### Step 5: Verify SSL Certificate

- Vercel automatically provisions SSL certificates
- Usually ready in 1-2 minutes
- Check that `https://qrgen.newbold.cloud` shows a secure padlock

### Step 6: Set as Production Domain (Optional)

1. In **Settings** → **Domains**
2. Find `qrgen.newbold.cloud`
3. Click the three dots → **"Set as Primary Domain"**
4. This makes it the default for all deployments

## Environment Variables (if needed later)

Currently, the app doesn't need any environment variables. If you add analytics or other services later:

1. Go to **Settings** → **Environment Variables**
2. Add your variables
3. Redeploy to apply changes

## Automatic Deployments

Every push to your main branch will automatically deploy:

- **Production**: Pushes to `main` → `qrgen.newbold.cloud`
- **Preview**: Other branches get preview URLs
- **Pull Requests**: Automatic preview deployments

## Performance Optimizations (Already Configured)

Your app is already optimized with:

- ✅ Static page generation
- ✅ Automatic code splitting
- ✅ Image optimization ready
- ✅ Tree shaking enabled
- ✅ Minification enabled
- ✅ Gzip compression
- ✅ Edge caching

## Monitoring

After deployment, monitor your app:

1. **Analytics**: Settings → Analytics (enable if desired)
2. **Speed Insights**: Settings → Speed Insights
3. **Logs**: View real-time logs in Vercel dashboard

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- The build succeeded locally, so it should work!

### Domain Not Working
- Since Vercel hosts your domain, it should work immediately
- If issues persist, check Settings → Domains to see status
- SSL cert usually provisions in 1-2 minutes

### Performance Issues
- Check Analytics in Vercel dashboard
- App uses 100% client-side rendering, so server load is minimal
- All QR generation happens in the browser

## Post-Deployment Checklist

- [ ] Verify `https://qrgen.newbold.cloud` loads correctly
- [ ] Test all QR code types (URL, WiFi, vCard, etc.)
- [ ] Test QR scanner with image upload
- [ ] Test dark/light mode toggle
- [ ] Test downloads (PNG and SVG)
- [ ] Test on mobile device
- [ ] Check SSL certificate is valid
- [ ] Set up any desired analytics (optional)

## Future Updates

To deploy updates:

1. Make changes in your code
2. Commit and push to GitHub
3. Vercel automatically rebuilds and deploys
4. Live in ~2-3 minutes!

Or use the Vercel CLI for instant deployments:
```bash
npm i -g vercel
vercel --prod
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Issues](https://github.com/justinnewbold/QRcodegenerator/issues)

---

**Expected Final URL**: https://qrgen.newbold.cloud

Your QR code generator will be live and accessible worldwide! 🚀
