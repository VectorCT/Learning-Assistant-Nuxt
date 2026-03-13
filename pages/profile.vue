<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">My Profile</h1>
      </v-col>
    </v-row>

    <!-- User Information Card -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-account-circle</v-icon>
            User Information
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div class="mb-4">
              <div class="text-caption text-grey">Username</div>
              <div class="text-h6">{{ authStore.user?.username }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey">Email</div>
              <div class="text-body-1">{{ authStore.user?.email }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey">Role</div>
              <v-chip :color="authStore.isAdmin ? 'primary' : 'secondary'" size="small">
                {{ authStore.isAdmin ? 'Administrator' : 'Learner' }}
              </v-chip>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="flex-column align-stretch pa-4">
            <v-btn
              color="primary"
              variant="outlined"
              block
              class="mb-2"
              @click="showChangePasswordDialog = true"
            >
              <v-icon left>mdi-lock-reset</v-icon>
              Change Password
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              block
              @click="handleLogout"
            >
              <v-icon left>mdi-logout</v-icon>
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Activity Summary -->
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            <v-icon left>mdi-chart-box</v-icon>
            Activity Summary
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4">
                <v-card variant="outlined" color="primary">
                  <v-card-text class="text-center">
                    <div class="text-h3 primary--text">{{ quizHistory.length }}</div>
                    <div class="text-caption">Quizzes Completed</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card variant="outlined" color="success">
                  <v-card-text class="text-center">
                    <div class="text-h3 success--text">{{ averageScore }}%</div>
                    <div class="text-caption">Average Score</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card variant="outlined" color="info">
                  <v-card-text class="text-center">
                    <div class="text-h3 info--text">{{ userForumActivity.length }}</div>
                    <div class="text-caption">Forum Posts</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Quiz History -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            <v-icon left>mdi-clipboard-text</v-icon>
            Quiz History
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-data-table
              :headers="quizHeaders"
              :items="quizHistory"
              :loading="loadingQuizHistory"
              :items-per-page="5"
              class="elevation-0"
            >
              <template #item.score="{ item }">
                <v-chip
                  :color="getScoreColor(item.percentage)"
                  size="small"
                >
                  {{ item.score }}/{{ item.maxScore }} ({{ item.percentage }}%)
                </v-chip>
              </template>
              <template #item.completedAt="{ item }">
                {{ formatDate(item.completedAt) }}
              </template>
              <template #no-data>
                <div class="text-center py-4">
                  <v-icon size="64" color="grey">mdi-clipboard-text-off</v-icon>
                  <div class="text-body-1 mt-2">No quiz history yet</div>
                  <div class="text-caption text-grey">Complete a quiz to see your results here</div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Forum Activity -->
        <v-card>
          <v-card-title class="text-h5">
            <v-icon left>mdi-forum</v-icon>
            Forum Activity
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-list v-if="userForumActivity.length > 0">
              <template v-for="(activity, index) in userForumActivity" :key="activity.id">
                <v-list-item @click="navigateToForum(activity.forumId)">
                  <template #prepend>
                    <v-icon :color="activity.type === 'forum' ? 'primary' : 'secondary'">
                      {{ activity.type === 'forum' ? 'mdi-forum' : 'mdi-comment' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ activity.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ activity.type === 'forum' ? 'Created forum' : 'Posted comment' }} • 
                    {{ formatDate(activity.createdAt) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-divider v-if="index < userForumActivity.length - 1" />
              </template>
            </v-list>
            <div v-else class="text-center py-4">
              <v-icon size="64" color="grey">mdi-forum-outline</v-icon>
              <div class="text-body-1 mt-2">No forum activity yet</div>
              <div class="text-caption text-grey">Start a discussion or comment on a forum</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Change Password Dialog -->
    <v-dialog v-model="showChangePasswordDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Change Password</v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="passwordFormRef" v-model="passwordFormValid">
            <v-text-field
              v-model="passwordForm.currentPassword"
              label="Current Password"
              type="password"
              :rules="[rules.required]"
              prepend-icon="mdi-lock"
              required
            />
            <v-text-field
              v-model="passwordForm.newPassword"
              label="New Password"
              type="password"
              :rules="[rules.required, rules.minLength]"
              prepend-icon="mdi-lock-reset"
              required
            />
            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              type="password"
              :rules="[rules.required, rules.passwordMatch]"
              prepend-icon="mdi-lock-check"
              required
            />
          </v-form>
          <v-alert v-if="passwordError" type="error" class="mt-4">
            {{ passwordError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closePasswordDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="changingPassword"
            :disabled="!passwordFormValid"
            @click="handleChangePassword"
          >
            Change Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()
const forumsStore = useForumsStore()
const commentsStore = useCommentsStore()
const { handleApiError, handleSuccess } = useErrorHandler()

// State
const loadingQuizHistory = ref(false)
const quizHistory = ref<any[]>([])
const userForumActivity = ref<any[]>([])

// Change Password Dialog
const showChangePasswordDialog = ref(false)
const passwordFormRef = ref()
const passwordFormValid = ref(false)
const changingPassword = ref(false)
const passwordError = ref<string | null>(null)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Quiz History Table Headers
const quizHeaders = [
  { title: 'Chapter', key: 'chapterTitle', sortable: true },
  { title: 'Score', key: 'score', sortable: true },
  { title: 'Completed', key: 'completedAt', sortable: true }
]

// Validation Rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (v: string) => (v && v.length >= 6) || 'Password must be at least 6 characters',
  passwordMatch: (v: string) => v === passwordForm.value.newPassword || 'Passwords do not match'
}

// Computed
const averageScore = computed(() => {
  if (quizHistory.value.length === 0) return 0
  const total = quizHistory.value.reduce((sum, quiz) => sum + quiz.percentage, 0)
  return Math.round(total / quizHistory.value.length)
})

// Methods
function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning'
  return 'error'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function navigateToForum(forumId: string) {
  router.push(`/forums/${forumId}`)
}

async function loadQuizHistory() {
  loadingQuizHistory.value = true
  try {
    const api = useApi()
    const history = await api.getUserQuizHistory()
    quizHistory.value = history || []
  } catch (error: any) {
    // If API endpoint doesn't exist yet, use empty array
    if (error.response?.status === 404) {
      quizHistory.value = []
    } else {
      handleApiError(error, 'Failed to load quiz history')
    }
  } finally {
    loadingQuizHistory.value = false
  }
}

async function loadForumActivity() {
  try {
    // Fetch all forums and comments
    await forumsStore.fetchAll()
    const allForums = forumsStore.getAllSorted
    
    // Filter forums created by current user
    const userForums = allForums
      .filter(forum => forum.userId === authStore.user?.id)
      .map(forum => ({
        id: forum.id,
        forumId: forum.id,
        type: 'forum',
        title: forum.title,
        createdAt: forum.createdAt
      }))
    
    // Get user comments from all forums
    const userComments: any[] = []
    for (const forum of allForums) {
      const comments = await commentsStore.fetchByForum(forum.id)
      const userForumComments = comments
        .filter((comment: any) => comment.userId === authStore.user?.id)
        .map((comment: any) => ({
          id: comment.id,
          forumId: forum.id,
          type: 'comment',
          title: `Comment on "${forum.title}"`,
          createdAt: comment.createdAt
        }))
      userComments.push(...userForumComments)
    }
    
    // Combine and sort by date
    userForumActivity.value = [...userForums, ...userComments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10) // Show only latest 10 activities
  } catch (error: any) {
    handleApiError(error, 'Failed to load forum activity')
  }
}

async function handleChangePassword() {
  if (!passwordFormValid.value) return
  
  changingPassword.value = true
  passwordError.value = null
  
  try {
    const api = useApi()
    await api.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    handleSuccess('Password changed successfully')
    closePasswordDialog()
  } catch (error: any) {
    passwordError.value = handleApiError(error, 'Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

function closePasswordDialog() {
  showChangePasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordError.value = null
  passwordFormRef.value?.reset()
}

async function handleLogout() {
  authStore.logout()
  handleSuccess('Logged out successfully')
  router.push('/login')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadQuizHistory(),
    loadForumActivity()
  ])
})
</script>
