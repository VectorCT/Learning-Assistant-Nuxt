<template>
  <div class="chapter-view">
    <LoadingSpinner 
      v-if="loading" 
      message="Loading chapter content..."
    />
    
    <v-alert v-if="error" type="error" class="ma-4">
      {{ error }}
    </v-alert>
    
    <div v-if="chapter && !loading && !error" class="chapter-layout">
      <!-- Sidebar Navigation -->
      <aside class="chapter-sidebar">
        <div class="sidebar-header">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            @click="$router.back()"
            class="mb-2"
          />
          <h2 class="sidebar-title">{{ chapter.chapterTitle }}</h2>
          <p class="sidebar-subtitle">Chapter {{ chapter.chapterNumber }}</p>
        </div>

        <v-divider class="my-2" />

        <!-- Section Navigation -->
        <nav class="section-nav" aria-label="Chapter sections">
          <v-list density="compact" class="section-list">
            <v-list-item
              v-for="(section, index) in sortedSections"
              :key="section.id"
              :class="['section-nav-item', { 'active': activeSection === section.id }]"
              @click="scrollToSection(section.id)"
              :ripple="false"
            >
              <template #prepend>
                <span class="section-number">{{ index + 1 }}</span>
              </template>
              <v-list-item-title class="section-nav-title">
                {{ getSectionTitle(section.content) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </nav>

        <!-- Actions -->
        <div class="sidebar-actions">
          <v-divider class="mb-2" />
          <v-btn
            color="primary"
            variant="flat"
            block
            prepend-icon="mdi-clipboard-check"
            size="small"
            @click="navigateTo(`/quiz/${chapterId}`)"
          >
            Take Quiz
          </v-btn>
          
          <v-btn
            color="secondary"
            variant="outlined"
            block
            prepend-icon="mdi-help-circle"
            size="small"
            class="mt-2"
            @click="navigateTo(`/chapters/${chapterId}/questions`)"
          >
            Practice Questions
          </v-btn>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="chapter-content">
        <div class="content-header">
          <v-breadcrumbs :items="breadcrumbs" class="px-0" />
          <h1 class="content-title">{{ chapter.chapterTitle }}</h1>
          <p v-if="chapter.description" class="content-description">
            {{ chapter.description }}
          </p>
        </div>

        <!-- Sections -->
        <div class="sections-container">
          <section
            v-for="(section, index) in sortedSections"
            :key="section.id"
            :id="`section-${section.id}`"
            :class="['content-section', { 'image-left': index % 2 === 0, 'image-right': index % 2 !== 0 }]"
            :data-section-id="section.id"
          >
            <div class="section-header">
              <span class="section-badge">{{ index + 1 }}</span>
              <h2 class="section-title">{{ getSectionTitle(section.content) }}</h2>
            </div>

            <div v-if="section.imageUrl" class="section-layout">
              <div class="section-image">
                <v-img
                  :src="section.imageUrl"
                  :alt="getSectionTitle(section.content)"
                  :aspect-ratio="16/9"
                  cover
                  class="rounded-lg"
                >
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary" />
                    </div>
                  </template>
                </v-img>
              </div>

              <div class="section-content" v-html="getSectionContent(section.content)" />
            </div>

            <div v-else class="section-content" v-html="getSectionContent(section.content)" />
          </section>
        </div>

        <!-- Navigation Footer -->
        <div class="content-footer">
          <v-btn
            v-if="previousChapter"
            variant="outlined"
            prepend-icon="mdi-chevron-left"
            :to="`/chapters/${previousChapter.id}`"
          >
            Previous Chapter
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="nextChapter"
            variant="outlined"
            color="primary"
            append-icon="mdi-chevron-right"
            :to="`/chapters/${nextChapter.id}`"
          >
            Next Chapter
          </v-btn>
        </div>
      </main>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { sanitizeHTML } from '~/utils/sanitize'
import { parseMarkdown, extractTitle, removeFirstHeading } from '~/utils/markdown'

const route = useRoute()
const chaptersStore = useChaptersStore()
const { handleApiError } = useErrorHandler()

const chapterId = route.params.id as string
const chapter = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const activeSection = ref<string | null>(null)
const previousChapter = ref<any>(null)
const nextChapter = ref<any>(null)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Subjects', to: '/subjects' },
  { title: chapter.value?.chapterTitle || 'Chapter', disabled: true }
])

const sortedSections = computed(() => {
  if (!chapter.value?.sections) return []
  return [...chapter.value.sections].sort((a, b) => a.order - b.order)
})

onMounted(async () => {
  try {
    chapter.value = await chaptersStore.fetchById(chapterId)
    
    // Set up intersection observer for active section tracking
    setupIntersectionObserver()
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load chapter')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

let observer: IntersectionObserver | null = null

function setupIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('data-section-id')
        if (sectionId) {
          activeSection.value = sectionId
        }
      }
    })
  }, options)

  // Observe all sections
  nextTick(() => {
    document.querySelectorAll('.content-section').forEach((section) => {
      observer?.observe(section)
    })
  })
}

function getSectionTitle(content: string): string {
  return extractTitle(content)
}

function getSectionContent(content: string): string {
  if (!content) return ''
  
  // Remove first heading and parse markdown
  const contentWithoutHeading = removeFirstHeading(content)
  const parsedMarkdown = parseMarkdown(contentWithoutHeading)
  
  // Sanitize the HTML
  return sanitizeHTML(parsedMarkdown)
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(`section-${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = sectionId
  }
}
</script>

<style scoped lang="scss">
.chapter-view {
  background: rgb(var(--v-theme-background));
}

.chapter-layout {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  // Account for the app bar height
  height: calc(100vh - 48px);
}

// Sidebar
.chapter-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgb(var(--v-theme-outline));
  padding: 0.75rem 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  flex-shrink: 0;

  .sidebar-title {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 0.25rem;
  }

  .sidebar-subtitle {
    font-size: 0.8125rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin: 0;
  }
}

.section-nav {
  flex: 1 1 auto;
  overflow-y: auto;
  margin: 0 -8px;
  padding: 0 8px;
  min-height: 0; // crucial for flex overflow

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-on-surface), 0.15);
    border-radius: 2px;
  }
}

.section-list {
  background: transparent !important;
}

.section-nav-item {
  border-radius: 8px;
  margin-bottom: 4px;
  min-height: 40px !important;
  padding: 8px 12px !important;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.08);
  }

  &.active {
    background: rgba(var(--v-theme-primary), 0.12);
    
    .section-nav-title {
      color: rgb(var(--v-theme-primary));
      font-weight: 600;
    }

    .section-number {
      background: rgb(var(--v-theme-primary));
      color: white;
    }
  }

  .section-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: rgba(var(--v-theme-on-surface), 0.08);
    font-size: 0.75rem;
    font-weight: 600;
    margin-right: 12px;
    transition: all 0.2s ease;
  }

  .section-nav-title {
    font-size: 0.8125rem;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.sidebar-actions {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 0.5rem;
}

// Main Content
.chapter-content {
  flex: 1;
  padding: 2rem 3rem;
  max-width: 900px;
  overflow-y: auto;
  height: 100%;
}

.content-header {
  margin-bottom: 3rem;

  .content-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }

  .content-description {
    font-size: 1.125rem;
    color: rgb(var(--v-theme-on-surface-variant));
    line-height: 1.6;
  }
}

.sections-container {
  margin-bottom: 3rem;
}

.content-section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .section-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgb(var(--v-theme-primary));
      color: white;
      font-size: 0.875rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1.3;
      margin: 0;
    }
  }

  // Side-by-side layout when image exists
  .section-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  // Image on the left (even index)
  &.image-left .section-layout {
    grid-template-areas: "image content";
    
    .section-image {
      grid-area: image;
    }
    
    .section-content {
      grid-area: content;
    }
  }

  // Image on the right (odd index)
  &.image-right .section-layout {
    grid-template-areas: "content image";
    
    .section-image {
      grid-area: image;
    }
    
    .section-content {
      grid-area: content;
    }
  }

  .section-image {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 2rem;
    
    :deep(.v-img) {
      max-height: 400px;
    }
  }

  .section-content {
    font-size: 1rem;
    line-height: 1.8;
    color: rgb(var(--v-theme-on-surface));

    :deep(h1) {
      font-size: 2rem;
      font-weight: 700;
      margin: 2.5rem 0 1.25rem;
      line-height: 1.2;
      color: rgb(var(--v-theme-on-surface));
    }

    :deep(h2) {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      line-height: 1.3;
      color: rgb(var(--v-theme-on-surface));
    }

    :deep(h3) {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem;
      line-height: 1.4;
      color: rgb(var(--v-theme-on-surface));
    }

    :deep(p) {
      margin-bottom: 1.25rem;
      line-height: 1.8;
    }

    :deep(ul), :deep(ol) {
      margin: 1rem 0 1.5rem 1.5rem;
      line-height: 1.7;
      
      li {
        margin-bottom: 0.5rem;
        padding-left: 0.5rem;
      }
    }

    :deep(ul) {
      list-style-type: disc;
      
      ul {
        list-style-type: circle;
        margin-top: 0.5rem;
      }
    }

    :deep(ol) {
      list-style-type: decimal;
    }

    :deep(strong) {
      font-weight: 600;
      color: rgb(var(--v-theme-on-surface));
    }

    :deep(em) {
      font-style: italic;
    }

    :deep(code) {
      background: rgba(var(--v-theme-primary), 0.1);
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'Courier New', Consolas, Monaco, monospace;
      color: rgb(var(--v-theme-primary));
    }

    :deep(pre) {
      background: rgb(var(--v-theme-surface-variant));
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      border: 1px solid rgb(var(--v-theme-outline));

      code {
        background: none;
        padding: 0;
        color: rgb(var(--v-theme-on-surface));
        font-size: 0.875rem;
        line-height: 1.6;
      }
    }

    :deep(blockquote) {
      border-left: 4px solid rgb(var(--v-theme-primary));
      padding-left: 1rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: rgb(var(--v-theme-on-surface-variant));
      background: rgba(var(--v-theme-primary), 0.05);
      padding: 1rem;
      border-radius: 4px;
    }

    :deep(a) {
      color: rgb(var(--v-theme-primary));
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s ease;

      &:hover {
        border-bottom-color: rgb(var(--v-theme-primary));
      }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid rgb(var(--v-theme-outline));
      margin: 2rem 0;
    }

    :deep(br) {
      line-height: 1.8;
    }
  }
}

.content-footer {
  display: flex;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgb(var(--v-theme-outline));
}

// Responsive
@media (max-width: 1023px) {
  .chapter-layout {
    flex-direction: column;
    height: calc(100vh - 48px);
    overflow: hidden;
  }

  .chapter-sidebar {
    width: 100%;
    height: 100%;
    border-right: none;
    padding: 0.75rem 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .section-nav {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
  }

  .sidebar-actions {
    flex-shrink: 0;
  }

  .chapter-content {
    display: none;
  }
}

@media (max-width: 767px) {
  .sidebar-header {
    .sidebar-title {
      font-size: 0.9375rem;
    }
  }

  .section-nav-item {
    min-height: 36px !important;
    padding: 6px 10px !important;

    .section-number {
      width: 22px;
      height: 22px;
      font-size: 0.7rem;
    }

    .section-nav-title {
      font-size: 0.8rem;
    }
  }
}
</style>
