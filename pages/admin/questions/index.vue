<template>
  <v-container fluid class="admin-questions pa-6">
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Manage Questions</h1>
          <p class="text-body-2 text-medium-emphasis">Build your question bank</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showDialog = true; editingQuestion = null"
        >
          New Question
        </v-btn>
      </div>
    </div>

    <v-card elevation="2">
      <LoadingSpinner 
        v-if="loading" 
        message="Loading questions..."
      />
      <VirtualAdminTable
        v-else
        :items="questions"
        :headers="headers"
        :loading="loading"
        :custom-actions="customActions"
        :item-height="120"
        :search-fields="['questionText', 'pointValue']"
        @edit="handleEdit"
        @delete="handleDelete"
        @custom-action="handleCustomAction"
      >
        <template v-slot:item.questionText="{ item }">
          <div class="text-truncate" style="max-width: 400px;">
            {{ item.questionText }}
          </div>
        </template>
      </VirtualAdminTable>
      <EmptyState
        v-if="!loading && questions.length === 0"
        icon="mdi-help-circle"
        title="No questions yet"
        description="Create your first question to build your question bank"
        action-text="Create Question"
        action-icon="mdi-plus"
        @action="showDialog = true; editingQuestion = null"
      />
    </v-card>
    
    <v-dialog v-model="showDialog" max-width="800">
      <QuestionEditor
        v-model="form"
        :question-types="questionTypes"
        :chapters="chapters"
        :mode="editingQuestion ? 'edit' : 'create'"
        @save="handleSave"
        @cancel="showDialog = false"
      />
    </v-dialog>
    
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Question"
      message="Are you sure you want to delete this question? This action cannot be undone."
      danger
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  requiresAdmin: true
})

const questionsStore = useQuestionsStore()
const chaptersStore = useChaptersStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const questions = ref<any[]>([])
const chapters = ref<any[]>([])
const loading = ref(true)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingQuestion = ref<any>(null)
const deletingQuestion = ref<any>(null)

const form = ref({
  questionText: '',
  pointValue: 1,
  chapterId: '',
  questionTypeId: '',
  options: ['', ''],
  maxSelections: 1
})

const questionTypes = ref([
  { id: '1', name: 'Multiple Choice' },
  { id: '2', name: 'True/False' }
])

const customActions = [
  { name: 'manage-answers', label: 'Manage Answers' }
]

const headers = [
  { title: 'Question', key: 'questionText', sortable: true },
  { title: 'Points', key: 'pointValue', sortable: true },
  { title: 'Type', key: 'questionTypeId' },
  { title: 'Actions', key: 'actions', sortable: false }
]

onMounted(async () => {
  await Promise.all([
    loadQuestions(),
    loadChapters()
  ])
})

async function loadQuestions() {
  loading.value = true
  try {
    // Load all questions - in production, add pagination
    const allChapters = await chaptersStore.fetchAll()
    const allQuestions: any[] = []
    
    for (const chapter of allChapters) {
      try {
        const chapterQuestions = await questionsStore.fetchByChapter(chapter.id)
        allQuestions.push(...chapterQuestions)
      } catch (err) {
        // Continue if a chapter fails
      }
    }
    
    questions.value = allQuestions
  } catch (err: any) {
    handleApiError(err, 'Failed to load questions')
  } finally {
    loading.value = false
  }
}

async function loadChapters() {
  try {
    chapters.value = await chaptersStore.fetchAll()
  } catch (err: any) {
    handleApiError(err, 'Failed to load chapters')
  }
}

function handleEdit(question: any) {
  editingQuestion.value = question
  form.value = { ...question }
  showDialog.value = true
}

function handleDelete(question: any) {
  deletingQuestion.value = question
  showDeleteDialog.value = true
}

function handleCustomAction(actionName: string, question: any) {
  if (actionName === 'manage-answers') {
    navigateTo(`/admin/questions/${question.id}/answers`)
  }
}

async function handleSave(questionData: any) {
  try {
    if (editingQuestion.value) {
      await questionsStore.updateQuestion(editingQuestion.value.id, questionData)
      handleSuccess('Question updated successfully!')
    } else {
      await questionsStore.createQuestion(questionData)
      handleSuccess('Question created successfully!')
    }
    
    showDialog.value = false
    await loadQuestions()
  } catch (err: any) {
    handleApiError(err, 'Failed to save question')
  }
}

async function confirmDelete() {
  if (!deletingQuestion.value) return
  
  try {
    await questionsStore.deleteQuestion(deletingQuestion.value.id)
    handleSuccess('Question deleted successfully!')
    await loadQuestions()
  } catch (err: any) {
    handleApiError(err, 'Failed to delete question')
  }
}
</script>

<style scoped>
.admin-questions {
  max-width: 1400px;
}
</style>
