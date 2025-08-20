# 🔧 Fix Cloudinary 400 Error - Upload Preset Issue

## 🚨 **Error: "Upload failed with status: 400"**

This error means the upload preset `streamrush_uploads` either:
1. **Doesn't exist** in your Cloudinary account
2. **Has wrong settings** (not unsigned)
3. **Has a different name** than expected

## 🛠️ **Step-by-Step Fix**

### **Step 1: Check if Upload Preset Exists**

1. **Go to**: https://cloudinary.com/console
2. **Login** with your account
3. **Click Settings** (gear icon in top right)
4. **Click "Upload"** in left sidebar
5. **Click "Upload presets"** tab
6. **Look for**: `streamrush_uploads`

### **Step 2A: If Preset Doesn't Exist - Create It**

1. **Click "Add upload preset"** button
2. **Fill in these EXACT settings**:

| Setting | Value | Critical |
|---------|-------|----------|
| **Preset name** | `streamrush_uploads` | ⚠️ Must be exact |
| **Signing Mode** | `Unsigned` | ⚠️ VERY IMPORTANT |
| **Folder** | `streamrush` | Optional |
| **Resource type** | `Auto` | Default is fine |
| **Access mode** | `Public` | Default is fine |

3. **Click "Save"**
4. **Wait 1-2 minutes** for preset to activate

### **Step 2B: If Preset Exists - Check Settings**

1. **Click on** `streamrush_uploads` preset
2. **Verify these settings**:
   - ✅ **Signing Mode**: Must be `Unsigned` (not `Signed`)
   - ✅ **Preset name**: Must be exactly `streamrush_uploads`
   - ✅ **Status**: Must be `Active`

3. **If any setting is wrong**:
   - **Change it** to the correct value
   - **Click "Save"**
   - **Wait 1-2 minutes**

### **Step 3: Alternative - Use Default Preset**

If you're having trouble creating the preset, let's use a default one:

1. **Update your `.env` file**:
   ```bash
   # Change this line:
   VITE_CLOUDINARY_UPLOAD_PRESET=streamrush_uploads
   
   # To this (uses default unsigned preset):
   VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
   ```

2. **Restart your dev server**:
   ```bash
   npm run dev
   ```

3. **Test again** on upload page

## 🧪 **Test Again**

After fixing the preset:

1. **Restart your development server**:
   ```bash
   # Stop server (Ctrl+C) and restart:
   npm run dev
   ```

2. **Go to**: http://localhost:3000/upload

3. **Click "Test Connection"** again

4. **Expected result**: ✅ "Cloudinary connection successful!"

## 🔍 **Still Getting 400 Error?**

### **Check Browser Console**

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Click "Test Connection"** again
4. **Look for detailed error message**

### **Common Issues & Solutions**

| Error Message | Solution |
|---------------|----------|
| `Invalid upload preset` | Preset doesn't exist - create it |
| `Must use unsigned upload` | Change Signing Mode to "Unsigned" |
| `Invalid cloud name` | Check your cloud name in .env |
| `Network error` | Check internet connection |

### **Double-Check Your Settings**

**Your `.env` file should have**:
```bash
VITE_CLOUDINARY_CLOUD_NAME=dxcd1rspr
VITE_CLOUDINARY_API_KEY=857549481975236
VITE_CLOUDINARY_UPLOAD_PRESET=streamrush_uploads
```

**Your Cloudinary preset should have**:
- ✅ Name: `streamrush_uploads`
- ✅ Signing Mode: `Unsigned`
- ✅ Status: Active

## 🚀 **Quick Alternative Solution**

If you're still having issues, let's use a simpler approach:

### **Option 1: Use Built-in Preset**

Many Cloudinary accounts come with a default unsigned preset. Let's try:

```bash
# In your .env file, try this preset:
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_default
```

### **Option 2: Create New Preset with Different Name**

1. **Create preset** with name: `unsigned_uploads`
2. **Update .env**:
   ```bash
   VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_uploads
   ```

## 📞 **Need More Help?**

**After trying the fixes above, let me know**:

1. **Did you find the upload preset** in your dashboard?
2. **What was the Signing Mode** set to?
3. **Are you still getting 400 error** after the fix?
4. **Any new error messages** in browser console?

**The 400 error is almost always a preset configuration issue - we'll get it working!** 🎯