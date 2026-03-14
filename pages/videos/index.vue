<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-2">Video Tutorials</h1>
        <p class="text-body-1 text-medium-emphasis mb-4">Watch educational videos to boost your understanding</p>

        <!-- Filters -->
        <v-card class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="selectedSubjectId"
                  :items="subjectFilterItems"
                  label="Filter by Subject"
                  prepend-icon="mdi-book-open-page-variant"
                  :loading="loadingSubjects"
                  item-title="name"
                  item-value="id"
                  hide-details
                  @update:model-value="applyFilter"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Search videos"
                  prepend-icon="mdi-magnify"
                  clearable
                  hide-details
                  @update:model-value="applyFilter"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <LoadingSpinner v-if="loading" message="Loading videos..." />

        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

        <!-- Video Grid -->
        <v-row v-if="!loading && !error && filteredVideos.length > 0">
          <v-col
            v-for="video in filteredVideos"
            :key="video.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card class="video-card h-100 d-flex flex-column" hover>
              <!-- YouTube Thumbnail / Embed -->
              <div class="video-thumbnail" @click="openPlayer(video)">
                <img
                  v-if="!activeVideoId || activeVideoId !== video.id"
                  :src="getYouTubeThumbnail(video.videoPath)"
                  :alt="video.videoName"
                  class="thumbnail-img"
                  loading="lazy"
                />
                <div v-if="!activeVideoId || activeVideoId !== video.id" class="play-overlay">
                  <v-icon size="56" color="white">mdi-play-circle</v-icon>
                </div>
                <iframe
                  v-if="activeVideoId === video.id"
                  :src="getYouTubeEmbedUrl(video.videoPath)"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="video-iframe"
                  :title="video.videoName"
                />
              </div>

              <v-card-title class="text-body-1 font-weight-bold pt-3">
                {{ video.videoName }}
              </v-card-title>

              <v-card-subtitle v-if="getSubjectName(video.subjectId)" class="pb-2">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ getSubjectName(video.subjectId) }}
                </v-chip>
              </v-card-subtitle>

              <v-spacer />

              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-play"
                  size="small"
                  @click="openPlayer(video)"
                >
                  {{ activeVideoId === video.id ? 'Playing' : 'Watch' }}
                </v-btn>
                <v-btn
                  variant="text"
                  prepend-icon="mdi-open-in-new"
                  size="small"
                  :href="video.videoPath"
                  target="_blank"
                  rel="noopener"
                >
                  YouTube
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <EmptyState
          v-if="!loading && !error && filteredVideos.length === 0"
          icon="mdi-video-off"
          title="No videos found"
          description="No video tutorials match the selected filters"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const api = useApi()
const subjectsStore = useSubjectsStore()
const { handleApiError } = useErrorHandler()

const allVideos = ref<any[]>([])
const filteredVideos = ref<any[]>([])
const subjectItems = ref<any[]>([])
const selectedSubjectId = ref<string>('all')
const searchQuery = ref('')
const loading = ref(true)
const loadingSubjects = ref(true)
const error = ref<string | null>(null)
const activeVideoId = ref<string | null>(null)

const subjectFilterItems = computed(() => {
  return [{ name: 'All', id: 'all' }, ...subjectItems.value]
})

onMounted(async () => {
  await Promise.all([loadSubjects(), loadVideos()])
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

async function loadVideos() {
  loading.value = true
  error.value = null
  try {
    const data = await api.getVideoTutorials()
    allVideos.value = Array.isArray(data) ? data : []
    filteredVideos.value = allVideos.value
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load video tutorials')
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  let result = allVideos.value

  if (selectedSubjectId.value && selectedSubjectId.value !== 'all') {
    result = result.filter(v => v.subjectId === selectedSubjectId.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(v => v.videoName?.toLowerCase().includes(q))
  }

  filteredVideos.value = result
}

function getSubjectName(subjectId: string) {
  return subjectItems.value.find(s => s.id === subjectId)?.name || ''
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/)
  return match ? match[1] : null
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ''
}

function getYouTubeEmbedUrl(url: string): string {
  const id = extractYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : ''
}

function openPlayer(video: any) {
  activeVideoId.value = activeVideoId.value === video.id ? null : video.id
}
</script>

<style scoped lang="scss">
.video-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.video-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  cursor: pointer;
  overflow: hidden;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.15);
  }
}

.video-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 767px) {
  .video-card {
    margin-bottom: 8px;
  }
}
</style>
