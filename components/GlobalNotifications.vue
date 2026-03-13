<template>
  <v-snackbar
    v-for="notification in notificationStore.notifications"
    :key="notification.id"
    v-model="notification.show"
    :color="notification.type"
    :timeout="notification.timeout"
    location="top right"
    multi-line
  >
    {{ notification.message }}
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="notificationStore.remove(notification.id)"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const notificationStore = useNotificationStore()
</script>
