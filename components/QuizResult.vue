<template>
  <v-card class="quiz-result-card" elevation="2">
    <!-- Header Section with Encouraging Message -->
    <v-card-text class="text-center pa-8">
      <div class="mb-4">
        <v-icon :color="scoreColor" size="64">
          {{ scoreIcon }}
        </v-icon>
      </div>
      
      <h2 class="text-h4 font-weight-bold mb-2">
        {{ encouragingMessage }}
      </h2>
      
      <p class="text-subtitle-1 text-medium-emphasis mb-6">
        {{ scoreDescription }}
      </p>
      
      <!-- Score Display with Progress Circle -->
      <div class="score-display mb-6">
        <v-progress-circular
          :model-value="percentage"
          :size="180"
          :width="16"
          :color="scoreColor"
          class="mb-4"
        >
          <div class="score-content">
            <div class="text-h2 font-weight-bold">{{ percentage }}%</div>
            <div class="text-caption text-medium-emphasis">Score</div>
          </div>
        </v-progress-circular>
        
        <div class="mt-4">
          <v-chip
            :color="scoreColor"
            size="large"
            variant="tonal"
            class="px-6"
          >
            <v-icon start>mdi-star</v-icon>
            {{ result.totalScore }} / {{ result.maxScore }} points
          </v-chip>
        </div>
      </div>
      
      <!-- Performance Stats -->
      <v-row class="mb-4" justify="center">
        <v-col cols="12" sm="4">
          <v-card variant="tonal" color="success">
            <v-card-text class="text-center py-4">
              <div class="text-h4 font-weight-bold">{{ correctCount }}</div>
              <div class="text-caption">Correct</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="tonal" color="error">
            <v-card-text class="text-center py-4">
              <div class="text-h4 font-weight-bold">{{ incorrectCount }}</div>
              <div class="text-caption">Incorrect</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="tonal" color="primary">
            <v-card-text class="text-center py-4">
              <div class="text-h4 font-weight-bold">{{ totalQuestions }}</div>
              <div class="text-caption">Total</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    
    <v-divider />
    
    <!-- Question Results Section -->
    <v-card-text class="pa-6">
      <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon start>mdi-format-list-checks</v-icon>
        Question Breakdown
      </h3>
      
      <v-row>
        <v-col
          v-for="(questionResult, index) in result.questionResults"
          :key="questionResult.questionId"
          cols="12"
          md="6"
        >
          <v-card
            :color="questionResult.isCorrect ? 'success' : 'error'"
            variant="tonal"
            class="question-result-card"
            elevation="0"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="d-flex align-center">
                  <v-avatar
                    :color="questionResult.isCorrect ? 'success' : 'error'"
                    size="32"
                    class="mr-3"
                  >
                    <v-icon size="20">
                      {{ questionResult.isCorrect ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                  </v-avatar>
                  <span class="font-weight-medium">Question {{ index + 1 }}</span>
                </div>
                <v-chip
                  :color="questionResult.isCorrect ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                >
                  {{ questionResult.awardedPoints }} / {{ getQuestionPoints(questionResult.questionId) }} pts
                </v-chip>
              </div>
              
              <!-- Progress bar for points -->
              <v-progress-linear
                :model-value="(questionResult.awardedPoints / getQuestionPoints(questionResult.questionId)) * 100"
                :color="questionResult.isCorrect ? 'success' : 'error'"
                height="6"
                rounded
                class="mb-2"
              />
              
              <div v-if="!questionResult.isCorrect" class="mt-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  <v-icon size="14" class="mr-1">mdi-information</v-icon>
                  Correct answer(s):
                </div>
                <div class="text-body-2 font-weight-medium">
                  {{ questionResult.correctOptions.join(', ') }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    
    <v-divider />
    
    <!-- Action Buttons -->
    <v-card-actions class="pa-6 justify-center">
      <v-btn
        color="primary"
        size="large"
        variant="flat"
        prepend-icon="mdi-refresh"
        @click="emit('retake')"
        class="px-8"
      >
        Retake Quiz
      </v-btn>
      
      <v-btn
        color="secondary"
        size="large"
        variant="tonal"
        prepend-icon="mdi-arrow-left"
        @click="emit('exit')"
        class="px-8"
      >
        Back to Chapter
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  result: {
    totalScore: number
    maxScore: number
    questionResults: Array<{
      questionId: string
      isCorrect: boolean
      awardedPoints: number
      correctOptions: string[]
    }>
  }
  questions: Array<{
    id: string
    pointValue: number
  }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'retake': []
  'exit': []
}>()

const percentage = computed(() => {
  if (props.result.maxScore === 0) return 0
  return Math.round((props.result.totalScore / props.result.maxScore) * 100)
})

const scoreColor = computed(() => {
  const pct = percentage.value
  if (pct >= 80) return 'success'
  if (pct >= 60) return 'warning'
  return 'error'
})

const scoreIcon = computed(() => {
  const pct = percentage.value
  if (pct >= 80) return 'mdi-trophy'
  if (pct >= 60) return 'mdi-thumb-up'
  return 'mdi-lightbulb-on'
})

const encouragingMessage = computed(() => {
  const pct = percentage.value
  if (pct >= 90) return 'Outstanding Work!'
  if (pct >= 80) return 'Great Job!'
  if (pct >= 70) return 'Well Done!'
  if (pct >= 60) return 'Good Effort!'
  if (pct >= 50) return 'Keep Practicing!'
  return 'Don\'t Give Up!'
})

const scoreDescription = computed(() => {
  const pct = percentage.value
  if (pct >= 90) return 'You\'ve mastered this material! Excellent understanding.'
  if (pct >= 80) return 'You have a strong grasp of the concepts. Keep it up!'
  if (pct >= 70) return 'You\'re doing well. Review the missed questions to improve.'
  if (pct >= 60) return 'You\'re on the right track. A bit more practice will help.'
  if (pct >= 50) return 'You\'re making progress. Review the material and try again.'
  return 'Learning takes time. Review the material and don\'t hesitate to ask for help.'
})

const correctCount = computed(() => {
  return props.result.questionResults.filter(q => q.isCorrect).length
})

const incorrectCount = computed(() => {
  return props.result.questionResults.filter(q => !q.isCorrect).length
})

const totalQuestions = computed(() => {
  return props.result.questionResults.length
})

function getQuestionPoints(questionId: string) {
  const question = props.questions.find(q => q.id === questionId)
  return question?.pointValue || 0
}
</script>

<style scoped>
.quiz-result-card {
  max-width: 1200px;
  margin: 0 auto;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.question-result-card {
  transition: transform 0.2s ease-in-out;
}

.question-result-card:hover {
  transform: translateY(-2px);
}
</style>
