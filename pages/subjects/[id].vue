<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" />
        
        <LoadingSpinner 
          v-if="loading" 
          message="Loading subject details..."
        />
        
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        
        <div v-if="subject && !loading">
          <v-row>
            <v-col cols="12" md="8">
              <h1 class="text-h3 mb-4">{{ subject.name }}</h1>
              <p class="text-body-1 mb-4">{{ subject.description }}</p>
              
              <v-btn
                v-if="subject.textbookUrl"
                color="primary"
                prepend-icon="mdi-book-open"
                :href="subject.textbookUrl"
                target="_blank"
                class="mb-4"
              >
                View Textbook
              </v-btn>
            </v-col>
            
            <v-col cols="12" md="4">
              <NuxtImg
                v-if="subject.imageUrl"
                :src="subject.imageUrl"
                :alt="subject.name"
                height="300"
                width="400"
                preset="hero"
                loading="lazy"
                placeholder
                fit="cover"
              />
            </v-col>
          </v-row>
          
          <v-divider class="my-6" />
          
          <h2 class="text-h4 mb-4">Chapters</h2>
          
          <EmptyState
            v-if="!chapters || chapters.length === 0"
            icon="mdi-book-open-page-variant"
            title="No chapters available"
            description="This subject doesn't have any chapters yet. Check back later for new content."
            icon-color="info"
          />
          
          <v-row v-else>
            <v-col
              v-for="chapter in chapters"
              :key="chapter.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <ContentCard
                :title="`Chapter ${chapter.chapterNumber}: ${chapter.title}`"
                :description="chapter.description"
                :to="`/chapters/${chapter.id}`"
                icon="mdi-book-open-page-variant"
                :metadata="{
                  items: chapter.sections?.length ? `${chapter.sections.length} sections` : undefined,
                  duration: chapter.questions?.length ? `${chapter.questions.length} questions` : undefined
                }"
              >
                <template #actions>
                  <v-btn
                    color="primary"
                    variant="text"
                    :to="`/chapters/${chapter.id}`"
                    size="default"
                    class="chapter-action-btn"
                  >
                    View Content
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    variant="text"
                    :to="`/quiz/${chapter.id}`"
                    size="default"
                    icon="mdi-quiz-outline"
                    class="chapter-action-btn"
                    aria-label="Take quiz"
                  />
                </template>
              </ContentCard>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const subjectsStore = useSubjectsStore()
const chaptersStore = useChaptersStore()
const { handleApiError } = useErrorHandler()

const subjectId = route.params.id as string
const subject = ref<any>(null)
const chapters = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Subjects', to: '/subjects' },
  { title: subject.value?.name || 'Subject', disabled: true }
])

onMounted(async () => {
  try {
    // Try to get subject with chapters first
    const api = useApi()
    let subjectData
    try {
      subjectData = await api.getSubjectWithChapters(subjectId)
    } catch (e) {
      subjectData = await subjectsStore.fetchById(subjectId)
    }
    
    // Check if response is an array and extract first element
    if (Array.isArray(subjectData)) {
      subject.value = subjectData[0]
    } else {
      subject.value = subjectData
    }
    
    // Check if subject already has chapters
    if (subject.value?.chapters && Array.isArray(subject.value.chapters) && subject.value.chapters.length > 0) {
      chapters.value = subject.value.chapters.map((c: any) => ({
        id: c.chapterId || c.id,
        title: c.chapterTitle || c.title,
        subjectId: c.subjectId,
        chapterNumber: c.chapterNumber,
        sections: c.sections,
        questions: c.questions,
        description: c.description,
        termId: c.termId
      }))
    } else {
      chapters.value = await chaptersStore.fetchBySubject(subjectId)
    }
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load subject')
  } finally {
    loading.value = false
  }
})
</script>


<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

// Ensure touch targets on mobile
.chapter-action-btn {
  @include mobile {
    min-height: $touch-target-min;
    min-width: $touch-target-min;
  }
}
</style>
