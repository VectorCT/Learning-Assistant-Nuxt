# PWA Icons Required

To complete the PWA setup, you need to add the following icon files to this directory:

## Required Icons

1. **icon-192x192.png** - 192x192 pixels
   - Used for Android home screen and app drawer
   - Should be a square PNG with transparent background

2. **icon-512x512.png** - 512x512 pixels
   - Used for Android splash screen and high-resolution displays
   - Should be a square PNG with transparent background
   - Also used as maskable icon for adaptive icons

## Icon Design Guidelines

- Use the SA Learner Assistant logo or brand mark
- Ensure good contrast and visibility at small sizes
- For maskable icons, keep important content within the safe zone (80% of the icon)
- Use transparent background for better integration with different themes
- Test icons on both light and dark backgrounds

## Generating Icons

You can use tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)

## Example Command (using pwa-asset-generator)

```bash
npx pwa-asset-generator logo.svg ./public --icon-only --type png --padding "10%"
```

## Temporary Placeholder

Until proper icons are created, you can use a simple colored square as a placeholder:
- Create a 512x512 PNG with the brand color (#1976D2)
- Add white text "SA" in the center
- Resize to create the 192x192 version
