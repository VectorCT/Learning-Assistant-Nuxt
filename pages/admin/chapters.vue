<template>
  <v-container fluid class="admin-chapters pa-6">
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Manage Chapters</h1>
          <p class="text-body-2 text-medium-emphasis">Create and organize chapter content</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showDialog = true; editingChapter = null; resetForm()"
        >
          New Chapter
        </v-btn>
      </div>
    </div>

    <v-card elevation="2">
      <LoadingSpinner 
        v-if="loading" 
        message="Loading chapters..."
      />
      <AdminTable
        v-else
        :items="chapters"
        :headers="headers"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      />
      <EmptyState
        v-if="!loading && chapters.length === 0"
        icon="mdi-book-multiple"
        title="No chapters yet"
        description="Create your first chapter to add content"
        action-text="Create Chapter"
        action-icon="mdi-plus"
        @action="showDialog = true; editingChapter = null; resetForm()"
      />
    </v-card>
    
    <v-dialog v-model="showDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="pa-4 pb-2">
          <span class="text-h6 font-weight-bold">
            {{ editingChapter ? 'Edit Chapter' : 'Create Chapter' }}
          </span>
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
            
            <v-select
              v-model="form.subjectId"
              :items="subjects"
              item-title="name"
              item-value="id"
              label="Subject"
              :rules="[rules.required]"
              required
            />
            
            <v-text-field
              v-model.number="form.chapterNumber"
              label="Chapter Number"
              type="number"
              :rules="[rules.required, rules.positiveNumber]"
              required
            />
            
            <v-divider class="my-4" />
            
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6 font-weight-bold">Sections</h3>
              <v-btn
                size="small"
                color="primary"
                prepend-icon="mdi-plus"
                variant="tonal"
                @click="addSection()"
              >
                Add Section
              </v-btn>
            </div>
            
            <SectionEditor
              v-model="form.sections"
              @update:modelValue="form.sections = $event"
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
      title="Delete Chapter"
      message="Are you sure you want to delete this chapter? This action cannot be undone."
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

const chaptersStore = useChaptersStore()
const subjectsStore = useSubjectsStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const chapters = ref<any[]>([])
const subjects = ref<any[]>([])
const loading = ref(true)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingChapter = ref<any>(null)
const deletingChapter = ref<any>(null)
const saving = ref(false)
const valid = ref(false)
const formRef = ref()

const form = ref({
  title: '',
  subjectId: '',
  chapterNumber: 1,
  sections: [] as any[]
})

const headers = [
  { title: 'Chapter Number', key: 'chapterNumber', sortable: true },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Subject', key: 'subjectName' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const rules = {
  required: (v: any) => !!v || 'This field is required',
  positiveNumber: (v: number) => v > 0 || 'Must be a positive number'
}

onMounted(async () => {
  await loadSubjects()
  await loadChapters()
})

async function loadChapters() {
  loading.value = true
  try {
    const data = await chaptersStore.fetchAll()
    // Enrich chapters with subject names
    chapters.value = data.map((chapter: any) => ({
      ...chapter,
      subjectName: subjects.value.find((s: any) => s.id === chapter.subjectId)?.name || 'Unknown'
    }))
  } catch (err: any) {
    handleApiError(err, 'Failed to load chapters')
  } finally {
    loading.value = false
  }
}

async function loadSubjects() {
  try {
    subjects.value = await subjectsStore.fetchAll()
  } catch (err: any) {
    handleApiError(err, 'Failed to load subjects')
  }
}

function resetForm() {
  form.value = {
    title: '',
    subjectId: '',
    chapterNumber: 1,
    sections: []
  }
}

function addSection() {
  form.value.sections.push({
    id: crypto.randomUUID(),
    title: '',
    content: '',
    imageUrl: '',
    orderIndex: form.value.sections.length,
    parentSectionId: null,
    childSections: []
  })
}

function handleEdit(chapter: any) {
  editingChapter.value = chapter
  form.value = {
    title: chapter.title,
    subjectId: chapter.subjectId,
    chapterNumber: chapter.chapterNumber,
    sections: chapter.sections || []
  }
  showDialog.value = true
}

function handleDelete(chapter: any) {
  deletingChapter.value = chapter
  showDeleteDialog.value = true
}

async function handleSave() {
  if (!valid.value) return
  
  saving.value = true
  try {
    if (editingChapter.value) {
      // Update existing
      await chaptersStore.updateChapter(editingChapter.value.id, form.value)
      handleSuccess('Chapter updated successfully!')
    } else {
      // Create new
      await chaptersStore.createChapter(form.value)
      handleSuccess('Chapter created successfully!')
    }
    
    showDialog.value = false
    await loadChapters()
  } catch (err: any) {
    handleApiError(err, 'Failed to save chapter')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deletingChapter.value) return
  
  try {
    await chaptersStore.deleteChapter(deletingChapter.value.id)
    handleSuccess('Chapter deleted successfully!')
    await loadChapters()
  } catch (err: any) {
    handleApiError(err, 'Failed to delete chapter')
  }
}
</script>

<style scoped>
.admin-chapters {
  max-width: 1400px;
}
</style>
