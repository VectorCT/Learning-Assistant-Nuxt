<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section" aria-labelledby="hero-title">
      <v-container class="hero-container">
        <v-row align="center" justify="center">
          <v-col cols="12" md="7" class="hero-text">
            <v-chip color="primary" variant="tonal" size="small" class="hero-badge mb-3" prepend-icon="mdi-school">
              Grades 8–12 · South Africa
            </v-chip>

            <h1 id="hero-title" class="hero-title text-h3 text-md-h2 font-weight-bold mb-3">
              Your study companion for
              <span class="gradient-text">matric success</span>
            </h1>

            <p class="hero-description text-body-1 text-md-h6 text-medium-emphasis mb-6">
              Quizzes, past papers, video tutorials, interactive games, and career guidance — everything you need in one place.
            </p>

            <div class="d-flex flex-wrap ga-3 mb-6">
              <v-btn color="primary" size="large" to="/subjects" prepend-icon="mdi-rocket-launch" class="hero-cta">
                Start Learning
              </v-btn>
              <v-btn variant="outlined" size="large" to="/past-papers" prepend-icon="mdi-file-document">
                Past Papers
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="5" class="d-none d-md-flex justify-center">
            <div class="hero-illustration">
              <div class="illustration-circle">
                <v-icon size="100" color="primary">mdi-school</v-icon>
              </div>
              <div class="floating-chip chip-1">
                <v-chip size="small" color="success" variant="elevated" prepend-icon="mdi-check-circle">Quiz Passed</v-chip>
              </div>
              <div class="floating-chip chip-2">
                <v-chip size="small" color="warning" variant="elevated" prepend-icon="mdi-trophy">Top 10%</v-chip>
              </div>
              <div class="floating-chip chip-3">
                <v-chip size="small" color="info" variant="elevated" prepend-icon="mdi-fire">5 Day Streak</v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Quick Access Grid -->
    <section class="quick-access-section" aria-labelledby="quick-title">
      <v-container>
        <h2 id="quick-title" class="text-h4 font-weight-bold mb-5">Jump right in</h2>
        <v-row>
          <v-col v-for="item in quickAccess" :key="item.title" cols="6" sm="4" md="2">
            <v-card
              :to="item.to"
              class="quick-card text-center pa-4 h-100"
              hover
              :ripple="true"
            >
              <div class="quick-icon-wrap mb-2" :style="{ background: item.bg }">
                <v-icon size="28" :color="item.iconColor || 'white'">{{ item.icon }}</v-icon>
              </div>
              <p class="text-caption font-weight-medium">{{ item.title }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section" aria-labelledby="features-title">
      <v-container>
        <div class="text-center mb-6">
          <h2 id="features-title" class="text-h4 font-weight-bold mb-2">Everything you need to excel</h2>
          <p class="text-body-1 text-medium-emphasis">Tools designed for South African learners</p>
        </div>

        <v-row>
          <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4">
            <v-card :to="feature.route" class="feature-card h-100 d-flex flex-column" hover>
              <div class="feature-icon-bar" :style="{ background: feature.gradient }">
                <v-icon size="32" color="white">{{ feature.icon }}</v-icon>
              </div>
              <v-card-text class="flex-grow-1">
                <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ feature.title }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-0">{{ feature.description }}</p>
              </v-card-text>
              <v-card-actions class="pt-0">
                <v-btn variant="text" color="primary" size="small" :to="feature.route">
                  Explore <v-icon end size="16">mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats Bar -->
    <section class="stats-section">
      <v-container>
        <v-card class="stats-card" variant="tonal" color="primary">
          <v-card-text>
            <v-row align="center" justify="center">
              <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3" class="text-center">
                <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
                <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-container>
    </section>

    <!-- Motivational CTA -->
    <section class="cta-section">
      <v-container>
        <v-card class="cta-card text-center pa-8" variant="flat">
          <v-icon size="48" color="primary" class="mb-3">mdi-lightbulb-on</v-icon>
          <h2 class="text-h5 font-weight-bold mb-2">Ready to ace your exams?</h2>
          <p class="text-body-1 text-medium-emphasis mb-5" style="max-width: 500px; margin: 0 auto;">
            Join thousands of SA learners using quizzes, past papers, and interactive tools to study smarter.
          </p>
          <v-btn color="primary" size="large" to="/register" prepend-icon="mdi-account-plus">
            Create Free Account
          </v-btn>
        </v-card>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'SA Learner Assistant — Study Smarter',
  meta: [
    { name: 'description', content: 'Free educational platform for South African high school learners (Grades 8-12). Quizzes, past papers, video tutorials, games, and career guidance.' }
  ]
})

const quickAccess = [
  { title: 'Subjects', icon: 'mdi-book-open-variant', to: '/subjects', bg: 'linear-gradient(135deg,#7C3AED,#A78BFA)' },
  { title: 'Quizzes', icon: 'mdi-clipboard-check', to: '/quizzes', bg: 'linear-gradient(135deg,#EC4899,#F472B6)' },
  { title: 'Past Papers', icon: 'mdi-file-document', to: '/past-papers', bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)', iconColor: '#333' },
  { title: 'Videos', icon: 'mdi-play-circle', to: '/videos', bg: 'linear-gradient(135deg,#EF4444,#F87171)' },
  { title: 'Learn & Play', icon: 'mdi-gamepad-variant', to: '/games', bg: 'linear-gradient(135deg,#10B981,#34D399)' },
  { title: 'Careers', icon: 'mdi-compass', to: '/careers', bg: 'linear-gradient(135deg,#3B82F6,#60A5FA)' },
]

const features = [
  {
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with chapter-based quizzes and get instant feedback.',
    icon: 'mdi-clipboard-check',
    gradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
    route: '/quizzes',
  },
  {
    title: 'Past Papers & Memos',
    description: 'Practice with real exam papers and memorandums filtered by subject and year.',
    icon: 'mdi-file-document-multiple',
    gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)',
    route: '/past-papers',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch educational videos covering key topics across all your subjects.',
    icon: 'mdi-video',
    gradient: 'linear-gradient(135deg,#EF4444,#F87171)',
    route: '/videos',
  },
  {
    title: 'Learn & Play',
    description: 'PhET simulations, GeoGebra tools, and educational games to make learning fun.',
    icon: 'mdi-gamepad-variant',
    gradient: 'linear-gradient(135deg,#10B981,#34D399)',
    route: '/games',
  },
  {
    title: 'Career Guidance',
    description: 'Explore careers, find bursaries, and plan your path after matric.',
    icon: 'mdi-compass',
    gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)',
    route: '/careers',
  },
  {
    title: 'Community Forums',
    description: 'Ask questions, share tips, and learn together with fellow SA learners.',
    icon: 'mdi-forum',
    gradient: 'linear-gradient(135deg,#8B5CF6,#C4B5FD)',
    route: '/forums',
  },
]

const stats = [
  { value: '50+', label: 'Subjects' },
  { value: '500+', label: 'Chapters' },
  { value: '1 000+', label: 'Questions' },
  { value: '5 000+', label: 'Learners' },
]
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

// Hero
.hero-section {
  padding: 48px 0 32px;
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-variant)) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 50%, rgba(var(--v-theme-primary), 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(var(--v-theme-primary), 0.06) 0%, transparent 50%);
    pointer-events: none;
  }
}

.hero-container { position: relative; z-index: 1; }

.gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-lighten-1)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-cta {
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
}

// Illustration
.hero-illustration {
  position: relative;
  width: 280px;
  height: 280px;
}

.illustration-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px auto 0;
}

.floating-chip {
  position: absolute;
  animation: float 3s ease-in-out infinite;
}
.chip-1 { top: 0; left: 0; animation-delay: 0s; }
.chip-2 { top: 20px; right: -10px; animation-delay: 1s; }
.chip-3 { bottom: 10px; left: 10px; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

// Quick Access
.quick-access-section {
  padding: 32px 0;
}

.quick-card {
  border: 1px solid rgb(var(--v-theme-outline));
  transition: transform 0.2s, border-color 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    border-color: rgb(var(--v-theme-primary));
  }
}

.quick-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

// Features
.features-section {
  padding: 40px 0;
}

.feature-card {
  border: 1px solid rgb(var(--v-theme-outline));
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-3px);
    border-color: rgb(var(--v-theme-primary));
  }
}

.feature-icon-bar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Stats
.stats-section {
  padding: 24px 0;
}

.stats-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

// CTA
.cta-section {
  padding: 24px 0 48px;
}

.cta-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-variant)) 100%);
  border: 1px solid rgb(var(--v-theme-outline));
}

// Mobile
@media (max-width: 767px) {
  .hero-section { padding: 32px 0 24px; }
  .hero-title { font-size: 1.75rem !important; }
  .quick-access-section { padding: 24px 0; }
  .features-section { padding: 24px 0; }
  .cta-section { padding: 16px 0 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .floating-chip { animation: none; }
  .hero-cta:hover { transform: none; }
  .quick-card:hover, .feature-card:hover { transform: none; }
}
</style>
