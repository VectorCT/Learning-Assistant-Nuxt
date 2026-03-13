<template>
  <v-container fluid class="pa-4">
    <h1 class="text-h4 mb-6">ContentCard Component Demo</h1>

    <!-- Grid Layout Demo -->
    <v-row>
      <!-- Card with Image -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <ContentCard
          title="Mathematics Grade 10"
          description="Master algebra, geometry, and trigonometry with comprehensive lessons and practice exercises."
          image="https://picsum.photos/400/300?random=1"
          status="In Progress"
          status-color="info"
          :progress="65"
          :metadata="{
            items: '12 chapters',
            duration: '8 weeks'
          }"
          to="/subjects/math"
        />
      </v-col>

      <!-- Card with Icon -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <ContentCard
          title="Physical Sciences"
          description="Explore physics and chemistry concepts through interactive content and experiments."
          icon="mdi-flask"
          icon-color="success"
          status="Not Started"
          status-color="secondary"
          :progress="0"
          :metadata="{
            items: '15 chapters',
            duration: '10 weeks'
          }"
          @click="handleCardClick('Physical Sciences')"
        />
      </v-col>

      <!-- Card with Progress -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <ContentCard
          title="Life Sciences"
          description="Study biology, ecology, and human anatomy with detailed diagrams and videos."
          icon="mdi-leaf"
          icon-color="success"
          status="Completed"
          status-color="success"
          :progress="100"
          :metadata="{
            items: '10 chapters',
            duration: '6 weeks'
          }"
        />
      </v-col>

      <!-- Card with Custom Actions -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <ContentCard
          title="English Home Language"
          description="Improve your reading, writing, and comprehension skills with engaging literature."
          icon="mdi-book-open-page-variant"
          icon-color="primary"
          :metadata="{
            items: '8 chapters',
            author: 'Mrs. Smith'
          }"
        >
          <template #actions>
            <v-btn variant="text" color="primary" size="small">
              Start Learning
            </v-btn>
            <v-spacer />
            <v-btn icon="mdi-bookmark-outline" variant="text" size="small" />
          </template>
        </ContentCard>
      </v-col>

      <!-- More example cards -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <ContentCard
          title="History"
          description="Journey through South African and world history with interactive timelines."
          icon="mdi-clock-time-four-outline"
          icon-color="warning"
          status="In Progress"
          :progress="45"
          :metadata="{
            items: '6 chapters',
            duration: '5 weeks'
          }"
        />
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <ContentCard
          title="Geography"
          description="Explore maps, climate patterns, and human-environment interactions."
          icon="mdi-earth"
          icon-color="info"
          :metadata="{
            items: '9 chapters',
            date: 'Updated 2 days ago'
          }"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
function handleCardClick(title: string) {
  console.log(`Card clicked: ${title}`)
}
</script>
