<template>
  <v-container fluid class="admin-dashboard pa-6">
    <div class="mb-6">
      <h1 class="text-h3 font-weight-bold mb-2">Admin Dashboard</h1>
      <p class="text-body-1 text-medium-emphasis">Manage your learning platform</p>
    </div>
    
    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
        <v-card 
          class="stat-card" 
          :style="{ borderLeft: `4px solid rgb(var(--v-theme-${stat.color}))` }"
          elevation="2"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold mb-1">{{ stat.value }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ stat.title }}</div>
              </div>
              <v-avatar :color="stat.color" size="56" class="stat-icon">
                <v-icon :icon="stat.icon" size="32" color="white" />
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- Quick Actions Card -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon icon="mdi-lightning-bolt" class="mr-2" color="primary" />
            <span class="text-h6 font-weight-bold">Quick Actions</span>
          </v-card-title>
          <v-divider />
          <v-list class="py-0">
            <v-list-item
              v-for="(action, index) in quickActions"
              :key="action.title"
              :to="action.to"
              :prepend-icon="action.icon"
              class="action-item"
              :class="{ 'border-b': index < quickActions.length - 1 }"
            >
              <v-list-item-title class="font-weight-medium">{{ action.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ action.subtitle }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-icon icon="mdi-chevron-right" size="small" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <!-- Recent Activity Card -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon icon="mdi-clock-outline" class="mr-2" color="info" />
            <span class="text-h6 font-weight-bold">Recent Activity</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div class="text-center py-8">
              <v-icon icon="mdi-chart-timeline-variant" size="64" color="grey-lighten-1" />
              <p class="text-body-2 text-medium-emphasis mt-4">Activity feed coming soon...</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  requiresAdmin: true
})

const stats = ref([
  { title: 'Total Subjects', value: 0, icon: 'mdi-book-open', color: 'primary' },
  { title: 'Total Chapters', value: 0, icon: 'mdi-book-multiple', color: 'success' },
  { title: 'Total Questions', value: 0, icon: 'mdi-help-circle', color: 'warning' },
  { title: 'Total Users', value: 0, icon: 'mdi-account-group', color: 'info' }
])

const quickActions = [
  {
    title: 'Manage Subjects',
    subtitle: 'Add, edit, or remove subjects',
    icon: 'mdi-book-open',
    to: '/admin/subjects'
  },
  {
    title: 'Manage Chapters',
    subtitle: 'Create and organize chapter content',
    icon: 'mdi-book-multiple',
    to: '/admin/chapters'
  },
  {
    title: 'Manage Questions',
    subtitle: 'Build your question bank',
    icon: 'mdi-help-circle',
    to: '/admin/questions'
  },
  {
    title: 'Moderate Forums',
    subtitle: 'Review and manage forum discussions',
    icon: 'mdi-forum',
    to: '/admin/forums'
  }
]

onMounted(async () => {
  // Load statistics
  try {
    const subjectsStore = useSubjectsStore()
    const chaptersStore = useChaptersStore()
    const questionsStore = useQuestionsStore()
    
    const subjects = await subjectsStore.fetchAll()
    const chapters = await chaptersStore.fetchAll()
    
    stats.value[0].value = subjects.length
    stats.value[1].value = chapters.length
    // Questions and users would need separate API calls
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.stat-icon {
  opacity: 0.9;
}

.action-item {
  min-height: 64px;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.h-100 {
  height: 100%;
}
</style>
