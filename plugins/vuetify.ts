import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Daily.dev-inspired color palette with purple accents
const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    // Primary purple accent inspired by daily.dev
    primary: '#7C3AED', // Purple-600
    'primary-darken-1': '#6D28D9', // Purple-700
    'primary-lighten-1': '#8B5CF6', // Purple-500
    
    // Secondary colors
    secondary: '#64748B', // Slate-500
    'secondary-darken-1': '#475569', // Slate-600
    'secondary-lighten-1': '#94A3B8', // Slate-400
    
    // Accent colors
    accent: '#A78BFA', // Purple-400
    
    // Semantic colors
    error: '#EF4444', // Red-500
    warning: '#F59E0B', // Amber-500
    info: '#3B82F6', // Blue-500
    success: '#10B981', // Green-500
    
    // Background and surface colors
    background: '#F8FAFC', // Slate-50
    surface: '#FFFFFF',
    'surface-variant': '#F1F5F9', // Slate-100
    'surface-bright': '#FFFFFF',
    'surface-light': '#FAFAFA',
    
    // Text colors
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#0F172A', // Slate-900
    'on-surface': '#1E293B', // Slate-800
    'on-surface-variant': '#475569', // Slate-600
    
    // Border colors
    outline: '#E2E8F0', // Slate-200
    'outline-variant': '#CBD5E1', // Slate-300
  }
}

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    // Primary purple accent inspired by daily.dev
    primary: '#A78BFA', // Purple-400 (lighter for dark mode)
    'primary-darken-1': '#8B5CF6', // Purple-500
    'primary-lighten-1': '#C4B5FD', // Purple-300
    
    // Secondary colors
    secondary: '#94A3B8', // Slate-400
    'secondary-darken-1': '#64748B', // Slate-500
    'secondary-lighten-1': '#CBD5E1', // Slate-300
    
    // Accent colors
    accent: '#C4B5FD', // Purple-300
    
    // Semantic colors
    error: '#F87171', // Red-400
    warning: '#FBBF24', // Amber-400
    info: '#60A5FA', // Blue-400
    success: '#34D399', // Green-400
    
    // Background and surface colors (daily.dev dark theme inspired)
    background: '#0F172A', // Slate-900
    surface: '#1E293B', // Slate-800
    'surface-variant': '#334155', // Slate-700
    'surface-bright': '#475569', // Slate-600
    'surface-light': '#1E293B',
    
    // Text colors
    'on-primary': '#0F172A', // Slate-900
    'on-secondary': '#0F172A',
    'on-background': '#F1F5F9', // Slate-100
    'on-surface': '#E2E8F0', // Slate-200
    'on-surface-variant': '#CBD5E1', // Slate-300
    
    // Border colors
    outline: '#334155', // Slate-700
    'outline-variant': '#475569', // Slate-600
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  // Get saved theme preference from localStorage or default to light
  const savedTheme = process.client 
    ? localStorage.getItem('theme') || 'light'
    : 'light'

  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: savedTheme,
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      variations: {
        colors: ['primary', 'secondary', 'accent'],
        lighten: 2,
        darken: 2,
      },
    },
    display: {
      mobileBreakpoint: 'md',
      thresholds: {
        xs: 0,        // Mobile: 0-767px
        sm: 768,      // Tablet: 768-1023px
        md: 1024,     // Desktop: 1024-1279px
        lg: 1280,     // Large desktop: 1280-1919px
        xl: 1920,     // Extra large: 1920px+
      },
    },
    defaults: {
      // Typography settings optimized for educational content
      VBtn: {
        style: 'text-transform: none; letter-spacing: normal;',
        rounded: 'lg',
        // Ensure minimum touch target size on mobile (44px)
        minHeight: 44,
      },
      VCard: {
        rounded: 'lg',
        elevation: 2,
      },
      VTextField: {
        variant: 'outlined',
        color: 'primary',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        color: 'primary',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        color: 'primary',
        rounded: 'lg',
      },
      VAutocomplete: {
        variant: 'outlined',
        color: 'primary',
        rounded: 'lg',
      },
      VChip: {
        rounded: 'lg',
      },
      VAlert: {
        rounded: 'lg',
      },
      VListItem: {
        minHeight: 48, // Comfortable touch target for list items
      },
      VCheckbox: {
        density: 'comfortable', // Ensures adequate spacing
      },
      VRadio: {
        density: 'comfortable', // Ensures adequate spacing
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)

  // Watch for theme changes and persist to localStorage
  if (process.client) {
    watch(
      () => vuetify.theme.global.name.value,
      (newTheme) => {
        localStorage.setItem('theme', newTheme)
      }
    )
  }
})
