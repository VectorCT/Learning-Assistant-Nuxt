<template>
  <v-container fluid class="admin-subjects pa-6">
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Manage Subjects</h1>
          <p class="text-body-2 text-medium-emphasis">Create and organize learning subjects</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showDialog = true; editingSubject = null"
        >
          New Subject
        </v-btn>
      </div>
    </div>

    <v-card elevation="2">
      <LoadingSpinner 
        v-if="loading" 
        message="Loading subjects..."
      />
      <AdminTable
        v-else
        :items="subjects"
        :headers="headers"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      />
      <EmptyState
        v-if="!loading && subjects.length === 0"
        icon="mdi-book-open-page-variant"
        title="No subjects yet"
        description="Create your first subject to get started"
        action-text="Create Subject"
        action-icon="mdi-plus"
        @action="showDialog = true; editingSubject = null"
      />
    </v-card>
    
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title class="pa-4 pb-2">
          <span class="text-h6 font-weight-bold">
            {{ editingSubject ? 'Edit Subject' : 'Create Subject' }}
          </span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="form.name"
              label="Name"
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
            
            <v-text-field
              v-model="form.textbookUrl"
              label="Textbook URL"
              hint="Optional"
              persistent-hint
            />
            
            <v-text-field
              v-model="form.imageUrl"
              label="Image URL"
              hint="Optional"
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
      title="Delete Subject"
      message="Are you sure you want to delete this subject? This action cannot be undone."
      danger
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  requiresAdmin: true
})

const subjectsStore = useSubjectsStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const subjects = ref<any[]>([])
const loading = ref(true)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingSubject = ref<any>(null)
const deletingSubject = ref<any>(null)
const saving = ref(false)
const valid = ref(false)
const formRef = ref()

const form = ref({
  name: '',
  description: '',
  textbookUrl: '',
  imageUrl: ''
})

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const rules = {
  required: (v: string) => !!v || 'This field is required'
}

onMounted(async () => {
  await loadSubjects()
})

async function loadSubjects() {
  loading.value = true
  try {
    subjects.value = await subjectsStore.fetchAll()
  } catch (err: any) {
    handleApiError(err, 'Failed to load subjects')
  } finally {
    loading.value = false
  }
}

function handleEdit(subject: any) {
  editingSubject.value = subject
  form.value = { ...subject }
  showDialog.value = true
}

function handleDelete(subject: any) {
  deletingSubject.value = subject
  showDeleteDialog.value = true
}

async function handleSave() {
  if (!valid.value) return
  
  saving.value = true
  try {
    if (editingSubject.value) {
      // Update existing
      await subjectsStore.updateSubject(editingSubject.value.id, form.value)
      handleSuccess('Subject updated successfully!')
    } else {
      // Create new
      await subjectsStore.createSubject(form.value)
      handleSuccess('Subject created successfully!')
    }
    
    showDialog.value = false
    await loadSubjects()
  } catch (err: any) {
    handleApiError(err, 'Failed to save subject')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deletingSubject.value) return
  
  try {
    await subjectsStore.deleteSubject(deletingSubject.value.id)
    handleSuccess('Subject deleted successfully!')
    await loadSubjects()
  } catch (err: any) {
    handleApiError(err, 'Failed to delete subject')
  }
}
</script>

<style scoped>
.admin-subjects {
  max-width: 1400px;
}
</style>
