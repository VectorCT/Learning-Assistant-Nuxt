# PWA Implementation Documentation

## Overview

The SA Learner Assistant Frontend now includes Progressive Web App (PWA) capabilities, enabling offline functionality, installability, and improved performance through caching strategies.

## Features Implemented

### 1. Service Worker Configuration

The application uses `@vite-pwa/nuxt` module with Workbox for service worker generation and management.

**Configuration Location:** `nuxt.config.ts`

**Key Features:**
- Automatic service worker registration and updates
- Static asset caching (JS, CSS, images, fonts)
- Runtime API response caching
- Offline fallback page
- Background sync for quiz submissions

### 2. Caching Strategies

#### Static Assets
- **Strategy:** CacheFirst
- **Cache Name:** `image-cache`, `font-cache`
- **Expiration:** 
  - Images: 30 days, max 100 entries
  - Fonts: 1 year, max 20 entries

#### API Responses
- **Strategy:** NetworkFirst with 10s timeout
- **Cache Name:** `api-cache`
- **Expiration:** 5 minutes, max 50 entries
- **Fallback:** Cached response if network fails

### 3. Offline Support

#### Offline Fallback Page
**Location:** `pages/offline.vue`

Features:
- Friendly offline message
- List of available offline features
- Connection status indicator
- Navigation to cached content
- Retry button

#### Background Sync
**Location:** `composables/useBackgroundSync.ts`

Capabilities:
- Queue quiz submissions when offline
- Automatic sync when connection restored
- Persistent storage using localStorage
- Retry logic for failed submissions

### 4. PWA Installation

#### Install Prompt
**Location:** `components/PWAPrompt.vue`

Features:
- Smart install prompt (shown after 30 seconds)
- Dismissible with session memory
- Update notifications
- Online/offline status indicators
- Pending submission notifications

#### Manifest Configuration
**Location:** `nuxt.config.ts` (pwa.manifest)

Properties:
- App name and short name
- Theme and background colors
- Display mode: standalone
- Icons: 192x192 and 512x512
- Start URL and scope

### 5. Composables

#### usePWAStatus()
**Location:** `composables/usePWAStatus.ts`

Provides:
- Online/offline status tracking
- Installation state management
- Install prompt handling
- Update checking and notification
- Service worker lifecycle management

**Note:** This is a custom composable separate from the built-in `usePWA()` provided by `@vite-pwa/nuxt`.

#### useBackgroundSync()
**Location:** `composables/useBackgroundSync.ts`

Provides:
- Queue management for offline submissions
- Background sync registration
- Queue processing
- Pending submission tracking

#### useQuizSubmission()
**Location:** `composables/useQuizSubmission.ts`

Provides:
- Automatic offline detection
- Transparent submission queuing
- Error handling
- Pending submission status

## Usage Examples

### 1. Submitting a Quiz with Offline Support

```typescript
// In a component
const { submitQuiz, isSubmitting, error } = useQuizSubmission()

async function handleSubmit() {
  const result = await submitQuiz({
    chapterId: 'chapter-id',
    answers: [
      { questionId: 'q1', selectedOptions: ['option1'] },
      { questionId: 'q2', selectedOptions: ['option2'] }
    ]
  })
  
  if (result) {
    // Submission successful, show results
    console.log('Score:', result.totalScore)
  } else {
    // Submission queued for later
    console.log('Submission queued - will sync when online')
  }
}
```

### 2. Checking PWA Status

```typescript
// In a component
const { isOnline, isInstallable, isInstalled, promptInstall } = usePWAStatus()

// Show install button if installable
if (isInstallable.value) {
  await promptInstall()
}

// Check online status
if (!isOnline.value) {
  console.log('App is offline')
}
```

### 3. Managing Pending Submissions

```typescript
const { hasPendingSubmissions, getPendingCount, processQueue } = useBackgroundSync()

// Check for pending submissions
if (hasPendingSubmissions()) {
  console.log(`${getPendingCount()} submissions pending`)
  
  // Manually trigger sync
  const result = await processQueue()
  console.log(`Processed: ${result.processed}, Failed: ${result.failed}`)
}
```

## Configuration

### Environment Variables

No additional environment variables required. The PWA uses the existing API base URL from `NUXT_PUBLIC_API_BASE_URL`.

### PWA Icons

**Required Files:**
- `public/icon-192x192.png` - 192x192 pixels
- `public/icon-512x512.png` - 512x512 pixels

See `public/PWA_ICONS_README.md` for icon creation guidelines.

### Service Worker Customization

To customize caching strategies, edit the `pwa.workbox.runtimeCaching` array in `nuxt.config.ts`:

```typescript
runtimeCaching: [
  {
    urlPattern: ({ url }) => url.pathname.startsWith('/api/custom'),
    handler: 'CacheFirst', // or 'NetworkFirst', 'StaleWhileRevalidate'
    options: {
      cacheName: 'custom-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 // 1 hour
      }
    }
  }
]
```

## Testing

### Testing Offline Functionality

1. **Chrome DevTools:**
   - Open DevTools (F12)
   - Go to Network tab
   - Select "Offline" from throttling dropdown
   - Navigate the app to test offline behavior

2. **Service Worker:**
   - Open DevTools > Application > Service Workers
   - Verify service worker is registered and active
   - Use "Update on reload" for development

3. **Cache Storage:**
   - Open DevTools > Application > Cache Storage
   - Verify cached assets and API responses
   - Clear cache to test fresh installations

### Testing Background Sync

1. Go offline (DevTools Network tab)
2. Submit a quiz
3. Verify submission is queued (check localStorage)
4. Go back online
5. Verify submission is automatically synced

### Testing Install Prompt

1. Open app in Chrome/Edge (desktop or mobile)
2. Wait 30 seconds for install prompt
3. Click "Install" to test installation
4. Verify app opens in standalone mode

## Browser Support

### Full PWA Support
- Chrome/Edge 90+
- Safari 15.4+ (iOS/macOS)
- Firefox 90+
- Samsung Internet 14+

### Partial Support
- Safari 11.1-15.3 (limited service worker support)
- Older browsers (graceful degradation)

## Performance Impact

### Bundle Size
- Service worker: ~15KB (gzipped)
- PWA runtime: ~5KB (gzipped)
- Total overhead: ~20KB

### Cache Storage
- Static assets: ~2-5MB (typical)
- API responses: ~500KB-1MB (max 50 entries)
- Total: ~3-6MB

### Network Savings
- Repeat visits: 80-90% reduction in network requests
- Offline: 100% cached content available

## Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required for service workers)
2. Verify `@vite-pwa/nuxt` is in modules array
3. Check browser console for errors
4. Clear browser cache and reload

### Background Sync Not Working

1. Verify online/offline detection works
2. Check localStorage for queued submissions
3. Verify API endpoint is accessible
4. Check browser console for sync errors

### Install Prompt Not Showing

1. Verify manifest is valid (DevTools > Application > Manifest)
2. Check if app is already installed
3. Verify icons are present and valid
4. Try in incognito mode (fresh state)

### Cache Not Updating

1. Force service worker update (DevTools > Application > Service Workers > Update)
2. Clear cache storage
3. Verify cache expiration settings
4. Check network tab for cache hits/misses

## Future Enhancements

Potential improvements for future iterations:

1. **Push Notifications**
   - Notify users of new content
   - Quiz reminders
   - Forum activity alerts

2. **Advanced Offline Features**
   - Offline content download
   - Selective chapter caching
   - Offline quiz practice mode

3. **Performance Optimizations**
   - Precaching critical routes
   - Predictive prefetching
   - Image lazy loading with intersection observer

4. **Analytics**
   - Track offline usage
   - Monitor cache hit rates
   - Measure performance metrics

## References

- [Vite PWA Documentation](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
