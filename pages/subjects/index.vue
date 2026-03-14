<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-4">Subjects</h1>
        
        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedGrade"
                  :items="grades"
                  label="Select Grade"
                  prepend-icon="mdi-school"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Search subjects"
                  prepend-icon="mdi-magnify"
                  :loading="isSearching"
                  clearable
                  hint="Search by name or description"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        
        <LoadingSpinner 
          v-if="loading" 
          message="Loading subjects..."
        />
        
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <div v-if="!loading && !error" class="subjects-grid">
          <ContentCard
            v-for="subject in filteredSubjects"
            :key="subject.id"
            :title="subject.name"
            :subtitle="`${subject.grade} • ${subject.year}`"
            :description="subject.description"
            :image="subject.subjectImageUrl"
            :image-alt="`${subject.name} - ${subject.grade}`"
            :to="`/subjects/${subject.id}`"
            :metadata="{
              items: subject.chapters?.length ? `${subject.chapters.length} chapters` : undefined
            }"
            :icon="!subject.subjectImageUrl ? 'mdi-book-open-page-variant' : undefined"
            icon-color="primary"
          >
            <template #actions>
              <v-spacer />
              <v-btn color="primary" variant="text" size="small">
                View Details
              </v-btn>
            </template>
          </ContentCard>
        </div>
        
        <EmptyState
          v-if="!loading && !error && filteredSubjects.length === 0"
          icon="mdi-book-open-page-variant"
          title="No subjects found"
          :description="searchQuery ? `No subjects match your search for '${searchQuery}'` : 'No subjects available for this grade'"
          action-text="Clear Search"
          action-icon="mdi-close"
          @action="searchQuery = ''"
          v-show="searchQuery"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const subjectsStore = useSubjectsStore()
const { handleApiError } = useErrorHandler()

const selectedGrade = ref(route.query.grade ? Number(route.query.grade) : 8)
const subjects = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Use debounced search composable
const { searchQuery, filteredItems: filteredSubjects, isSearching } = useSearch(
  subjects,
  ['name', 'description'],
  300
)

const grades = [
  { title: 'Grade 8', value: 8 },
  { title: 'Grade 9', value: 9 },
  { title: 'Grade 10', value: 10 },
  { title: 'Grade 11', value: 11 },
  { title: 'Grade 12', value: 12 }
]

watch(selectedGrade, async (newGrade) => {
  router.push({ query: { grade: newGrade } })
  await loadSubjects()
})

onMounted(async () => {
  await loadSubjects()
})

async function loadSubjects() {
  loading.value = true
  error.value = null
  
  try {
    // For now, fetch all subjects and filter by grade
    // In production, use fetchByGrade with actual gradeId
    const allSubjects = await subjectsStore.fetchAll()
    subjects.value = allSubjects
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load subjects')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .subjects-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .subjects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .subjects-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
}

:deep(.search-highlight) {
  background-color: #ffeb3b;
  color: #000;
  font-weight: 600;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
