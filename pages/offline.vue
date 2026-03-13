<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="120" color="grey">mdi-cloud-off-outline</v-icon>
        
        <h1 class="text-h3 mt-4 mb-2">You're Offline</h1>
        
        <p class="text-body-1 text-grey mb-6">
          It looks like you've lost your internet connection or the API server is not available.
          Please check your connection and try again.
        </p>
        
        <v-alert type="info" class="mb-4 text-left">
          <div class="text-subtitle-2 mb-2">For Developers:</div>
          <ul class="text-body-2">
            <li>Make sure your backend API server is running</li>
            <li>Check that the API URL in your .env file is correct</li>
            <li>Verify the API is accessible at: <code>{{ apiUrl }}</code></li>
          </ul>
        </v-alert>
        
        <v-btn
          color="primary"
          size="large"
          @click="reload"
        >
          <v-icon left>mdi-refresh</v-icon>
          Try Again
        </v-btn>
        
        <v-btn
          variant="text"
          class="ml-2"
          @click="goHome"
        >
          Go Home
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const router = useRouter()

const apiUrl = config.public.apiBaseUrl

function reload() {
  window.location.reload()
}

function goHome() {
  router.push('/')
}
</script>
