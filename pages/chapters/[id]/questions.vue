<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Breadcrumbs -->
        <v-breadcrumbs :items="breadcrumbs" class="px-0">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>

        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 mb-2">Practice Questions</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Practice at your own pace with immediate feedback
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-clipboard-check"
            :to="`/quiz/${chapterId}`"
          >
            Take Quiz
          </v-btn>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
          <p class="mt-4 text-medium-emphasis">Loading questions...</p>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- No Questions State -->
        <v-alert
          v-else-if="questions.length === 0"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          No practice questions available for this chapter yet.
        </v-alert>

        <!-- Practice Interface -->
        <div v-else>
          <!-- Progress Bar -->
          <v-card class="mb-6">
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-2">Progress</span>
                <span class="text-subtitle-2">
                  {{ attemptedCount }} / {{ questions.length }} questions attempted
                </span>
              </div>
              <v-progress-linear
                :model-value="progressPercentage"
                color="primary"
                height="8"
                rounded
              />
            </v-card-text>
          </v-card>

          <!-- Current Question -->
          <v-card class="mb-4">
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h6">
                  Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
                </h2>
                <v-chip color="primary" size="small">
                  {{ currentQuestion.pointValue }} pts
                </v-chip>
              </div>

              <p class="text-body-1 mb-4">{{ currentQuestion.questionText }}</p>

              <!-- Answer Options -->
              <v-radio-group
                v-if="currentQuestion.maxSelections === 1"
                v-model="selectedAnswer"
                :disabled="hasAttempted"
              >
                <v-radio
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :label="option"
                  :value="option"
                  :color="getOptionColor(option)"
                />
              </v-radio-group>

              <div v-else>
                <v-checkbox
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :label="option"
                  :model-value="selectedAnswers.includes(option)"
                  @update:model-value="handleMultiSelect(option, $event)"
                  :disabled="hasAttempted || (selectedAnswers.length >= currentQuestion.maxSelections && !selectedAnswers.includes(option))"
                  :color="getOptionColor(option)"
                />
                <v-chip v-if="currentQuestion.maxSelections > 1" size="small" class="mt-2">
                  Select up to {{ currentQuestion.maxSelections }} options
                </v-chip>
              </div>

              <!-- Feedback Alert -->
              <v-alert
                v-if="hasAttempted"
                :type="isCurrentCorrect ? 'success' : 'error'"
                variant="tonal"
                class="mt-4"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-2">
                    {{ isCurrentCorrect ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <div>
                    <div class="font-weight-bold">
                      {{ isCurrentCorrect ? 'Correct!' : 'Incorrect' }}
                    </div>
                    <div v-if="!isCurrentCorrect" class="mt-1">
                      Correct answer{{ correctAnswers.length > 1 ? 's' : '' }}: 
                      <strong>{{ correctAnswers.join(', ') }}</strong>
                    </div>
                  </div>
                </div>
              </v-alert>

              <!-- Action Buttons -->
              <div class="d-flex justify-space-between mt-6">
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-chevron-left"
                  :disabled="currentQuestionIndex === 0"
                  @click="previousQuestion"
                >
                  Previous
                </v-btn>

                <v-btn
                  v-if="!hasAttempted"
                  color="primary"
                  prepend-icon="mdi-check"
                  :disabled="!hasSelectedAnswer"
                  @click="checkAnswer"
                >
                  Check Answer
                </v-btn>

                <v-btn
                  v-if="hasAttempted && currentQuestionIndex < questions.length - 1"
                  color="primary"
                  append-icon="mdi-chevron-right"
                  @click="nextQuestion"
                >
                  Next Question
                </v-btn>

                <v-btn
                  v-if="hasAttempted && currentQuestionIndex === questions.length - 1"
                  color="success"
                  prepend-icon="mdi-restart"
                  @click="resetPractice"
                >
                  Start Over
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Question Navigation -->
          <v-card>
            <v-card-title>Question Navigator</v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap gap-2 question-navigator">
                <v-btn
                  v-for="(question, index) in questions"
                  :key="question.id"
                  :variant="index === currentQuestionIndex ? 'elevated' : 'outlined'"
                  :color="getQuestionStatusColor(index)"
                  size="default"
                  class="question-nav-btn"
                  @click="goToQuestion(index)"
                  :aria-label="`Go to question ${index + 1}`"
                >
                  {{ index + 1 }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionsStore } from '~/stores/questions'

const route = useRoute()
const router = useRouter()
const questionsStore = useQuestionsStore()

const chapterId = computed(() => route.params.id as string)
const loading = ref(false)
const error = ref<string | null>(null)
const questions = ref<any[]>([])
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<string>('')
const selectedAnswers = ref<string[]>([])
const attemptedQuestions = ref<Set<number>>(new Set())
const correctAnswersMap = ref<Map<number, string[]>>(new Map())
const userAnswersMap = ref<Map<number, string[]>>(new Map())

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const hasAttempted = computed(() => attemptedQuestions.value.has(currentQuestionIndex.value))
const attemptedCount = computed(() => attemptedQuestions.value.size)
const progressPercentage = computed(() => 
  questions.value.length > 0 ? (attemptedCount.value / questions.value.length) * 100 : 0
)

const hasSelectedAnswer = computed(() => {
  if (!currentQuestion.value) return false
  if (currentQuestion.value.maxSelections === 1) {
    return selectedAnswer.value !== ''
  }
  return selectedAnswers.value.length > 0
})

const correctAnswers = computed(() => {
  return correctAnswersMap.value.get(currentQuestionIndex.value) || []
})

const isCurrentCorrect = computed(() => {
  if (!hasAttempted.value) return false
  const correct = correctAnswers.value
  const selected = currentQuestion.value.maxSelections === 1 
    ? [selectedAnswer.value] 
    : selectedAnswers.value
  
  if (selected.length !== correct.length) return false
  return selected.every(opt => correct.includes(opt))
})

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Chapters', to: '/subjects' },
  { title: 'Practice Questions', disabled: true }
])

async function fetchQuestions() {
  loading.value = true
  error.value = null
  
  try {
    const fetchedQuestions = await questionsStore.fetchByChapter(chapterId.value)
    questions.value = fetchedQuestions
  } catch (err: any) {
    error.value = err.message || 'Failed to load questions'
  } finally {
    loading.value = false
  }
}

function handleMultiSelect(option: string, checked: boolean) {
  if (checked) {
    if (selectedAnswers.value.length < currentQuestion.value.maxSelections) {
      selectedAnswers.value.push(option)
    }
  } else {
    selectedAnswers.value = selectedAnswers.value.filter(v => v !== option)
  }
}

async function checkAnswer() {
  if (!hasSelectedAnswer.value) return
  
  // Simulate checking answer by calling API
  // In a real implementation, this would call an API endpoint
  // For now, we'll use a mock implementation
  try {
    const api = useApi()
    const selected = currentQuestion.value.maxSelections === 1 
      ? [selectedAnswer.value] 
      : selectedAnswers.value
    
    // Store user's answer
    userAnswersMap.value.set(currentQuestionIndex.value, [...selected])
    
    // Mock response - in real implementation, API would return correct answers
    // For now, we'll fetch the answer from the backend
    const answers = await api.getAnswersByQuestion(currentQuestion.value.id)
    const correctOptions = answers
      .filter((a: any) => a.isCorrect)
      .map((a: any) => a.answerText)
    
    correctAnswersMap.value.set(currentQuestionIndex.value, correctOptions)
    attemptedQuestions.value.add(currentQuestionIndex.value)
  } catch (err: any) {
    error.value = 'Failed to check answer'
  }
}

function nextQuestion() {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    resetCurrentSelection()
    
    // Restore previous answer if question was attempted
    if (attemptedQuestions.value.has(currentQuestionIndex.value)) {
      const userAnswer = userAnswersMap.value.get(currentQuestionIndex.value) || []
      if (currentQuestion.value.maxSelections === 1) {
        selectedAnswer.value = userAnswer[0] || ''
      } else {
        selectedAnswers.value = [...userAnswer]
      }
    }
  }
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    resetCurrentSelection()
    
    // Restore previous answer if question was attempted
    if (attemptedQuestions.value.has(currentQuestionIndex.value)) {
      const userAnswer = userAnswersMap.value.get(currentQuestionIndex.value) || []
      if (currentQuestion.value.maxSelections === 1) {
        selectedAnswer.value = userAnswer[0] || ''
      } else {
        selectedAnswers.value = [...userAnswer]
      }
    }
  }
}

function goToQuestion(index: number) {
  currentQuestionIndex.value = index
  resetCurrentSelection()
  
  // Restore previous answer if question was attempted
  if (attemptedQuestions.value.has(index)) {
    const userAnswer = userAnswersMap.value.get(index) || []
    if (currentQuestion.value.maxSelections === 1) {
      selectedAnswer.value = userAnswer[0] || ''
    } else {
      selectedAnswers.value = [...userAnswer]
    }
  }
}

function resetCurrentSelection() {
  selectedAnswer.value = ''
  selectedAnswers.value = []
}

function resetPractice() {
  currentQuestionIndex.value = 0
  attemptedQuestions.value.clear()
  correctAnswersMap.value.clear()
  userAnswersMap.value.clear()
  resetCurrentSelection()
}

function getOptionColor(option: string) {
  if (!hasAttempted.value) return 'primary'
  if (correctAnswers.value.includes(option)) return 'success'
  
  const selected = currentQuestion.value.maxSelections === 1 
    ? [selectedAnswer.value] 
    : selectedAnswers.value
  
  if (selected.includes(option) && !correctAnswers.value.includes(option)) {
    return 'error'
  }
  return 'primary'
}

function getQuestionStatusColor(index: number) {
  if (!attemptedQuestions.value.has(index)) return 'default'
  
  const correct = correctAnswersMap.value.get(index) || []
  const userAnswer = userAnswersMap.value.get(index) || []
  
  // Check if answer is correct
  if (userAnswer.length !== correct.length) return 'error'
  const isCorrect = userAnswer.every(opt => correct.includes(opt))
  
  return isCorrect ? 'success' : 'error'
}

onMounted(() => {
  fetchQuestions()
})
</script>

<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

.gap-2 {
  gap: 0.5rem;
}

// Question navigator touch targets
.question-navigator {
  gap: 12px;
  
  @include mobile {
    gap: 8px;
  }
}

.question-nav-btn {
  @include mobile {
    min-width: 44px !important;
    min-height: 44px !important;
  }
}
</style>
