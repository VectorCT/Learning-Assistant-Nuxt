<template>
  <v-card>
    <v-card-title>
      {{ mode === 'create' ? 'Create Question' : 'Edit Question' }}
    </v-card-title>
    
    <v-card-text>
      <v-form ref="formRef" v-model="valid">
        <v-textarea
          v-model="localQuestion.questionText"
          label="Question Text"
          rows="3"
          :rules="[rules.required]"
          required
        />
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localQuestion.pointValue"
              label="Point Value"
              type="number"
              :rules="[rules.required, rules.positive]"
              required
            />
          </v-col>
          
          <v-col cols="12" md="6">
            <v-select
              v-model="localQuestion.questionTypeId"
              :items="questionTypes"
              item-title="name"
              item-value="id"
              label="Question Type"
              :rules="[rules.required]"
              required
            />
          </v-col>
        </v-row>
        
        <v-select
          v-model="localQuestion.chapterId"
          :items="chapters"
          item-title="title"
          item-value="id"
          label="Chapter"
          :rules="[rules.required]"
          required
        />
        
        <div v-if="isMultipleChoice">
          <v-text-field
            v-model.number="localQuestion.maxSelections"
            label="Max Selections"
            type="number"
            :rules="[rules.required, rules.positive, rules.maxSelectionsValid]"
            required
            hint="1 for single-select, >1 for multi-select"
          />
          
          <v-divider class="my-4" />
          
          <div class="d-flex justify-space-between align-center mb-2">
            <h4>Answer Options</h4>
            <v-btn
              size="small"
              prepend-icon="mdi-plus"
              @click="addOption"
            >
              Add Option
            </v-btn>
          </div>
          
          <v-row v-for="(option, index) in localQuestion.options" :key="index" class="mb-2">
            <v-col cols="10">
              <v-text-field
                v-model="localQuestion.options[index]"
                :label="`Option ${index + 1}`"
                :rules="[rules.required]"
                required
              />
            </v-col>
            <v-col cols="2" class="d-flex align-center">
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="removeOption(index)"
                :disabled="localQuestion.options.length <= 2"
              />
            </v-col>
          </v-row>
        </div>
      </v-form>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer />
      <v-btn @click="emit('cancel')">Cancel</v-btn>
      <v-btn
        color="primary"
        :disabled="!valid"
        @click="handleSave"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Question {
  id?: string
  questionText: string
  pointValue: number
  chapterId: string
  questionTypeId: string
  options: string[]
  maxSelections: number
}

interface Props {
  modelValue: Question
  questionTypes: any[]
  chapters?: any[]
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  chapters: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: Question]
  'save': [question: Question]
  'cancel': []
}>()

const formRef = ref()
const valid = ref(false)
const localQuestion = ref<Question>({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  localQuestion.value = { ...newVal }
}, { deep: true })

watch(localQuestion, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const isMultipleChoice = computed(() => {
  const type = props.questionTypes.find(t => t.id === localQuestion.value.questionTypeId)
  return type?.name?.toLowerCase().includes('multiple')
})

const rules = {
  required: (v: any) => !!v || 'This field is required',
  positive: (v: number) => v > 0 || 'Must be greater than 0',
  maxSelectionsValid: (v: number) => {
    if (!isMultipleChoice.value) return true
    return v <= localQuestion.value.options.length || 'Cannot exceed number of options'
  }
}

function addOption() {
  localQuestion.value.options.push('')
}

function removeOption(index: number) {
  if (localQuestion.value.options.length > 2) {
    localQuestion.value.options.splice(index, 1)
  }
}

function handleSave() {
  if (!valid.value) return
  emit('save', localQuestion.value)
}
</script>
