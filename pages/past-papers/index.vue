<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Past Papers</h1>
        
        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedSubjectId"
                  :items="subjectFilterItems"
                  label="Filter by Subject"
                  prepend-icon="mdi-book-open-page-variant"
                  :loading="loadingSubjects"
                  item-title="name"
                  item-value="id"
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedYear"
                  :items="yearFilterItems"
                  label="Filter by Year"
                  prepend-icon="mdi-calendar"
                  @update:model-value="applyFilters"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        
        <LoadingSpinner 
          v-if="loadingPapers" 
          message="Loading past papers..."
        />
        
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <div v-if="!loadingPapers && !error && displayedPapers.length > 0">
          <v-card
            v-for="paper in displayedPapers"
            :key="paper.id"
            class="mb-3"
          >
            <v-card-title>
              <v-icon class="mr-2">mdi-file-document</v-icon>
              {{ paper.fileName }}
            </v-card-title>
            <v-card-subtitle>
              Year: {{ paper.year?.yearValue || 'N/A' }}
            </v-card-subtitle>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-eye"
                @click="previewFile(paper.id, paper.fileName)"
              >
                Preview
              </v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-download"
                @click="downloadFile(paper.id, paper.fileName)"
              >
                Download Paper
              </v-btn>
              <v-btn
                v-if="paper.pastMemorandum"
                color="secondary"
                variant="tonal"
                prepend-icon="mdi-eye"
                @click="previewFile(paper.pastMemorandum.id, paper.pastMemorandum.fileName)"
              >
                Preview Memo
              </v-btn>
              <v-btn
                v-if="paper.pastMemorandum"
                color="secondary"
                prepend-icon="mdi-download"
                @click="downloadFile(paper.pastMemorandum.id, paper.pastMemorandum.fileName)"
              >
                Download Memo
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
        
        <EmptyState
          v-if="!loadingPapers && !error && displayedPapers.length === 0"
          icon="mdi-file-document-outline"
          title="No past papers found"
          description="No past papers match the selected filters"
        />
      </v-col>
    </v-row>

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="900" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          {{ previewFileName }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="previewDialog = false" />
        </v-card-title>
        <v-card-text class="pa-0" style="height: 75vh;">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            width="100%"
            height="100%"
            style="border: none;"
            :title="`Preview of ${previewFileName}`"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const subjectsStore = useSubjectsStore()
const { handleApiError } = useErrorHandler()
const api = useApi()

const selectedSubjectId = ref<string>('all')
const selectedYear = ref<string | number>('all')
const allPapers = ref<any[]>([])
const displayedPapers = ref<any[]>([])
const loadingSubjects = ref(true)
const loadingPapers = ref(true)
const error = ref<string | null>(null)
const subjectItems = ref<any[]>([])

// Preview state
const previewDialog = ref(false)
const previewUrl = ref<string | null>(null)
const previewFileName = ref('')

const subjectFilterItems = computed(() => {
  return [{ name: 'All', id: 'all' }, ...subjectItems.value]
})

const yearFilterItems = [
  { title: 'All', value: 'all' },
  { title: '2020', value: '00B588FC-037F-4439-A310-1EF63C44ECA8' },
  { title: '2021', value: '49361E77-DF89-48B2-86CC-3D3D9C71E14C' },
  { title: '2022', value: 'A3931E41-3435-4FF2-95E4-542192818DBC' },
  { title: '2023', value: 'EFBA28A1-8947-4AE6-808F-A18CAD8F0E10' },
  { title: '2024', value: '437E3197-E0EE-4635-AC3A-C6B8483E0B7D' },
]

onMounted(async () => {
  await Promise.all([loadSubjects(), loadAllPapers()])
})

async function loadSubjects() {
  loadingSubjects.value = true
  try {
    const subjects = await subjectsStore.fetchAll()
    subjectItems.value = subjects
  } catch (err: any) {
    // Non-blocking
  } finally {
    loadingSubjects.value = false
  }
}

async function loadAllPapers() {
  loadingPapers.value = true
  error.value = null
  try {
    const data = await api.getAllPastPapers()
    allPapers.value = Array.isArray(data) ? data : []
    displayedPapers.value = allPapers.value
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load past papers')
  } finally {
    loadingPapers.value = false
  }
}

function applyFilters() {
  let filtered = allPapers.value

  if (selectedSubjectId.value && selectedSubjectId.value !== 'all') {
    filtered = filtered.filter(p => p.subjectId === selectedSubjectId.value)
  }

  if (selectedYear.value && selectedYear.value !== 'all') {
    filtered = filtered.filter(p => p.yearId === selectedYear.value)
  }

  displayedPapers.value = filtered
}

async function previewFile(fileId: string, fileName: string) {
  try {
    const response = await api.downloadPastPaper(fileId)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to preview file')
  }
}

async function downloadFile(fileId: string, fileName: string) {
  try {
    const response = await api.downloadPastPaper(fileId)
    const blob = new Blob([response.data], { type: 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to download file')
  }
}
</script>

<style scoped>
@media (max-width: 767px) {
  .v-card-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .v-card-actions .v-btn {
    width: 100%;
  }
}
</style>