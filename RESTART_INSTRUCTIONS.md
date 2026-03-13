# Quick Restart Instructions

## To Fix the Styles and Font Errors

Run these commands in order:

### 1. Stop the Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running.

### 2. Clear Nuxt Cache

**On Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force .nuxt
Remove-Item -Recurse -Force .output
Remove-Item -Recurse -Force node_modules\.vite
```

**On Windows (CMD):**
```cmd
rmdir /s /q .nuxt
rmdir /s /q .output
rmdir /s /q node_modules\.vite
```

**On Mac/Linux:**
```bash
rm -rf .nuxt .output node_modules/.vite
```

### 3. Restart Dev Server
```bash
npm run dev
```

### 4. Hard Refresh Browser
- **Chrome/Edge:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Or:** Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

## What Was Fixed

✅ Removed duplicate CSS imports from `plugins/vuetify.ts`
✅ Deleted duplicate `app/app.vue` file
✅ Removed non-existent `PWAPrompt` component
✅ Added proper Vite SSR configuration for Vuetify

## Expected Result

After restarting, you should see:
- ✅ No 404 errors in console
- ✅ Vuetify styles loading correctly
- ✅ Material Design Icons displaying
- ✅ Forums page properly styled

## If It Still Doesn't Work

Try the nuclear option:
```bash
rm -rf node_modules package-lock.json .nuxt .output
npm install
npm run dev
```

Then hard refresh your browser again.
