<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section" aria-labelledby="hero-title">
      <v-container class="hero-container">
        <v-row align="center" justify="center">
          <v-col cols="12" md="10" lg="8" class="text-center">
            <!-- Hero Badge -->
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="hero-badge mb-4"
              prepend-icon="mdi-school"
            >
              Grades 8-12 Learning Platform
            </v-chip>

            <!-- Hero Title -->
            <h1 id="hero-title" class="hero-title text-h2 text-md-h1 font-weight-bold mb-4">
              Master Your Studies with
              <span class="text-primary">SA Learner Assistant</span>
            </h1>

            <!-- Hero Description -->
            <p class="hero-description text-h6 text-md-h5 mb-8">
              Your comprehensive educational platform for South African high school learners.
              Access interactive quizzes, study materials, and community support.
            </p>

            <!-- Grade Selection -->
            <div class="grade-selector mb-6">
              <p class="text-subtitle-1 mb-3 font-weight-medium">Select Your Grade</p>
              <v-btn-toggle
                v-model="selectedGrade"
                color="primary"
                mandatory
                rounded="lg"
                class="grade-toggle"
                aria-label="Select your grade level"
              >
                <v-btn
                  v-for="grade in grades"
                  :key="grade"
                  :value="grade"
                  :aria-label="`Grade ${grade}`"
                  size="large"
                >
                  Grade {{ grade }}
                </v-btn>
              </v-btn-toggle>
            </div>

            <!-- CTA Button -->
            <v-btn
              color="primary"
              size="x-large"
              :to="`/subjects?grade=${selectedGrade}`"
              class="hero-cta"
              prepend-icon="mdi-rocket-launch"
              aria-label="Start learning by browsing subjects"
            >
              Start Learning
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section" aria-labelledby="features-title">
      <v-container>
        <div class="text-center mb-8">
          <h2 id="features-title" class="text-h3 font-weight-bold mb-3">
            Everything You Need to Excel
          </h2>
          <p class="text-h6 text-medium-emphasis">
            Explore our comprehensive learning tools designed for your success
          </p>
        </div>

        <!-- Feature Cards Grid -->
        <v-row class="features-grid">
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            sm="6"
            md="4"
            class="feature-col"
          >
            <ContentCard
              :title="feature.title"
              :description="feature.description"
              :icon="feature.icon"
              :icon-color="feature.iconColor"
              :to="feature.route"
              :clickable="true"
            >
              <template #actions>
                <v-btn
                  variant="text"
                  color="primary"
                  :to="feature.route"
                  :aria-label="`Explore ${feature.title}`"
                >
                  Explore
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </template>
            </ContentCard>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats Section -->
    <section class="stats-section" aria-labelledby="stats-title">
      <v-container>
        <v-card class="stats-card" elevation="4">
          <v-card-text class="pa-8">
            <h2 id="stats-title" class="sr-only">Platform Statistics</h2>
            <v-row align="center" justify="center">
              <v-col
                v-for="stat in stats"
                :key="stat.label"
                cols="6"
                sm="3"
                class="text-center stat-col"
              >
                <div class="stat-icon mb-3">
                  <v-icon :icon="stat.icon" size="40" color="primary" :aria-hidden="true" />
                </div>
                <div class="stat-value text-h4 font-weight-bold text-primary mb-1">
                  {{ stat.value }}
                </div>
                <div class="stat-label text-body-1 text-medium-emphasis">
                  {{ stat.label }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// SEO Meta Tags
useHead({
  title: 'SA Learner Assistant - Master Your Studies',
  meta: [
    {
      name: 'description',
      content: 'Comprehensive educational platform for South African high school learners (Grades 8-12). Access interactive quizzes, study materials, forums, and more.'
    }
  ]
})

const selectedGrade = ref(8)
const grades = [8, 9, 10, 11, 12]

const features = [
  {
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with chapter-based quizzes and get immediate feedback on your performance',
    icon: 'mdi-clipboard-check',
    iconColor: 'primary',
    route: '/subjects'
  },
  {
    title: 'Study Materials',
    description: 'Access comprehensive chapter content, textbooks, and learning resources for all subjects',
    icon: 'mdi-book-open-page-variant',
    iconColor: 'success',
    route: '/subjects'
  },
  {
    title: 'Community Forums',
    description: 'Discuss topics, ask questions, and collaborate with fellow learners in our active community',
    icon: 'mdi-forum',
    iconColor: 'info',
    route: '/forums'
  },
  {
    title: 'Past Papers',
    description: 'Practice with previous exam papers and memorandums to prepare for your exams',
    icon: 'mdi-file-document',
    iconColor: 'warning',
    route: '/subjects'
  },
  {
    title: 'Video Tutorials',
    description: 'Watch educational videos and visual explanations to reinforce your learning',
    icon: 'mdi-video',
    iconColor: 'error',
    route: '/subjects'
  },
  {
    title: 'Track Progress',
    description: 'Monitor your quiz scores, learning achievements, and track your improvement over time',
    icon: 'mdi-chart-line',
    iconColor: 'secondary',
    route: '/profile'
  }
]

const stats = [
  {
    icon: 'mdi-book-multiple',
    value: '50+',
    label: 'Subjects'
  },
  {
    icon: 'mdi-file-document-multiple',
    value: '500+',
    label: 'Chapters'
  },
  {
    icon: 'mdi-clipboard-check-multiple',
    value: '1000+',
    label: 'Quizzes'
  },
  {
    icon: 'mdi-account-group',
    value: '5000+',
    label: 'Learners'
  }
]
</script>


<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.home-page {
  min-height: 100vh;
}

// ============================================
// Hero Section
// ============================================
.hero-section {
  position: relative;
  padding: $spacing-3xl 0;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-surface)) 0%,
    rgb(var(--v-theme-surface-variant)) 100%
  );
  overflow: hidden;

  // Decorative background pattern
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(
      circle at 20% 50%,
      rgba(var(--v-theme-primary), 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(var(--v-theme-primary), 0.08) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  .hero-container {
    position: relative;
    z-index: 1;
  }

  .hero-badge {
    animation: fadeInDown 0.6s ease-out;
  }

  .hero-title {
    animation: fadeInUp 0.6s ease-out 0.1s both;
    line-height: 1.2;
    
    .text-primary {
      background: linear-gradient(
        135deg,
        rgb(var(--v-theme-primary)),
        rgb(var(--v-theme-primary-lighten-1))
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .hero-description {
    animation: fadeInUp 0.6s ease-out 0.2s both;
    color: rgb(var(--v-theme-on-surface-variant));
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .grade-selector {
    animation: fadeInUp 0.6s ease-out 0.3s both;
  }

  .grade-toggle {
    display: inline-flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    justify-content: center;
    box-shadow: $shadow-md;
  }

  .hero-cta {
    animation: fadeInUp 0.6s ease-out 0.4s both;
    box-shadow: $shadow-lg;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-xl;
    }
  }
}

// ============================================
// Features Section
// ============================================
.features-section {
  padding: $spacing-3xl 0;
  background: rgb(var(--v-theme-background));

  .features-grid {
    margin-top: $spacing-xl;
  }

  .feature-col {
    animation: fadeInUp 0.6s ease-out both;
    
    @for $i from 1 through 6 {
      &:nth-child(#{$i}) {
        animation-delay: #{0.1 * $i}s;
      }
    }
  }
}

// ============================================
// Stats Section
// ============================================
.stats-section {
  padding: $spacing-3xl 0 $spacing-3xl;
  background: rgb(var(--v-theme-background));

  .stats-card {
    background: linear-gradient(
      135deg,
      rgb(var(--v-theme-surface)) 0%,
      rgb(var(--v-theme-surface-variant)) 100%
    );
    border: 1px solid rgb(var(--v-theme-outline));
    animation: fadeInUp 0.6s ease-out 0.5s both;
  }

  .stat-col {
    padding: $spacing-lg;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-4px);

      .stat-icon {
        transform: scale(1.1);
      }
    }
  }

  .stat-icon {
    transition: transform 0.3s ease;
  }

  .stat-value {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }
}

// ============================================
// Animations
// ============================================
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============================================
// Responsive Design
// ============================================

// Mobile (320-767px)
@media (max-width: $mobile-max) {
  .hero-section {
    padding: $spacing-xl 0;

    .hero-title {
      font-size: 2rem !important;
      line-height: 1.3;
    }

    .hero-description {
      font-size: 1rem !important;
    }

    .grade-toggle {
      width: 100%;
      
      :deep(.v-btn) {
        flex: 1;
        min-width: 0;
        min-height: $touch-target-min;
        padding: 8px 12px;
      }
    }

    .hero-cta {
      width: 100%;
      min-height: $touch-target-large;
    }
  }

  .features-section,
  .stats-section {
    padding: $spacing-xl 0;
  }

  .stats-card {
    :deep(.v-card-text) {
      padding: $spacing-lg !important;
    }
  }

  .stat-col {
    padding: $spacing-md !important;
  }

  .stat-value {
    font-size: 1.5rem !important;
  }
}

// Tablet (768-1023px)
@media (min-width: $tablet-min) and (max-width: $tablet-max) {
  .hero-section {
    padding: $spacing-2xl 0;

    .hero-title {
      font-size: 2.5rem !important;
    }

    .hero-description {
      font-size: 1.125rem !important;
    }
  }

  .features-section,
  .stats-section {
    padding: $spacing-2xl 0;
  }
}

// Desktop (1024px+)
@media (min-width: $desktop-min) {
  .hero-section {
    min-height: 70vh;
    display: flex;
    align-items: center;
  }

  .features-grid {
    .feature-col {
      // Ensure equal height cards
      display: flex;
      
      :deep(.content-card) {
        width: 100%;
      }
    }
  }
}

// Accessibility - Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .hero-badge,
  .hero-title,
  .hero-description,
  .grade-selector,
  .hero-cta,
  .feature-col,
  .stats-card {
    animation: none;
  }

  .hero-cta:hover,
  .stat-col:hover {
    transform: none;
  }
}
</style>
