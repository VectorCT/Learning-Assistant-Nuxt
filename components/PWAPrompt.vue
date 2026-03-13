<template>
  <div>
    <!-- Install Prompt -->
    <v-snackbar
      v-model="showInstallPrompt"
      :timeout="-1"
      location="bottom"
      color="primary"
    >
      <div class="d-flex align-center">
        <v-icon left>mdi-download</v-icon>
        <span>Install SA Learner Assistant for offline access</span>
      </div>
      
      <template #actions>
        <v-btn
          variant="text"
          @click="handleInstall"
        >
          Install
        </v-btn>
        <v-btn
          variant="text"
          @click="dismissInstallPrompt"
        >
          Not Now
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Update Available -->
    <v-snackbar
      v-model="showUpdatePrompt"
      :timeout="-1"
      location="bottom"
      color="info"
    >
      <div class="d-flex align-center">
        <v-icon left>mdi-update</v-icon>
        <span>A new version is available</span>
      </div>
      
      <template #actions>
        <v-btn
          variant="text"
          @click="handleUpdate"
        >
          Update
        </v-btn>
        <v-btn
          variant="text"
          @click="dismissUpdatePrompt"
        >
          Later
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Offline Indicator -->
    <v-snackbar
      v-model="showOfflineIndicator"
      :timeout="3000"
      location="top"
      color="warning"
    >
      <div class="d-flex align-center">
        <v-icon left>mdi-cloud-off-outline</v-icon>
        <span>You're offline. Some features may be limited.</span>
      </div>
    </v-snackbar>

    <!-- Back Online -->
    <v-snackbar
      v-model="showOnlineIndicator"
      :timeout="3000"
      location="top"
      color="success"
    >
      <div class="d-flex align-center">
        <v-icon left>mdi-cloud-check-outline</v-icon>
        <span>You're back online!</span>
      </div>
    </v-snackbar>

    <!-- Pending Submissions -->
    <v-snackbar
      v-model="showPendingSubmissions"
      :timeout="5000"
      location="bottom"
      color="info"
    >
      <div class="d-flex align-center">
        <v-icon left>mdi-sync</v-icon>
        <span>{{ pendingCount }} quiz submission(s) synced successfully</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

// Check if running on client
const isClient = typeof window !== 'undefined'

const { isOnline, isInstallable, needsUpdate, promptInstall, reloadForUpdate } = usePWAStatus()
const { hasPendingSubmissions, getPendingCount, processQueue } = useBackgroundSync()

const showInstallPrompt = ref(false)
const showUpdatePrompt = ref(false)
const showOfflineIndicator = ref(false)
const showOnlineIndicator = ref(false)
const showPendingSubmissions = ref(false)
const pendingCount = ref(0)
const wasOffline = ref(isClient ? !navigator.onLine : false)

// Show install prompt after a delay if installable
watch(isInstallable, (installable) => {
  if (installable) {
    // Show prompt after 30 seconds
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 30000)
  }
})

// Show update prompt when update is available
watch(needsUpdate, (hasUpdate) => {
  if (hasUpdate) {
    showUpdatePrompt.value = true
  }
})

// Watch online status changes
watch(isOnline, (online) => {
  if (!online && !wasOffline.value) {
    // Just went offline
    showOfflineIndicator.value = true
    wasOffline.value = true
  } else if (online && wasOffline.value) {
    // Just came back online
    showOnlineIndicator.value = true
    wasOffline.value = false
    
    // Process pending submissions
    if (hasPendingSubmissions()) {
      processQueue().then(result => {
        if (result.processed > 0) {
          pendingCount.value = result.processed
          showPendingSubmissions.value = true
        }
      })
    }
  }
})

async function handleInstall() {
  const installed = await promptInstall()
  if (installed) {
    showInstallPrompt.value = false
  }
}

function dismissInstallPrompt() {
  showInstallPrompt.value = false
  // Don't show again for this session
  if (isClient) {
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }
}

function handleUpdate() {
  reloadForUpdate()
}

function dismissUpdatePrompt() {
  showUpdatePrompt.value = false
}

onMounted(() => {
  if (!isClient) return
  
  // Check if install prompt was already dismissed
  const dismissed = sessionStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    showInstallPrompt.value = false
  }
  
  // Set initial offline state
  wasOffline.value = !navigator.onLine
})
</script>
