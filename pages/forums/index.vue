<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h3 font-weight-bold">Forums</h1>
          
          <v-btn
            v-if="authStore.isAuthenticated"
            color="primary"
            prepend-icon="mdi-plus"
            elevation="2"
            @click="showCreateDialog = true"
          >
            New Forum
          </v-btn>
        </div>
        
        <v-card class="mb-6" elevation="2">
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              label="Search forums"
              prepend-inner-icon="mdi-magnify"
              :loading="isSearching"
              clearable
              variant="outlined"
              density="comfortable"
              hint="Search by title or description"
              persistent-hint
            />
          </v-card-text>
        </v-card>
        
        <LoadingSpinner 
          v-if="loading" 
          message="Loading forums..."
          :size="64"
        ></LoadingSpinner>
        
        <v-alert v-if="error" type="error" class="mb-4" closable>
          <div class="d-flex flex-column">
            <div class="text-subtitle-1 mb-2">{{ error }}</div>
            <div class="text-body-2">
              <strong>Troubleshooting:</strong>
              <ul class="mt-2">
                <li>Ensure your backend API server is running</li>
                <li>Check that the API URL in your .env file is correct</li>
                <li>Verify the API is accessible at: <code>{{ apiUrl }}</code></li>
              </ul>
            </div>
            <v-btn
              variant="outlined"
              size="default"
              class="mt-3 align-self-start retry-btn"
              @click="loadForums"
            >
              <v-icon left>mdi-refresh</v-icon>
              Retry
            </v-btn>
          </div>
        </v-alert>
        
        <div v-if="!loading && !error" style="height: 600px;">
          <VirtualList
            :items="filteredForums"
            :item-size="140"
            :buffer="300"
            key-field="id"
          >
            <template #default="{ item: forum }">
              <v-card 
                :to="getForumLink(forum.id)" 
                hover 
                class="forum-card mb-4 mx-1"
                elevation="2"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-start">
                    <!-- User Avatar -->
                    <v-avatar
                      :color="getAvatarColor(forum.userId)"
                      size="48"
                      class="mr-4 flex-shrink-0"
                    >
                      <span class="text-h6 font-weight-bold">
                        {{ getAvatarInitials(forum.userId) }}
                      </span>
                    </v-avatar>
                    
                    <!-- Forum Content -->
                    <div class="flex-grow-1">
                      <!-- Title with visual hierarchy -->
                      <h3 
                        class="text-h6 font-weight-bold mb-2 forum-title"
                        v-html="highlightText(forum.title, searchQuery)"
                      />
                      
                      <!-- Description -->
                      <p 
                        class="text-body-2 text-medium-emphasis mb-3 forum-description"
                        v-html="highlightText(forum.description, searchQuery)"
                      />
                      
                      <!-- Metadata with human-readable timestamps -->
                      <div class="d-flex align-center flex-wrap gap-4">
                        <div class="d-flex align-center text-caption text-medium-emphasis">
                          <v-icon size="small" class="mr-1">mdi-account</v-icon>
                          <span class="font-weight-medium">{{ forum.userId }}</span>
                        </div>
                        
                        <div class="d-flex align-center text-caption text-medium-emphasis">
                          <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                          <span>{{ formatTimeAgo(forum.createdAt) }}</span>
                        </div>
                        
                        <div class="d-flex align-center text-caption text-medium-emphasis">
                          <v-icon size="small" class="mr-1">mdi-comment-outline</v-icon>
                          <span>{{ forum.commentCount || 0 }} {{ forum.commentCount === 1 ? 'comment' : 'comments' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </template>
          </VirtualList>
        </div>
        
        <EmptyState
          v-if="!loading && !error && filteredForums.length === 0"
          icon="mdi-forum-outline"
          title="No forums found"
          :description="searchQuery ? `No forums match your search for '${searchQuery}'` : 'Be the first to start a discussion!'"
          :action-text="authStore.isAuthenticated ? 'Create Forum' : 'Login to Create'"
          action-icon="mdi-plus"
          @action="handleEmptyStateAction"
        />
      </v-col>
    </v-row>
    
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold">Create New Forum</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="newForum.title"
              label="Title"
              variant="outlined"
              :rules="[rules.required]"
              required
            />
            
            <v-textarea
              v-model="newForum.description"
              label="Description"
              variant="outlined"
              rows="3"
              :rules="[rules.required]"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            :loading="creating"
            @click="handleCreateForum"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const forumsStore = useForumsStore()
const authStore = useAuthStore()
const { handleApiError, handleSuccess } = useErrorHandler()
const config = useRuntimeConfig()

const apiUrl = config.public.apiBaseUrl

const loading = ref(true)
const error = ref<string | null>(null)
const showCreateDialog = ref(false)
const creating = ref(false)
const valid = ref(false)
const formRef = ref()

// Use computed to get forums from store for reactivity
const forums = computed(() => forumsStore.getAllSorted)

// Use debounced search composable
const { searchQuery, filteredItems: filteredForums, isSearching, highlightText } = useSearch(
  forums,
  ['title', 'description'],
  300
)

const newForum = ref({
  title: '',
  description: ''
})

const rules = {
  required: (v: string) => !!v || 'This field is required'
}

onMounted(async () => {
  await loadForums()
})

async function loadForums() {
  loading.value = true
  error.value = null
  
  try {
    await forumsStore.fetchAll()
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load forums')
  } finally {
    loading.value = false
  }
}

async function handleCreateForum() {
  if (!valid.value) return
  
  creating.value = true
  
  try {
    await forumsStore.createForum(newForum.value)
    handleSuccess('Forum created successfully!')
    showCreateDialog.value = false
    newForum.value = { title: '', description: '' }
    await loadForums()
  } catch (err: any) {
    handleApiError(err, 'Failed to create forum')
  } finally {
    creating.value = false
  }
}

function handleEmptyStateAction() {
  if (authStore.isAuthenticated) {
    showCreateDialog.value = true
  } else {
    navigateTo('/login')
  }
}

function getForumLink(forumId: string | number): string {
  return `/forums/${forumId}`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-ZA')
}

// Human-readable timestamp formatting
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`
  
  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

// Generate avatar initials from userId
function getAvatarInitials(userId: string): string {
  if (!userId || userId === 'unknown') return '?'
  
  // If userId is a number or UUID, use first two characters
  if (/^\d+$/.test(userId) || /^[0-9a-f-]+$/i.test(userId)) {
    return userId.substring(0, 2).toUpperCase()
  }
  
  // If userId is a name, use initials
  const parts = userId.split(/[\s_-]+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return userId.substring(0, 2).toUpperCase()
}

// Generate consistent color for avatar based on userId
function getAvatarColor(userId: string): string {
  const colors = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
    'purple',
    'indigo',
    'teal',
    'cyan',
    'pink',
    'deep-purple'
  ]
  
  // Generate a hash from userId
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Use hash to select a color
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
</script>

<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

:deep(.search-highlight) {
  background-color: #ffeb3b;
  color: #000;
  font-weight: 600;
  padding: 0 2px;
  border-radius: 2px;
}

.forum-card {
  transition: all 0.2s ease-in-out;
  border-radius: 12px;
}

.forum-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.forum-title {
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface));
}

.forum-description {
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gap-4 {
  gap: 1rem;
}

// Touch target improvements
.retry-btn {
  @include mobile {
    min-height: $touch-target-min;
    min-width: $touch-target-min;
  }
}
</style>
