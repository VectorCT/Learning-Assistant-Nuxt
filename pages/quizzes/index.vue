<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-2">
          <v-icon size="32" color="primary" class="mr-3">mdi-clipboard-check</v-icon>
          <h1 class="text-h3">Quizzes</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-5">
          Pick a subject and chapter to test your knowledge
        </p>

        <!-- Filters -->
        <v-card class="mb-5">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="5">
                <v-select
                  v-model="selectedSubjectId"
                  :items="subjectFilterItems"
                  label="Subject"
                  prepend-icon="mdi-book-open-page-variant"
                  :loading="loadingSubjects"
                  item-title="name"
                  item-value="id"
                  hide-details
                  @update:model-value="onSubjectChange"
                />
              </v-col>
              <v-col cols="12" sm="6" md="5">
                <v-text-field
                  v-model="searchQuery"
                  label="Search chapters"
                  prepend-icon="mdi-magnify"
                  clearable
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <LoadingSpinner v-if="loading" message="Loading chapters..." />

        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

        <!-- Chapters Grid -->
        <v-row v-if="!loading && filteredChapters.length > 0">
          <v-col
            v-for="chapter in filteredChapters"
            :key="chapter.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card class="quiz-chapter-card h-100 d-flex flex-column" hover>
              <div class="chapter-header">
                <v-icon size="28" color="white">mdi-clipboard-check</v-icon>
              </div>
              <v-card-title class="text-body-1 font-weight-bold pt-3">
                {{ chapter.title }}
              </v-card-title>
              <v-card-subtitle v-if="getSubjectName(chapter.subjectId)">
                <v-chip size="x-small" color="primary" variant="tonal">
                  {{ getSubjectName(chapter.subjectId) }}
                </v-chip>
              </v-card-subtitle>
              <v-spacer />
              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-play"
                  size="small"
                  :to="`/quiz/${chapter.id}`"
                >
                  Take Quiz
                </v-btn>
                <v-btn
                  variant="text"
                  prepend-icon="mdi-book-open-variant"
                  size="small"
                  :to="`/chapters/${chapter.id}`"
                >
                  Study First
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <EmptyState
          v-if="!loading && !error && filteredChapters.length === 0"
          icon="mdi-clipboard-check-outline"
          title="No chapters found"
          :description="selectedSubjectId === 'all' ? 'Select a subject to see available quizzes' : 'No chapters match your search'"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const subjectsStore = useSubjectsStore()
const chaptersStore = useChaptersStore()
const { handleApiError } = useErrorHandler()

const selectedSubjectId = ref<string>('all')
const searchQuery = ref('')
const allChapters = ref<any[]>([])
const subjectItems = ref<any[]>([])
const loading = ref(true)
const loadingSubjects = ref(true)
const error = ref<string | null>(null)

const subjectFilterItems = computed(() => {
  return [{ name: 'All Subjects', id: 'all' }, ...subjectItems.value]
})

const filteredChapters = computed(() => {
  let result = allChapters.value

  if (selectedSubjectId.value && selectedSubjectId.value !== 'all') {
    result = result.filter(c => c.subjectId === selectedSubjectId.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.title?.toLowerCase().includes(q))
  }

  return result
})

onMounted(async () => {
  await Promise.all([loadSubjects(), loadChapters()])
})

async function loadSubjects() {
  loadingSubjects.value = true
  try {
    const subjects = await subjectsStore.fetchAll()
    subjectItems.value = subjects
  } catch (_) {
    // Non-blocking
  } finally {
    loadingSubjects.value = false
  }
}

async function loadChapters() {
  loading.value = true
  error.value = null
  try {
    const chapters = await chaptersStore.fetchAll()
    allChapters.value = Array.isArray(chapters) ? chapters : []
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load chapters')
  } finally {
    loading.value = false
  }
}

async function onSubjectChange() {
  if (selectedSubjectId.value && selectedSubjectId.value !== 'all') {
    loading.value = true
    error.value = null
    try {
      const chapters = await chaptersStore.fetchBySubject(selectedSubjectId.value)
      // Merge into allChapters without duplicates
      const existingIds = new Set(allChapters.value.map(c => c.id))
      for (const ch of chapters) {
        if (!existingIds.has(ch.id)) {
          allChapters.value.push(ch)
        }
      }
    } catch (err: any) {
      error.value = handleApiError(err, 'Failed to load chapters for subject')
    } finally {
      loading.value = false
    }
  }
}

function getSubjectName(subjectId: string) {
  return subjectItems.value.find(s => s.id === subjectId)?.name || ''
}
</script>

<style scoped lang="scss">
.quiz-chapter-card {
  border: 1px solid rgb(var(--v-theme-outline));
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    border-color: rgb(var(--v-theme-primary));
  }
}

.chapter-header {
  height: 56px;
  background: linear-gradient(135deg, #7C3AED, #A78BFA);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 767px) {
  .chapter-header {
    height: 48px;
  }
}
</style>
