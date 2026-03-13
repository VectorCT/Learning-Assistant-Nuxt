<template>
  <v-container fluid class="admin-answers pa-6">
    <div class="mb-4">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        @click="$router.push('/admin/questions')"
      >
        Back to Questions
      </v-btn>
    </div>
    
    <v-card v-if="question" class="mb-6" elevation="2">
      <v-card-title class="pa-4 pb-2">
        <span class="text-h6 font-weight-bold">Question Details</span>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="mb-3">
          <span class="text-medium-emphasis text-body-2">Question:</span>
          <p class="text-body-1 mt-1">{{ question.questionText }}</p>
        </div>
        <v-row dense>
          <v-col cols="12" sm="4">
            <div class="text-medium-emphasis text-body-2">Points</div>
            <div class="text-body-1 font-weight-medium">{{ question.pointValue }}</div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="text-medium-emphasis text-body-2">Type</div>
            <div class="text-body-1 font-weight-medium">{{ getQuestionTypeName(question.questionTypeId) }}</div>
          </v-col>
          <v-col cols="12" sm="4" v-if="isMultipleChoice">
            <div class="text-medium-emphasis text-body-2">Max Selections</div>
            <div class="text-body-1 font-weight-medium">{{ question.maxSelections }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">Manage Answers</h2>
          <p class="text-body-2 text-medium-emphasis">Create and organize answer options</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showDialog = true; editingAnswer = null"
        >
          New Answer
        </v-btn>
      </div>
    </div>

    <v-card elevation="2">
      <AdminTable
        :items="answers"
        :headers="headers"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template v-slot:item.answerText="{ item }">
          <div class="text-truncate" style="max-width: 400px;">
            {{ item.answerText }}
          </div>
        </template>
        
        <template v-slot:item.isCorrect="{ item }">
          <v-chip
            :color="item.isCorrect ? 'success' : 'default'"
            size="small"
          >
            {{ item.isCorrect ? 'Correct' : 'Incorrect' }}
          </v-chip>
        </template>
      </AdminTable>
    </v-card>
    
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title class="pa-4 pb-2">
          <span class="text-h6 font-weight-bold">
            {{ editingAnswer ? 'Edit Answer' : 'New Answer' }}
          </span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form ref="formRef" v-model="formValid">
            <v-textarea
              v-model="form.answerText"
              label="Answer Text"
              :rules="[rules.required]"
              rows="3"
              required
            />
            
            <v-checkbox
              v-model="form.isCorrect"
              label="Is Correct Answer"
              color="success"
            />
            
            <v-text-field
              v-model.number="form.orderIndex"
              label="Order"
              type="number"
              :rules="[rules.required, rules.nonNegative]"
              required
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            @click="handleSave"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Answer"
      message="Are you sure you want to delete this answer? This action cannot be undone."
      danger
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  middleware: 'auth',
  requiresAdmin: true
})

const route = useRoute()
const answersStore = useAnswersStore()
const questionsStore = useQuestionsStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const questionId = route.params.id as string
const question = ref<any>(null)
const answers = ref<any[]>([])
const loading = ref(true)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingAnswer = ref<any>(null)
const deletingAnswer = ref<any>(null)
const formValid = ref(false)
const formRef = ref<any>(null)

const form = ref({
  answerText: '',
  isCorrect: false,
  orderIndex: 0,
  questionId: questionId
})

const questionTypes = [
  { id: '1', name: 'Multiple Choice' },
  { id: '2', name: 'True/False' }
]

const headers = [
  { title: 'Answer Text', key: 'answerText', sortable: true },
  { title: 'Correct', key: 'isCorrect', sortable: true },
  { title: 'Order', key: 'orderIndex', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const rules = {
  required: (v: any) => !!v || v === 0 || 'This field is required',
  nonNegative: (v: number) => v >= 0 || 'Must be 0 or greater'
}

const isMultipleChoice = computed(() => {
  return question.value?.questionTypeId === '1'
})

const isTrueFalse = computed(() => {
  return question.value?.questionTypeId === '2'
})

function getQuestionTypeName(typeId: string) {
  return questionTypes.find(t => t.id === typeId)?.name || 'Unknown'
}

onMounted(async () => {
  await Promise.all([
    loadQuestion(),
    loadAnswers()
  ])
})

async function loadQuestion() {
  try {
    question.value = await questionsStore.fetchById(questionId)
  } catch (err: any) {
    handleApiError(err, 'Failed to load question')
  }
}

async function loadAnswers() {
  loading.value = true
  try {
    answers.value = await answersStore.fetchByQuestion(questionId)
    // Sort by orderIndex
    answers.value.sort((a, b) => a.orderIndex - b.orderIndex)
  } catch (err: any) {
    handleApiError(err, 'Failed to load answers')
  } finally {
    loading.value = false
  }
}

function handleEdit(answer: any) {
  editingAnswer.value = answer
  form.value = {
    answerText: answer.answerText,
    isCorrect: answer.isCorrect,
    orderIndex: answer.orderIndex,
    questionId: questionId
  }
  showDialog.value = true
}

function handleDelete(answer: any) {
  deletingAnswer.value = answer
  showDeleteDialog.value = true
}

async function handleSave() {
  if (!formRef.value?.validate()) return
  
  try {
    const answerData = { ...form.value }
    
    if (editingAnswer.value) {
      await answersStore.updateAnswer(editingAnswer.value.id, answerData)
      handleSuccess('Answer updated successfully!')
    } else {
      // Determine question type for API call
      const questionType = isMultipleChoice.value ? 'multiple-choice' : 'true-false'
      await answersStore.createAnswer(answerData, questionType)
      handleSuccess('Answer created successfully!')
    }
    
    showDialog.value = false
    await loadAnswers()
    
    // Reset form
    form.value = {
      answerText: '',
      isCorrect: false,
      orderIndex: answers.value.length,
      questionId: questionId
    }
  } catch (err: any) {
    handleApiError(err, 'Failed to save answer')
  }
}

async function confirmDelete() {
  if (!deletingAnswer.value) return
  
  try {
    await answersStore.deleteAnswer(deletingAnswer.value.id)
    handleSuccess('Answer deleted successfully!')
    await loadAnswers()
  } catch (err: any) {
    handleApiError(err, 'Failed to delete answer')
  }
}
</script>

<style scoped>
.admin-answers {
  max-width: 1400px;
}
</style>
