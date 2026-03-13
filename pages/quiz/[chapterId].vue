<template>
  <v-container fluid class="fill-height">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <QuizRunner
          :chapter-id="chapterId"
          @quiz-complete="handleQuizComplete"
          @quiz-exit="handleQuizExit"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const chapterId = route.params.chapterId as string

function handleQuizComplete(result: any) {
  console.log('Quiz completed:', result)
}

function handleQuizExit() {
  router.push(`/chapters/${chapterId}`)
}

definePageMeta({
  layout: 'fullscreen'
})
</script>
