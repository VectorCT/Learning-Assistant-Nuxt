import { vi } from 'vitest'

// Mock Nuxt auto-imports
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: 'http://localhost:5000/api'
  }
}))

global.useRouter = vi.fn(() => ({
  push: vi.fn()
}))

global.useHead = vi.fn()
