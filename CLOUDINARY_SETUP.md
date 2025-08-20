# 🌤️ Cloudinary Setup - Free Video & Image Hosting

## 🆓 Why Cloudinary? (100% Free Alternative)

- ✅ **25GB free storage** (more than enough for testing)
- ✅ **25GB free bandwidth** per month
- ✅ **No credit card required**
- ✅ **Automatic video optimization**
- ✅ **Global CDN delivery**
- ✅ **No CORS issues**
- ✅ **Works with all deployment platforms**

## 🚀 Quick Setup (10 minutes)

### Step 1: Create Free Cloudinary Account

1. **Go to**: https://cloudinary.com/users/register/free
2. **Fill in your details**:
   - Email address
   - Password
   - Choose "Developer" as your role
3. **Click "Create Account"**
4. **Verify your email** (check your inbox)

### Step 2: Get Your Credentials

1. **Login to Cloudinary Dashboard**: https://cloudinary.com/console
2. **Copy these values** from your dashboard:
   - **Cloud Name**: (e.g., `dxyz123abc`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (keep this private)

### Step 3: Create Upload Preset

1. **Go to Settings** → **Upload** → **Upload presets**
2. **Click "Add upload preset"**
3. **Configure the preset**:
   - **Preset name**: `streamrush_uploads`
   - **Signing Mode**: `Unsigned` (important!)
   - **Folder**: `streamrush` (optional)
   - **Resource type**: `Auto`
4. **Click "Save"**

### Step 4: Add Environment Variables

Add these to your `.env` file:

```bash
# Cloudinary Configuration (Free)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_API_KEY=your_api_key_here
VITE_CLOUDINARY_UPLOAD_PRESET=streamrush_uploads
```

### Step 5: Install Cloudinary (Optional)

The service works without additional packages, but you can install the SDK for advanced features:

```bash
npm install cloudinary
```

### Step 6: Switch to Cloudinary Context

Replace your VideoContext import in `App.tsx`:

```typescript
// Change this:
import { VideoProvider } from './contexts/VideoContext';

// To this:
import { VideoProvider } from './contexts/VideoContextWithCloudinary';
```

## 🎯 How It Works

### Upload Process:
1. **User selects video/thumbnail**
2. **Files upload directly to Cloudinary**
3. **Progress tracking shows real-time progress**
4. **Cloudinary returns optimized URLs**
5. **URLs saved to Firebase Firestore**
6. **Videos appear in your app instantly**

### Benefits:
- ✅ **No CORS issues** - Cloudinary handles cross-origin requests
- ✅ **Automatic optimization** - Videos compressed for web
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Responsive images** - Automatic resizing
- ✅ **Format conversion** - WebP for images, MP4 for videos

## 🔧 Configuration Options

### Video Upload Settings:
```typescript
// Automatic optimizations applied:
- Quality: Auto (best compression)
- Format: MP4 (universal compatibility)
- Streaming: Adaptive bitrate
- CDN: Global delivery
```

### Image Upload Settings:
```typescript
// Automatic optimizations applied:
- Quality: Auto (best compression)
- Format: WebP (modern browsers)
- Dimensions: Responsive sizing
- CDN: Global delivery
```

## 📊 Free Tier Limits

| Feature | Free Tier | Notes |
|---------|-----------|-------|
| Storage | 25GB | Plenty for testing |
| Bandwidth | 25GB/month | Resets monthly |
| Transformations | 25,000/month | Image/video processing |
| API Calls | Unlimited | No restrictions |
| CDN | Global | Worldwide delivery |

## 🌐 Deployment Compatibility

Works perfectly with all platforms:
- ✅ **Vercel** - No configuration needed
- ✅ **Netlify** - No configuration needed  
- ✅ **Firebase Hosting** - No configuration needed
- ✅ **Any hosting platform** - Just set environment variables

## 🔍 Testing Your Setup

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Go to upload page**: http://localhost:3000/upload

3. **Try uploading a video**:
   - Select a video file (MP4, MOV, AVI)
   - Select a thumbnail image (JPG, PNG, WebP)
   - Fill in video details
   - Click "Upload Video"

4. **You should see**:
   - Real upload progress (not demo mode)
   - "Uploading to Cloudinary..." message
   - Success message with "Cloudinary" mentioned
   - Video appears in your profile

## 🆘 Troubleshooting

### "Upload preset not found":
- Make sure you created an **unsigned** upload preset
- Check the preset name matches your environment variable
- Wait a few minutes after creating the preset

### "Invalid cloud name":
- Double-check your cloud name from the dashboard
- Make sure there are no extra spaces or characters
- Cloud name is case-sensitive

### "Still getting demo mode":
- Check your `.env` file has the correct variables
- Restart your development server after adding variables
- Make sure variable names start with `VITE_`

### "Upload fails":
- Check your internet connection
- Verify file size is under 100MB for videos
- Make sure file format is supported (MP4, MOV, AVI for videos)

## 💰 Cost Comparison

| Service | Free Tier | Setup Complexity | CORS Issues |
|---------|-----------|------------------|-------------|
| **Cloudinary** | 25GB storage + bandwidth | ⭐ Easy | ❌ None |
| Firebase Storage | 5GB storage + 1GB bandwidth | ⭐⭐⭐ Complex | ✅ Requires setup |
| AWS S3 | 5GB storage + 20k requests | ⭐⭐⭐⭐ Very complex | ✅ Requires setup |

## 🎉 What You Get

After setup, your YouTube clone will have:

- ✅ **Real file uploads** (no more demo mode)
- ✅ **Automatic video optimization** 
- ✅ **Fast global delivery**
- ✅ **No CORS errors**
- ✅ **Works on all platforms**
- ✅ **Professional video streaming**
- ✅ **Responsive thumbnails**
- ✅ **Zero configuration deployment**

---

**Ready to set up Cloudinary? Follow the steps above and get real uploads working in 10 minutes!** 🚀

**Total cost: $0.00** 💰