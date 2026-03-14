// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: ['@pinia/nuxt', '@nuxt/image', '@vite-pwa/nuxt'],
  
  css: ['~/assets/styles/main.scss'],
  
  build: {
    transpile: ['vuetify']
  },
  
  vite: {
    ssr: {
      noExternal: ['vuetify']
    }
  },
  
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://localhost:7191/api'
    }
  },
  
  image: {
    // Enable image optimization
    quality: 80,
    format: ['webp', 'jpg', 'png'],
    
    // Configure responsive image sizes
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    
    // Configure providers
    providers: {
      // Use default provider for external images
    },
    
    // Enable lazy loading by default
    presets: {
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 70,
          width: 300,
          height: 200,
          fit: 'cover'
        }
      },
      hero: {
        modifiers: {
          format: 'webp',
          quality: 85,
          width: 1200,
          height: 600,
          fit: 'cover'
        }
      },
      content: {
        modifiers: {
          format: 'webp',
          quality: 80,
          fit: 'inside'
        }
      }
    }
  },
  
  app: {
    head: {
      title: 'SA Learner Assistant',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Educational platform for South African learners (grades 8-12)' },
        { name: 'theme-color', content: '#7C3AED' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icon-192x192.png' }
      ],
      script: [
        {
          innerHTML: "(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark'){document.documentElement.style.backgroundColor='#0F172A';document.documentElement.style.color='#E2E8F0';document.documentElement.classList.add('app-dark')}else{document.documentElement.style.backgroundColor='#F8FAFC';document.documentElement.style.color='#1E293B';document.documentElement.classList.add('app-light')}}catch(e){document.documentElement.style.backgroundColor='#0F172A';document.documentElement.classList.add('app-dark')}})()",
          type: 'text/javascript',
          tagPosition: 'head'
        }
      ]
    }
  },
  
  // @ts-ignore - PWA module types
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'SA Learner Assistant',
      short_name: 'SA Learner',
      description: 'Educational platform for South African learners (grades 8-12)',
      theme_color: '#7C3AED', // Purple primary color from design system
      background_color: '#0F172A', // Dark background
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/offline',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,jpg,jpeg,webp}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }: any) => url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5 minutes
            },
            cacheableResponse: {
              statuses: [0, 200]
            },
            networkTimeoutSeconds: 10
          }
        },
        {
          urlPattern: ({ url }: any) => url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/),
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: ({ url }: any) => url.pathname.match(/\.(woff|woff2|ttf|eot)$/),
          handler: 'CacheFirst' as const,
          options: {
            cacheName: 'font-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: false,  // Disable PWA in development to avoid console noise
      type: 'module'
    }
  },
  
  compatibilityDate: '2024-01-01'
})
