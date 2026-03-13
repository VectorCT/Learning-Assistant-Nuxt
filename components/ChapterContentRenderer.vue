<template>
  <div class="chapter-content">
    <div v-if="sections && sections.length > 0">
      <ChapterSection
        v-for="section in sortedSections"
        :key="section.id"
        :section="section"
        :depth="depth"
        :expand-all="expandAll"
        @section-click="emit('section-click', $event)"
      />
    </div>
    <div v-else class="text-center py-8 text-grey">
      No content available
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ChapterSection {
  id: string
  title: string
  content: string
  imageUrl?: string
  orderIndex: number
  parentSectionId?: string | null
  childSections?: ChapterSection[]
}

interface Props {
  sections: ChapterSection[]
  depth?: number
  expandAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  expandAll: false
})

const emit = defineEmits<{
  'section-click': [sectionId: string]
}>()

const sortedSections = computed(() => {
  if (!props.sections) return []
  return [...props.sections].sort((a, b) => a.orderIndex - b.orderIndex)
})
</script>

<style scoped>
.chapter-content {
  max-width: 900px;
  margin: 0 auto;
}
</style>
