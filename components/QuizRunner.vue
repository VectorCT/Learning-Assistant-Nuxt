<template>
  <div class="quiz-runner">
    <!-- Progress Header - Fixed at top -->
    <div v-if="!quizStore.isComplete" class="quiz-progress-header">
      <v-container class="py-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center gap-3">
            <v-icon size="24" color="primary">mdi-clipboard-text</v-icon>
            <div>
              <div class="text-subtitle-1 font-weight-medium">Quiz in Progress</div>
              <div class="text-caption text-medium-emphasis">
                Question {{ quizStore.currentQuestionIndex + 1 }} of {{ questions.length }}
              </div>
            </div>
          </div>
          
          <v-chip
            :color="quizStore.allAnswered ? 'success' : 'primary'"
            variant="flat"
            size="small"
          >
            <v-icon start size="16">
              {{ quizStore.allAnswered ? 'mdi-check-circle' : 'mdi-progress-clock' }}
            </v-icon>
            {{ answeredCount }} / {{ questions.length }} answered
          </v-chip>
        </div>
        
        <v-progress-linear
          :model-value="quizStore.progressPercentage"
          color="primary"
          height="6"
          rounded
          class="quiz-progress-bar"
        />
      </v-container>
    </div>
    
    <!-- Loading State -->
    <v-container v-if="loading" class="quiz-content">
      <div class="text-center py-16">
        <v-progress-circular 
          indeterminate 
          color="primary" 
          size="64"
          width="6"
        />
        <p class="text-h6 mt-6 text-medium-emphasis">Loading your quiz...</p>
      </div>
    </v-container>
    
    <!-- Error State -->
    <v-container v-if="error" class="quiz-content">
      <v-alert
        type="error"
        variant="tonal"
        prominent
        class="mb-4"
      >
        <template #prepend>
          <v-icon size="32">mdi-alert-circle</v-icon>
        </template>
        {{ error }}
      </v-alert>
    </v-container>
    
    <!-- Quiz Questions -->
    <v-container v-if="!loading && !quizStore.isComplete && questions.length > 0" class="quiz-content">
      <div class="quiz-questions-container">
        <QuestionCard
          v-for="(question, index) in questions"
          :key="question.id"
          :question="question"
          :question-number="index + 1"
          :total-questions="questions.length"
          :model-value="quizStore.answers[question.id] || []"
          @update:model-value="quizStore.setAnswer(question.id, $event)"
        />
      </div>
      
      <!-- Action Buttons - Sticky at bottom -->
      <div class="quiz-actions">
        <v-btn
          variant="outlined"
          color="secondary"
          size="large"
          prepend-icon="mdi-exit-to-app"
          @click="emit('quiz-exit')"
        >
          Exit Quiz
        </v-btn>
        
        <v-btn
          color="primary"
          size="large"
          :disabled="!quizStore.allAnswered"
          :loading="quizStore.isSubmitting"
          prepend-icon="mdi-check-bold"
          @click="submitQuiz"
        >
          Submit Quiz
        </v-btn>
      </div>
    </v-container>
    
    <!-- Quiz Results -->
    <QuizResult
      v-if="quizStore.isComplete && quizStore.result"
      :result="quizStore.result"
      :questions="questions"
      @retake="retakeQuiz"
      @exit="emit('quiz-exit')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  chapterId: string
  mode?: 'sequential' | 'all-at-once'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'all-at-once'
})

const emit = defineEmits<{
  'quiz-complete': [result: any]
  'quiz-exit': []
}>()

const quizStore = useQuizStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const loading = ref(true)
const error = ref<string | null>(null)

const questions = computed(() => quizStore.currentQuestions)

const answeredCount = computed(() => {
  return Object.keys(quizStore.answers).filter(
    key => quizStore.answers[key] && quizStore.answers[key].length > 0
  ).length
})

onMounted(async () => {
  try {
    await quizStore.startQuiz(props.chapterId)
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load quiz')
  } finally {
    loading.value = false
  }
})

async function submitQuiz() {
  try {
    const result = await quizStore.submitQuiz()
    handleSuccess('Quiz submitted successfully!')
    emit('quiz-complete', result)
  } catch (err: any) {
    handleApiError(err, 'Failed to submit quiz')
  }
}

function retakeQuiz() {
  quizStore.resetQuiz()
  loading.value = true
  onMounted()
}

defineExpose({
  resetQuiz: () => quizStore.resetQuiz(),
  submitQuiz
})
</script>


<style scoped lang="scss">
.quiz-runner {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.quiz-progress-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quiz-progress-bar {
  border-radius: 8px;
  overflow: hidden;
}

.quiz-content {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 8rem;
}

.quiz-questions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quiz-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline));
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    
    .v-btn {
      width: 100%;
    }
  }
}

.gap-3 {
  gap: 0.75rem;
}
</style>
