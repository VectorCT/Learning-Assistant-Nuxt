<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-2">
          <v-icon size="32" color="primary" class="mr-3">mdi-gamepad-variant</v-icon>
          <h1 class="text-h3">Learn &amp; Play</h1>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-5">
          Interactive simulations, games, and exercises to make learning fun
        </p>

        <!-- Category Filter -->
        <v-chip-group v-model="selectedCategory" mandatory class="mb-4">
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

        <!-- Featured PhET Simulation -->
        <v-card v-if="featuredSim" class="mb-6 featured-card" color="primary" variant="tonal">
          <v-row no-gutters>
            <v-col cols="12" md="7">
              <div class="featured-embed">
                <iframe
                  v-if="showFeatured"
                  :src="featuredSim.embedUrl"
                  :title="featuredSim.title"
                  frameborder="0"
                  allowfullscreen
                  class="sim-iframe"
                />
                <div v-else class="featured-placeholder" @click="showFeatured = true">
                  <v-icon size="64" color="primary">mdi-play-circle</v-icon>
                  <p class="text-body-1 mt-2">Click to load simulation</p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="5" class="d-flex flex-column justify-center pa-5">
              <v-chip size="small" color="primary" class="mb-2 align-self-start">Featured</v-chip>
              <h2 class="text-h5 font-weight-bold mb-2">{{ featuredSim.title }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-3">{{ featuredSim.description }}</p>
              <div class="d-flex flex-wrap ga-2">
                <v-chip size="small" variant="outlined">{{ featuredSim.subject }}</v-chip>
                <v-chip size="small" variant="outlined" prepend-icon="mdi-open-in-new">
                  <a :href="featuredSim.sourceUrl" target="_blank" rel="noopener" class="chip-link">
                    Source
                  </a>
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- Games Grid -->
        <v-row>
          <v-col
            v-for="game in filteredGames"
            :key="game.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card class="game-card h-100 d-flex flex-column" hover>
              <div class="game-thumbnail" :style="{ background: game.bgColor }">
                <v-icon size="48" :color="game.iconColor || 'white'">{{ game.icon }}</v-icon>
              </div>

              <v-card-title class="text-body-1 font-weight-bold pt-3">
                {{ game.title }}
              </v-card-title>

              <v-card-subtitle class="pb-1">
                {{ game.description }}
              </v-card-subtitle>

              <v-card-text class="pt-2 pb-1">
                <div class="d-flex flex-wrap ga-1">
                  <v-chip size="x-small" :color="getSubjectColor(game.subject)">
                    {{ game.subject }}
                  </v-chip>
                  <v-chip size="x-small" variant="outlined">{{ game.type }}</v-chip>
                  <v-chip v-if="game.grades" size="x-small" variant="outlined" prepend-icon="mdi-school">
                    {{ game.grades }}
                  </v-chip>
                </div>
              </v-card-text>

              <v-spacer />

              <v-card-actions>
                <v-btn
                  v-if="game.embedUrl"
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-play"
                  size="small"
                  @click="openEmbed(game)"
                >
                  Play Here
                </v-btn>
                <v-btn
                  variant="text"
                  prepend-icon="mdi-open-in-new"
                  size="small"
                  :href="game.url"
                  target="_blank"
                  rel="noopener"
                >
                  Open
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <EmptyState
          v-if="filteredGames.length === 0"
          icon="mdi-gamepad-variant-outline"
          title="No games in this category"
          description="Try selecting a different category"
        />
      </v-col>
    </v-row>

    <!-- Embed Dialog -->
    <v-dialog v-model="embedDialog" max-width="960" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-gamepad-variant</v-icon>
          {{ activeGame?.title }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="embedDialog = false" />
        </v-card-title>
        <v-card-text class="pa-0" style="height: 70vh;">
          <iframe
            v-if="activeGame?.embedUrl"
            :src="activeGame.embedUrl"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen
            :title="activeGame.title"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
interface GameResource {
  id: string
  title: string
  description: string
  subject: string
  category: string
  type: string
  icon: string
  bgColor: string
  iconColor?: string
  url: string
  embedUrl?: string
  grades?: string
}

const selectedCategory = ref('all')
const showFeatured = ref(false)
const embedDialog = ref(false)
const activeGame = ref<GameResource | null>(null)

const categories = [
  { value: 'all', label: 'All', icon: 'mdi-apps' },
  { value: 'physics', label: 'Physics', icon: 'mdi-atom' },
  { value: 'chemistry', label: 'Chemistry', icon: 'mdi-flask' },
  { value: 'maths', label: 'Mathematics', icon: 'mdi-calculator' },
  { value: 'biology', label: 'Biology', icon: 'mdi-dna' },
  { value: 'english', label: 'English', icon: 'mdi-book-open-page-variant' },
  { value: 'geography', label: 'Geography', icon: 'mdi-earth' },
  { value: 'general', label: 'General', icon: 'mdi-lightbulb' },
]

const featuredSim = computed(() => {
  return {
    title: "Ohm's Law Simulation",
    description: "Explore the relationship between voltage, current, and resistance. Adjust values and see real-time changes — perfect for Physical Sciences.",
    subject: 'Physics',
    embedUrl: 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html',
    sourceUrl: 'https://phet.colorado.edu/en/simulations/ohms-law',
  }
})

const games: GameResource[] = [
  // Physics
  {
    id: 'phet-forces',
    title: 'Forces and Motion',
    description: 'Push and pull objects, explore friction and net force in this interactive sim.',
    subject: 'Physics',
    category: 'physics',
    type: 'Simulation',
    icon: 'mdi-arrow-right-bold',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    url: 'https://phet.colorado.edu/en/simulations/forces-and-motion-basics',
    embedUrl: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html',
    grades: 'Gr 8-12',
  },
  {
    id: 'phet-energy',
    title: 'Energy Skate Park',
    description: 'Build tracks and explore kinetic, potential, and thermal energy conservation.',
    subject: 'Physics',
    category: 'physics',
    type: 'Simulation',
    icon: 'mdi-lightning-bolt',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    url: 'https://phet.colorado.edu/en/simulations/energy-skate-park-basics',
    embedUrl: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html',
    grades: 'Gr 10-12',
  },
  {
    id: 'phet-waves',
    title: 'Wave on a String',
    description: 'Generate waves and explore amplitude, frequency, and damping.',
    subject: 'Physics',
    category: 'physics',
    type: 'Simulation',
    icon: 'mdi-sine-wave',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    url: 'https://phet.colorado.edu/en/simulations/wave-on-a-string',
    embedUrl: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html',
    grades: 'Gr 10-12',
  },
  {
    id: 'phet-circuit',
    title: 'Circuit Construction Kit',
    description: 'Build circuits with batteries, resistors, light bulbs, and switches.',
    subject: 'Physics',
    category: 'physics',
    type: 'Simulation',
    icon: 'mdi-flash',
    bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    url: 'https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc',
    embedUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
    grades: 'Gr 9-12',
  },
  {
    id: 'phet-projectile',
    title: 'Projectile Motion',
    description: 'Launch objects and explore trajectory, range, and air resistance.',
    subject: 'Physics',
    category: 'physics',
    type: 'Simulation',
    icon: 'mdi-rocket-launch',
    bgColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    url: 'https://phet.colorado.edu/en/simulations/projectile-motion',
    embedUrl: 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
    grades: 'Gr 11-12',
  },
  // Chemistry
  {
    id: 'phet-balancing',
    title: 'Balancing Chemical Equations',
    description: 'Practice balancing equations by adjusting coefficients in real time.',
    subject: 'Chemistry',
    category: 'chemistry',
    type: 'Simulation',
    icon: 'mdi-scale-balance',
    bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    url: 'https://phet.colorado.edu/en/simulations/balancing-chemical-equations',
    embedUrl: 'https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html',
    grades: 'Gr 10-12',
  },
  {
    id: 'phet-atom',
    title: 'Build an Atom',
    description: 'Add protons, neutrons, and electrons to build atoms and explore isotopes.',
    subject: 'Chemistry',
    category: 'chemistry',
    type: 'Simulation',
    icon: 'mdi-atom',
    bgColor: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    url: 'https://phet.colorado.edu/en/simulations/build-an-atom',
    embedUrl: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
    grades: 'Gr 8-10',
  },
  {
    id: 'phet-ph-scale',
    title: 'pH Scale',
    description: 'Test the pH of everyday substances and explore acids and bases.',
    subject: 'Chemistry',
    category: 'chemistry',
    type: 'Simulation',
    icon: 'mdi-flask-round-bottom',
    bgColor: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
    iconColor: '#333',
    url: 'https://phet.colorado.edu/en/simulations/ph-scale',
    embedUrl: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html',
    grades: 'Gr 10-12',
  },
  // Mathematics
  {
    id: 'geogebra-graphing',
    title: 'GeoGebra Graphing Calculator',
    description: 'Plot functions, explore transformations, and solve equations visually.',
    subject: 'Mathematics',
    category: 'maths',
    type: 'Tool',
    icon: 'mdi-chart-line',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    url: 'https://www.geogebra.org/graphing',
    embedUrl: 'https://www.geogebra.org/graphing',
    grades: 'Gr 8-12',
  },
  {
    id: 'geogebra-geometry',
    title: 'GeoGebra Geometry',
    description: 'Construct shapes, measure angles, and explore geometric proofs interactively.',
    subject: 'Mathematics',
    category: 'maths',
    type: 'Tool',
    icon: 'mdi-shape',
    bgColor: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    url: 'https://www.geogebra.org/geometry',
    embedUrl: 'https://www.geogebra.org/geometry',
    grades: 'Gr 8-12',
  },
  {
    id: 'phet-area-builder',
    title: 'Area Builder',
    description: 'Build shapes and explore the relationship between area and perimeter.',
    subject: 'Mathematics',
    category: 'maths',
    type: 'Simulation',
    icon: 'mdi-square-opacity',
    bgColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    iconColor: '#333',
    url: 'https://phet.colorado.edu/en/simulations/area-builder',
    embedUrl: 'https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_en.html',
    grades: 'Gr 8-9',
  },
  {
    id: 'phet-function-builder',
    title: 'Function Builder',
    description: 'Build functions by chaining operations and see input/output patterns.',
    subject: 'Mathematics',
    category: 'maths',
    type: 'Simulation',
    icon: 'mdi-function',
    bgColor: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    url: 'https://phet.colorado.edu/en/simulations/function-builder',
    embedUrl: 'https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_en.html',
    grades: 'Gr 8-10',
  },
  // Biology
  {
    id: 'phet-natural-selection',
    title: 'Natural Selection',
    description: 'Simulate evolution by adding mutations and environmental factors to a bunny population.',
    subject: 'Biology',
    category: 'biology',
    type: 'Simulation',
    icon: 'mdi-rabbit',
    bgColor: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    iconColor: '#333',
    url: 'https://phet.colorado.edu/en/simulations/natural-selection',
    embedUrl: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
    grades: 'Gr 10-12',
  },
  {
    id: 'phet-gene-expression',
    title: 'Gene Expression Essentials',
    description: 'Explore transcription and translation — watch a gene get expressed into a protein.',
    subject: 'Biology',
    category: 'biology',
    type: 'Simulation',
    icon: 'mdi-dna',
    bgColor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    iconColor: '#333',
    url: 'https://phet.colorado.edu/en/simulations/gene-expression-essentials',
    embedUrl: 'https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_en.html',
    grades: 'Gr 11-12',
  },
  // English
  {
    id: 'vocab-test',
    title: 'Vocabulary.com',
    description: 'Adaptive vocabulary builder with game-like challenges and progress tracking.',
    subject: 'English',
    category: 'english',
    type: 'Game Platform',
    icon: 'mdi-alphabetical',
    bgColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    iconColor: '#333',
    url: 'https://www.vocabulary.com/play/',
    grades: 'Gr 8-12',
  },
  {
    id: 'grammar-monster',
    title: 'Grammar Monster',
    description: 'Interactive grammar exercises covering parts of speech, punctuation, and sentence structure.',
    subject: 'English',
    category: 'english',
    type: 'Exercises',
    icon: 'mdi-format-text',
    bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    iconColor: '#333',
    url: 'https://www.grammar-monster.com/exercises/',
    grades: 'Gr 8-12',
  },
  {
    id: 'storybird',
    title: 'NoRedInk',
    description: 'Practice grammar and writing skills with adaptive exercises tailored to your level.',
    subject: 'English',
    category: 'english',
    type: 'Exercises',
    icon: 'mdi-pencil',
    bgColor: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
    url: 'https://www.noredink.com/',
    grades: 'Gr 8-12',
  },
  {
    id: 'lit-genius',
    title: 'CommonLit',
    description: 'Free reading passages with guided questions for comprehension and literary analysis.',
    subject: 'English',
    category: 'english',
    type: 'Reading',
    icon: 'mdi-book-open-variant',
    bgColor: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    iconColor: '#333',
    url: 'https://www.commonlit.org/',
    grades: 'Gr 8-12',
  },
  // Geography
  {
    id: 'seterra',
    title: 'Seterra Geography',
    description: 'Learn countries, capitals, flags, and oceans with interactive map quizzes.',
    subject: 'Geography',
    category: 'geography',
    type: 'Map Quiz',
    icon: 'mdi-earth',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #43e97b 100%)',
    url: 'https://www.seterra.com/',
    embedUrl: 'https://www.seterra.com/en-an/vgp/3163',
    grades: 'Gr 8-12',
  },
  {
    id: 'world-geography-games',
    title: 'World Geography Games',
    description: 'Drag-and-drop map games for continents, countries, rivers, and mountains.',
    subject: 'Geography',
    category: 'geography',
    type: 'Map Quiz',
    icon: 'mdi-map-marker',
    bgColor: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    url: 'https://world-geography-games.com/',
    grades: 'Gr 8-12',
  },
  {
    id: 'geoguessr-free',
    title: 'GeoGuessr',
    description: 'Explore the world through Street View and guess your location — great for map skills.',
    subject: 'Geography',
    category: 'geography',
    type: 'Exploration',
    icon: 'mdi-compass-outline',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    url: 'https://www.geoguessr.com/free',
    grades: 'Gr 8-12',
  },
  {
    id: 'lizard-point',
    title: 'Lizard Point Quizzes',
    description: 'Click-on-map quizzes for Africa, world regions, and physical geography features.',
    subject: 'Geography',
    category: 'geography',
    type: 'Map Quiz',
    icon: 'mdi-map',
    bgColor: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    url: 'https://lizardpoint.com/geography/',
    grades: 'Gr 8-12',
  },
  // General / Cross-subject
  {
    id: 'educaplay',
    title: 'Educaplay Games',
    description: 'Crosswords, word searches, matching games, and quizzes across all subjects.',
    subject: 'General',
    category: 'general',
    type: 'Game Platform',
    icon: 'mdi-puzzle',
    bgColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    iconColor: '#333',
    url: 'https://www.educaplay.com/',
    grades: 'Gr 8-12',
  },
  {
    id: 'educandy',
    title: 'Educandy',
    description: 'Turn any word list into fun games — matching, anagrams, word search, and more.',
    subject: 'General',
    category: 'general',
    type: 'Game Platform',
    icon: 'mdi-candy',
    bgColor: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    iconColor: '#333',
    url: 'https://www.educandy.com/',
    grades: 'Gr 8-12',
  },
]

const filteredGames = computed(() => {
  if (selectedCategory.value === 'all') return games
  return games.filter(g => g.category === selectedCategory.value)
})

function getSubjectColor(subject: string) {
  const colors: Record<string, string> = {
    Physics: 'purple',
    Chemistry: 'green',
    Mathematics: 'blue',
    Biology: 'teal',
    English: 'deep-orange',
    Geography: 'cyan',
    General: 'orange',
  }
  return colors[subject] || 'grey'
}

function openEmbed(game: GameResource) {
  activeGame.value = game
  embedDialog.value = true
}
</script>

<style scoped lang="scss">
.featured-card {
  overflow: hidden;
}

.featured-embed {
  aspect-ratio: 16 / 10;
  width: 100%;
  background: #000;
  position: relative;
}

.featured-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(var(--v-theme-surface-variant), 1);
  transition: background 0.2s;

  &:hover {
    background: rgba(var(--v-theme-surface-variant), 0.8);
  }
}

.sim-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.game-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.game-thumbnail {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-link {
  color: inherit;
  text-decoration: none;
}

@media (max-width: 767px) {
  .game-thumbnail {
    height: 100px;
  }

  .featured-embed {
    aspect-ratio: 16 / 9;
  }
}
</style>
