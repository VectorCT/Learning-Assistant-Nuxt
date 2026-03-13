<template>
  <v-alert
    v-if="showInfo"
    type="info"
    variant="tonal"
    closable
    class="mock-auth-info"
    @click:close="showInfo = false"
  >
    <div class="d-flex align-center">
      <v-icon start>mdi-information</v-icon>
      <div>
        <div class="font-weight-bold mb-1">Mock Authentication Active</div>
        <div class="text-body-2">
          Test credentials:
          <ul class="mt-2 mb-0">
            <li><strong>Admin:</strong> admin / admin123</li>
            <li><strong>User:</strong> testuser / test123</li>
          </ul>
        </div>
      </div>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInfo = ref(false)

onMounted(() => {
  // Show info banner if not dismissed
  if (process.client) {
    const dismissed = localStorage.getItem('mock_auth_info_dismissed')
    showInfo.value = !dismissed
  }
})

const hideInfo = () => {
  showInfo.value = false
  if (process.client) {
    localStorage.setItem('mock_auth_info_dismissed', 'true')
  }
}
</script>

<style scoped lang="scss">
.mock-auth-info {
  margin-bottom: 16px;
  
  ul {
    padding-left: 20px;
    
    li {
      margin: 4px 0;
    }
  }
}
</style>
