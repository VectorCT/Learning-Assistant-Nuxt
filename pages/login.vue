<template>
  <div class="login-page">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="10" md="6" lg="5" xl="4">
          <!-- Branding Header -->
          <div class="text-center mb-8">
            <div class="brand-logo mb-4">
              <v-icon size="64" color="primary">mdi-school</v-icon>
            </div>
            <h1 class="text-h4 font-weight-bold mb-2">SA Learner Assistant</h1>
            <p class="text-body-1 text-medium-emphasis">
              Welcome back! Sign in to continue learning
            </p>
          </div>

          <!-- Login Card -->
          <MockAuthInfo />
          <v-card class="login-card" elevation="8">
            <v-card-text class="pa-8">
              <v-form ref="formRef" v-model="valid" @submit.prevent="handleLogin">
                <!-- Username Field -->
                <v-text-field
                  v-model="form.username"
                  label="Username"
                  prepend-inner-icon="mdi-account"
                  :rules="[rules.required]"
                  :error-messages="fieldErrors.username"
                  :disabled="loading"
                  class="mb-2"
                  required
                  @input="clearFieldError('username')"
                  @blur="validateField('username')"
                />
                
                <!-- Password Field -->
                <v-text-field
                  v-model="form.password"
                  label="Password"
                  prepend-inner-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="[rules.required]"
                  :error-messages="fieldErrors.password"
                  :disabled="loading"
                  class="mb-4"
                  required
                  @input="clearFieldError('password')"
                  @blur="validateField('password')"
                />
                
                <!-- Error Alert -->
                <v-expand-transition>
                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    closable
                    @click:close="error = null"
                  >
                    {{ error }}
                  </v-alert>
                </v-expand-transition>
                
                <!-- Login Button -->
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  size="x-large"
                  :loading="loading"
                  :disabled="!valid || loading"
                  class="mb-4 text-none font-weight-medium"
                  elevation="2"
                >
                  <template v-if="!loading">
                    <v-icon start>mdi-login</v-icon>
                    Sign In
                  </template>
                  <template v-else>
                    Signing in...
                  </template>
                </v-btn>
              </v-form>
            </v-card-text>
            
            <!-- Register Link -->
            <v-divider />
            <v-card-actions class="justify-center pa-6">
              <span class="text-body-2 text-medium-emphasis">
                Don't have an account?
                <NuxtLink to="/register" class="text-primary text-decoration-none font-weight-medium">
                  Create Account
                </NuxtLink>
              </span>
            </v-card-actions>
          </v-card>

          <!-- Theme Toggle -->
          <div class="text-center mt-6">
            <v-btn
              variant="text"
              size="small"
              @click="toggleTheme"
              class="text-none"
            >
              <v-icon start>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
              {{ isDark ? 'Light Mode' : 'Dark Mode' }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'

definePageMeta({
  middleware: 'guest'
})

const router = useRouter()
const route = useRoute()
const theme = useTheme()
const authStore = useAuthStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const formRef = ref()
const valid = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

const form = ref({
  username: '',
  password: ''
})

// Field-level error messages for visual feedback
const fieldErrors = ref<Record<string, string>>({
  username: '',
  password: ''
})

// Theme management
const isDark = computed(() => theme.global.current.value.dark)

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required'
}

// Clear field-specific error when user starts typing
const clearFieldError = (field: string) => {
  fieldErrors.value[field] = ''
  if (error.value) {
    error.value = null
  }
}

// Validate individual field on blur
const validateField = (field: string) => {
  const value = form.value[field as keyof typeof form.value]
  if (!value) {
    fieldErrors.value[field] = 'This field is required'
  } else {
    fieldErrors.value[field] = ''
  }
}

async function handleLogin() {
  if (!valid.value) return
  
  loading.value = true
  error.value = null
  fieldErrors.value = { username: '', password: '' }
  
  try {
    await authStore.login({
      username: form.value.username,
      password: form.value.password
    })
    
    handleSuccess('Login successful!')
    
    // Redirect to return URL or home
    const returnUrl = route.query.redirect as string || '/'
    router.push(returnUrl)
  } catch (err: any) {
    error.value = handleApiError(err, 'Login failed')
    
    // Add field-level errors for better UX
    if (err.response?.status === 401) {
      fieldErrors.value.username = 'Invalid credentials'
      fieldErrors.value.password = 'Invalid credentials'
    }
  } finally {
    loading.value = false
  }
}
</script>


<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgb(var(--v-theme-background)) 0%, 
    rgb(var(--v-theme-surface-variant)) 100%
  );
  position: relative;
  overflow: hidden;

  // Decorative background elements
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, 
      rgba(var(--v-theme-primary), 0.1) 0%, 
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, 
      rgba(var(--v-theme-secondary), 0.08) 0%, 
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  .v-container {
    position: relative;
    z-index: 1;
  }
}

// Brand logo animation
.brand-logo {
  animation: fadeInDown 0.6s ease-out;
  
  .v-icon {
    filter: drop-shadow(0 4px 12px rgba(var(--v-theme-primary), 0.3));
  }
}

// Login card styling
.login-card {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.95) !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out 0.2s both;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  }

  // Form field enhancements
  :deep(.v-text-field) {
    .v-field {
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(var(--v-theme-primary), 0.02);
      }
      
      &--focused {
        background: rgba(var(--v-theme-primary), 0.04);
        box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.1);
      }
    }

    // Error state styling
    &.v-input--error {
      .v-field {
        animation: shake 0.4s ease;
      }
    }
  }

  // Button enhancements
  :deep(.v-btn) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.4) !important;
    }

    &:not(:disabled):active {
      transform: translateY(0);
    }

    // Loading state
    &.v-btn--loading {
      pointer-events: none;
    }
  }
}

// Alert animation
.v-alert {
  animation: slideInDown 0.3s ease-out;
}

// Link styling
a {
  transition: all 0.2s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: rgb(var(--v-theme-primary));
    transition: width 0.3s ease;
  }
  
  &:hover {
    &::after {
      width: 100%;
    }
  }
}

// Animations
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

// Responsive adjustments
@media (max-width: 767px) {
  .login-page {
    &::before,
    &::after {
      display: none; // Hide decorative elements on mobile
    }
  }

  .brand-logo {
    .v-icon {
      font-size: 48px !important;
    }
  }

  .text-h4 {
    font-size: 1.75rem !important;
  }

  .login-card {
    :deep(.v-card-text) {
      padding: 24px !important;
    }

    :deep(.v-card-actions) {
      padding: 16px !important;
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .login-page {
    &::before {
      width: 400px;
      height: 400px;
    }

    &::after {
      width: 350px;
      height: 350px;
    }
  }
}

// Dark mode specific adjustments
:deep(.v-theme--dark) {
  .login-card {
    background: rgba(var(--v-theme-surface), 0.9) !important;
    border-color: rgba(var(--v-theme-outline), 0.3);
  }
}

// Accessibility: Reduce motion for users who prefer it
@media (prefers-reduced-motion: reduce) {
  .login-page::before,
  .login-page::after {
    animation: none;
  }

  .brand-logo,
  .login-card,
  .v-alert {
    animation: none;
  }

  .login-card {
    &:hover {
      transform: none;
    }
  }

  :deep(.v-btn:not(:disabled):hover) {
    transform: none;
  }

  a::after {
    transition: none;
  }
}

// Focus visible for keyboard navigation
:deep(*:focus-visible) {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
