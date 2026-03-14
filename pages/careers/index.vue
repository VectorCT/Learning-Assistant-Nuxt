<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-2">
          <v-icon size="32" color="primary" class="mr-3">mdi-compass</v-icon>
          <h1 class="text-h3">Career Guidance</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-5">
          Explore careers, find bursaries, and plan your future after matric
        </p>

        <!-- Category Filter -->
        <v-chip-group v-model="selectedCategory" mandatory class="mb-5">
          <v-chip
            v-for="cat in categories"
            :key="cat.value"
            :value="cat.value"
            filter
            variant="elevated"
            :prepend-icon="cat.icon"
          >
            {{ cat.label }}
          </v-chip>
        </v-chip-group>

        <!-- Featured: Guide24 -->
        <v-card class="mb-6 featured-card" color="primary" variant="tonal">
          <v-row no-gutters align="center">
            <v-col cols="12" md="2" class="d-flex justify-center pa-5">
              <v-avatar size="80" color="primary" class="elevation-4">
                <v-icon size="44" color="white">mdi-head-lightbulb</v-icon>
              </v-avatar>
            </v-col>
            <v-col cols="12" md="7" class="pa-5">
              <v-chip size="small" color="primary" class="mb-2">Featured — Free for SA Students</v-chip>
              <h2 class="text-h5 font-weight-bold mb-1">Guide24 Career Quiz</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Take a quick 20-question quiz to discover which courses and career paths match your interests, strengths, and personality. Built specifically for South African students.
              </p>
            </v-col>
            <v-col cols="12" md="3" class="pa-5 d-flex justify-center">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-open-in-new"
                href="https://guide24.co.za/"
                target="_blank"
                rel="noopener"
              >
                Take the Quiz
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- Resources Grid -->
        <v-row>
          <v-col
            v-for="resource in filteredResources"
            :key="resource.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card class="resource-card h-100 d-flex flex-column" hover>
              <div class="resource-header" :style="{ background: resource.bgColor }">
                <v-icon size="44" :color="resource.iconColor || 'white'">{{ resource.icon }}</v-icon>
              </div>

              <v-card-title class="text-body-1 font-weight-bold pt-3">
                {{ resource.title }}
              </v-card-title>

              <v-card-subtitle class="pb-1" style="white-space: normal;">
                {{ resource.description }}
              </v-card-subtitle>

              <v-card-text class="pt-2 pb-1">
                <div class="d-flex flex-wrap ga-1">
                  <v-chip size="x-small" :color="getCategoryColor(resource.category)">
                    {{ getCategoryLabel(resource.category) }}
                  </v-chip>
                  <v-chip v-if="resource.free" size="x-small" color="success" variant="tonal" prepend-icon="mdi-check-circle">
                    Free
                  </v-chip>
                  <v-chip v-if="resource.saSpecific" size="x-small" color="warning" variant="tonal">
                    🇿🇦 SA
                  </v-chip>
                </div>
              </v-card-text>

              <v-spacer />

              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-open-in-new"
                  size="small"
                  :href="resource.url"
                  target="_blank"
                  rel="noopener"
                >
                  Visit
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <EmptyState
          v-if="filteredResources.length === 0"
          icon="mdi-compass-off"
          title="No resources in this category"
          description="Try selecting a different category"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface CareerResource {
  id: string
  title: string
  description: string
  category: string
  icon: string
  bgColor: string
  iconColor?: string
  url: string
  free: boolean
  saSpecific: boolean
}

const selectedCategory = ref('all')

const categories = [
  { value: 'all', label: 'All', icon: 'mdi-apps' },
  { value: 'quiz', label: 'Career Quizzes', icon: 'mdi-head-question' },
  { value: 'bursary', label: 'Bursaries & Funding', icon: 'mdi-cash-multiple' },
  { value: 'university', label: 'University & Courses', icon: 'mdi-school' },
  { value: 'jobs', label: 'Jobs & Learnerships', icon: 'mdi-briefcase' },
  { value: 'skills', label: 'Skills & Development', icon: 'mdi-certificate' },
]

const resources: CareerResource[] = [
  // Career Quizzes
  {
    id: 'guide24',
    title: 'Guide24 Career Quiz',
    description: '20-question quiz matching your interests and strengths to SA courses and career paths.',
    category: 'quiz',
    icon: 'mdi-head-lightbulb',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    url: 'https://guide24.co.za/',
    free: true,
    saSpecific: true,
  },
  {
    id: 'thandi',
    title: 'Thandi.online',
    description: 'AI-powered career recommendations backed by South African labour market data.',
    category: 'quiz',
    icon: 'mdi-robot',
    bgColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    url: 'https://www.thandi.online/',
    free: true,
    saSpecific: true,
  },
  {
    id: 'gostudy',
    title: 'GoStudy Career Questionnaire',
    description: 'Career questionnaire with study info and guidance for SA students.',
    category: 'quiz',
    icon: 'mdi-clipboard-text',
    bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    url: 'https://www.gostudy.net/',
    free: true,
    saSpecific: true,
  },
  {
    id: '16personalities',
    title: '16Personalities Test',
    description: 'Discover your personality type and see which careers suit your natural strengths.',
    category: 'quiz',
    icon: 'mdi-account-group',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    url: 'https://www.16personalities.com/',
    free: true,
    saSpecific: false,
  },
  // Bursaries & Funding
  {
    id: 'careers-portal-bursaries',
    title: 'Careers Portal — Bursaries',
    description: 'Browse hundreds of bursaries available to SA students across all fields of study.',
    category: 'bursary',
    icon: 'mdi-cash-multiple',
    bgColor: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    url: 'https://www.careersportal.co.za/bursaries/bursary-guide.html',
    free: true,
    saSpecific: true,
  },
  {
    id: 'bursaries-portal',
    title: 'Bursaries Portal',
    description: 'Dedicated bursary finder with NSFAS info, funding tips, and application deadlines.',
    category: 'bursary',
    icon: 'mdi-school',
    bgColor: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
    iconColor: '#333',
    url: 'https://www.bursariesportal.co.za/',
    free: true,
    saSpecific: true,
  },
  {
    id: 'fundiconnect',
    title: 'FundiConnect',
    description: 'Study and career guidance hub with course matching and funding options.',
    category: 'bursary',
    icon: 'mdi-link-variant',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    url: 'https://fundiconnect.co.za/',
    free: true,
    saSpecific: true,
  },
  // University & Courses
  {
    id: 'unipply',
    title: 'Unipply',
    description: 'Enter your marks and instantly see which programmes you qualify for across 77 SA institutions.',
    category: 'university',
    icon: 'mdi-magnify',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    url: 'https://www.unipply.ai/',
    free: true,
    saSpecific: true,
  },
  {
    id: 'careers-portal-main',
    title: 'Careers Portal',
    description: 'SA\'s biggest free career resource — career profiles, study fields, and institution info.',
    category: 'university',
    icon: 'mdi-compass',
    bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    url: 'https://www.careersportal.co.za/',
    free: true,
    saSpecific: true,
  },
  // Jobs & Learnerships
  {
    id: 'studentroom',
    title: 'StudentRoom SA',
    description: 'Latest internships, learnerships, and graduate programmes in South Africa.',
    category: 'jobs',
    icon: 'mdi-briefcase-search',
    bgColor: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    url: 'https://www.studentroom.co.za/',
    free: true,
    saSpecific: true,
  },
  {
    id: 'careers-portal-learnerships',
    title: 'Careers Portal — Learnerships',
    description: 'Find learnerships and work-based learning opportunities across SA industries.',
    category: 'jobs',
    icon: 'mdi-hammer-wrench',
    bgColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    iconColor: '#333',
    url: 'https://www.careersportal.co.za/learnerships',
    free: true,
    saSpecific: true,
  },
  // Skills & Development
  {
    id: 'studyboosta',
    title: 'StudyBoosta',
    description: 'Career roadmap, interview practice, real opportunities, and practical digital skills.',
    category: 'skills',
    icon: 'mdi-rocket-launch',
    bgColor: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    url: 'https://www.studyboosta.com/',
    free: true,
    saSpecific: true,
  },
  {
    id: 'career-avenues',
    title: 'Career Avenues',
    description: 'Professional career guidance with aptitude testing and personalised career reports.',
    category: 'skills',
    icon: 'mdi-chart-bar',
    bgColor: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    iconColor: '#333',
    url: 'https://careeravenues.co.za/',
    free: false,
    saSpecific: true,
  },
]

const filteredResources = computed(() => {
  if (selectedCategory.value === 'all') return resources
  return resources.filter(r => r.category === selectedCategory.value)
})

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    quiz: 'purple',
    bursary: 'green',
    university: 'blue',
    jobs: 'orange',
    skills: 'pink',
  }
  return colors[category] || 'grey'
}

function getCategoryLabel(category: string) {
  return categories.find(c => c.value === category)?.label || category
}
</script>

<style scoped lang="scss">
.featured-card {
  overflow: hidden;
}

.resource-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.resource-header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 767px) {
  .resource-header {
    height: 80px;
  }
}
</style>
