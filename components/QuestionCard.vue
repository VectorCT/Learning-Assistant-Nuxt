<template>
  <v-card 
    class="question-card" 
    :class="{ 'question-answered': hasAnswer }"
    elevation="2"
  >
    <v-card-text class="pa-6">
      <!-- Question Header -->
      <div class="question-header mb-5">
        <div class="d-flex align-center justify-space-between mb-3">
          <v-chip
            color="primary"
            variant="tonal"
            size="small"
            class="question-number-chip"
          >
            Question {{ questionNumber }} of {{ totalQuestions }}
          </v-chip>
          
          <v-chip
            :color="hasAnswer ? 'success' : 'secondary'"
            variant="flat"
            size="small"
          >
            <v-icon start size="16">
              {{ hasAnswer ? 'mdi-check-circle' : 'mdi-star' }}
            </v-icon>
            {{ question.pointValue }} pts
          </v-chip>
        </div>
        
        <h3 class="question-text text-h6 font-weight-medium">
          {{ question.questionText }}
        </h3>
        
        <v-chip
          v-if="question.maxSelections > 1"
          color="info"
          variant="tonal"
          size="small"
          class="mt-3"
        >
          <v-icon start size="16">mdi-information</v-icon>
          Select up to {{ question.maxSelections }} options
        </v-chip>
      </div>
      
      <!-- Short Answer / Worked Solution -->
      <div v-if="isTextAnswer" class="answer-options">
        <v-textarea
          :model-value="modelValue[0] || ''"
          @update:model-value="handleTextAnswer"
          :disabled="disabled"
          label="Type your answer here"
          variant="outlined"
          rows="4"
          auto-grow
          color="primary"
        />
      </div>

      <!-- Single Selection (Radio) -->
      <v-radio-group
        v-else-if="question.maxSelections === 1"
        :model-value="modelValue[0]"
        @update:model-value="handleSingleSelect"
        :disabled="disabled"
        class="answer-options"
      >
        <div
          v-for="(option, index) in question.options"
          :key="index"
          class="answer-option-wrapper"
          :class="{ 'selected': modelValue.includes(option) }"
        >
          <v-radio
            :label="option"
            :value="option"
            :color="getOptionColor(option)"
            class="answer-radio"
          >
            <template #label>
              <div class="answer-label">
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
              </div>
            </template>
          </v-radio>
        </div>
      </v-radio-group>
      
      <!-- Multiple Selection (Checkbox) -->
      <div v-else class="answer-options">
        <div
          v-for="(option, index) in question.options"
          :key="index"
          class="answer-option-wrapper"
          :class="{ 'selected': modelValue.includes(option) }"
        >
          <v-checkbox
            :model-value="modelValue.includes(option)"
            @update:model-value="handleMultiSelect(option, $event)"
            :disabled="disabled || (modelValue.length >= question.maxSelections && !modelValue.includes(option))"
            :color="getOptionColor(option)"
            class="answer-checkbox"
          >
            <template #label>
              <div class="answer-label">
                <span class="option-letter">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
              </div>
            </template>
          </v-checkbox>
        </div>
      </div>
      
      <!-- Correct Answer Feedback (for results view) -->
      <v-alert
        v-if="showCorrectAnswer && correctOptions"
        :type="isCorrect ? 'success' : 'error'"
        variant="tonal"
        prominent
        class="mt-5"
      >
        <template #prepend>
          <v-icon size="24">
            {{ isCorrect ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>
        <div v-if="isCorrect" class="text-subtitle-1 font-weight-medium">
          Correct!
        </div>
        <div v-else>
          <div class="text-subtitle-1 font-weight-medium mb-2">Incorrect</div>
          <div class="text-body-2">
            Correct answer(s): <strong>{{ correctOptions.join(', ') }}</strong>
          </div>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  question: {
    id: string
    questionText: string
    pointValue: number
    options: string[]
    maxSelections: number
    answerType?: string
  }
  modelValue: string[]
  questionNumber?: number
  totalQuestions?: number
  disabled?: boolean
  showCorrectAnswer?: boolean
  correctOptions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  questionNumber: 1,
  totalQuestions: 1,
  disabled: false,
  showCorrectAnswer: false,
  correctOptions: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const hasAnswer = computed(() => props.modelValue.length > 0)

const isTextAnswer = computed(() => {
  const type = props.question.answerType?.toLowerCase()
  return type === 'shortanswer' || type === 'workedsolution' ||
    (!props.question.options || props.question.options.length === 0 || 
     (props.question.options.length === 1 && props.question.options[0] === 'N/A'))
})

const isCorrect = computed(() => {
  if (!props.showCorrectAnswer || !props.correctOptions) return false
  if (props.modelValue.length !== props.correctOptions.length) return false
  return props.modelValue.every(opt => props.correctOptions.includes(opt))
})

function handleSingleSelect(value: string) {
  emit('update:modelValue', [value])
}

function handleTextAnswer(value: string) {
  emit('update:modelValue', value ? [value] : [])
}

function handleMultiSelect(option: string, checked: boolean) {
  let newValue = [...props.modelValue]
  
  if (checked) {
    if (newValue.length < props.question.maxSelections) {
      newValue.push(option)
    }
  } else {
    newValue = newValue.filter(v => v !== option)
  }
  
  emit('update:modelValue', newValue)
}

function getOptionColor(option: string) {
  if (!props.showCorrectAnswer) return 'primary'
  if (props.correctOptions.includes(option)) return 'success'
  if (props.modelValue.includes(option) && !props.correctOptions.includes(option)) return 'error'
  return 'primary'
}
</script>


<style scoped lang="scss">
.question-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  }
  
  &.question-answered {
    border-color: rgb(var(--v-theme-success));
    background: rgba(var(--v-theme-success), 0.02);
  }
}

.question-header {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  padding-bottom: 1rem;
}

.question-number-chip {
  font-weight: 600;
}

.question-text {
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.6;
  margin-top: 0.5rem;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answer-option-wrapper {
  border: 2px solid rgb(var(--v-theme-outline));
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  background: rgb(var(--v-theme-surface));
  
  &:hover {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.04);
    transform: translateX(4px);
  }
  
  &.selected {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.08);
    box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
  }
}

.answer-radio,
.answer-checkbox {
  width: 100%;
  
  :deep(.v-selection-control) {
    width: 100%;
  }
  
  :deep(.v-label) {
    width: 100%;
    opacity: 1 !important;
  }
}

.answer-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
}

.option-letter {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  min-width: 24px;
  font-size: 1rem;
}

.option-text {
  flex: 1;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  line-height: 1.5;
}

// Dark mode adjustments
:deep(.v-theme--dark) {
  .answer-option-wrapper {
    &:hover {
      background: rgba(var(--v-theme-primary), 0.08);
    }
    
    &.selected {
      background: rgba(var(--v-theme-primary), 0.12);
    }
  }
}
</style>
