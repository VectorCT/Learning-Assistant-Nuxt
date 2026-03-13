<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" />
        
        <LoadingSpinner 
          v-if="loading" 
          message="Loading chapter content..."
        />
        
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <div v-if="chapter && !loading && !error">
          <h1 class="text-h3 mb-4">{{ chapter.title }}</h1>
          
          <v-card class="mb-4">
            <v-card-actions>
              <v-btn
                color="primary"
                prepend-icon="mdi-clipboard-check"
                :to="`/quiz/${chapter.id}`"
              >
                Take Quiz
              </v-btn>
              
              <v-btn
                color="secondary"
                prepend-icon="mdi-help-circle"
                :to="`/chapters/${chapter.id}/questions`"
              >
                Practice Questions
              </v-btn>
              
              <v-spacer />
              
              <v-btn
                icon="mdi-printer"
                variant="text"
                @click="printContent"
              />
            </v-card-actions>
          </v-card>
          
          <ChapterContentRenderer
            v-if="chapter.sections"
            :sections="chapter.sections"
            @section-click="handleSectionClick"
          />
        </div>
        
        <EmptyState
          v-if="!loading && !error && !chapter"
          icon="mdi-book-off"
          title="Chapter not found"
          description="The chapter you're looking for doesn't exist or has been removed"
          action-text="Browse Subjects"
          action-icon="mdi-arrow-left"
          @action="$router.push('/subjects')"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const chaptersStore = useChaptersStore()
const { handleApiError } = useErrorHandler()

const chapterId = route.params.id as string
const chapter = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Subjects', to: '/subjects' },
  { title: chapter.value?.title || 'Chapter', disabled: true }
])

onMounted(async () => {
  try {
    chapter.value = await chaptersStore.fetchById(chapterId)
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load chapter')
  } finally {
    loading.value = false
  }
})

function handleSectionClick(sectionId: string) {
  console.log('Section clicked:', sectionId)
}

function printContent() {
  window.print()
}
</script>
