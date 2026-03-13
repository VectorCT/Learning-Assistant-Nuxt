<template>
  <v-container fluid class="admin-forums pa-6">
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Manage Forums</h1>
          <p class="text-body-2 text-medium-emphasis">Review and moderate forum discussions</p>
        </div>
      </div>
    </div>

    <v-card elevation="2">
      <LoadingSpinner 
        v-if="loading" 
        message="Loading forums..."
      />
      <AdminTable
        v-else
        :items="forumsWithDetails"
        :headers="headers"
        :loading="loading"
        :custom-actions="customActions"
        @edit="handleEdit"
        @delete="handleDelete"
        @custom-action="handleCustomAction"
      />
      <EmptyState
        v-if="!loading && forums.length === 0"
        icon="mdi-forum"
        title="No forums yet"
        description="Forums created by users will appear here for moderation"
      />
    </v-card>
    
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title class="pa-4 pb-2">
          <span class="text-h6 font-weight-bold">Edit Forum</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="form.title"
              label="Title"
              :rules="[rules.required]"
              required
            />
            
            <v-textarea
              v-model="form.description"
              label="Description"
              rows="3"
              :rules="[rules.required]"
              required
            />
            
            <v-combobox
              v-model="form.tags"
              label="Tags"
              multiple
              chips
              closable-chips
              hint="Press Enter to add tags"
              persistent-hint
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            :loading="saving"
            @click="handleSave"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Forum"
      message="Are you sure you want to delete this forum? This action cannot be undone and will delete all associated comments."
      danger
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({
  middleware: 'auth',
  requiresAdmin: true
})

const forumsStore = useForumsStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const forums = ref<any[]>([])
const loading = ref(true)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingForum = ref<any>(null)
const deletingForum = ref<any>(null)
const saving = ref(false)
const valid = ref(false)
const formRef = ref()

const form = ref({
  title: '',
  description: '',
  tags: [] as string[]
})

const headers = [
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Author', key: 'authorName' },
  { title: 'Created Date', key: 'createdAtFormatted', sortable: true },
  { title: 'Comments', key: 'commentCount', sortable: true },
  { title: 'Status', key: 'statusText' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const customActions = [
  { name: 'toggle-lock', label: 'Lock/Unlock' }
]

const rules = {
  required: (v: string) => !!v || 'This field is required'
}

const forumsWithDetails = computed(() => {
  return forums.value.map((forum: any) => ({
    ...forum,
    authorName: forum.userName || 'Unknown',
    createdAtFormatted: formatDate(forum.createdAt),
    commentCount: forum.comments?.length || 0,
    statusText: forum.isLocked ? 'Locked' : 'Active'
  }))
})

onMounted(async () => {
  await loadForums()
})

async function loadForums() {
  loading.value = true
  try {
    forums.value = await forumsStore.fetchAll()
  } catch (err: any) {
    handleApiError(err, 'Failed to load forums')
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleEdit(forum: any) {
  editingForum.value = forum
  form.value = {
    title: forum.title,
    description: forum.description,
    tags: forum.tags || []
  }
  showDialog.value = true
}

function handleDelete(forum: any) {
  deletingForum.value = forum
  showDeleteDialog.value = true
}

async function handleCustomAction(actionName: string, forum: any) {
  if (actionName === 'toggle-lock') {
    await toggleLock(forum)
  }
}

async function toggleLock(forum: any) {
  try {
    const updatedData = {
      ...forum,
      isLocked: !forum.isLocked
    }
    await forumsStore.updateForum(forum.id, updatedData)
    handleSuccess(`Forum ${updatedData.isLocked ? 'locked' : 'unlocked'} successfully!`)
    await loadForums()
  } catch (err: any) {
    handleApiError(err, 'Failed to update forum status')
  }
}

async function handleSave() {
  if (!valid.value) return
  
  saving.value = true
  try {
    await forumsStore.updateForum(editingForum.value.id, form.value)
    handleSuccess('Forum updated successfully!')
    showDialog.value = false
    await loadForums()
  } catch (err: any) {
    handleApiError(err, 'Failed to save forum')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deletingForum.value) return
  
  try {
    await forumsStore.deleteForum(deletingForum.value.id)
    handleSuccess('Forum deleted successfully!')
    await loadForums()
  } catch (err: any) {
    handleApiError(err, 'Failed to delete forum')
  }
}
</script>

<style scoped>
.admin-forums {
  max-width: 1400px;
}
</style>
