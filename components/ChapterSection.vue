<template>
  <div :class="['chapter-section', `depth-${depth}`]">
    <component
      :is="headingTag"
      class="section-title"
      @click="toggleExpand"
      style="cursor: pointer"
    >
      <v-icon v-if="hasChildren" size="small" class="mr-2">
        {{ isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      </v-icon>
      {{ section.title }}
    </component>
    
    <div v-show="isExpanded" class="section-body">
      <div v-if="section.imageUrl" class="section-image mb-4">
        <NuxtImg
          :src="section.imageUrl"
          :alt="section.title"
          width="600"
          preset="content"
          loading="lazy"
          placeholder
          class="mx-auto"
        />
      </div>
      
      <div
        v-if="section.content"
        class="section-content"
        v-html="sanitizedContent"
      />
      
      <div v-if="hasChildren" class="child-sections mt-4">
        <ChapterSection
          v-for="child in sortedChildren"
          :key="child.id"
          :section="child"
          :depth="depth + 1"
          :expand-all="expandAll"
          @section-click="emit('section-click', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { sanitizeHTML } from '~/utils/sanitize'

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
  section: ChapterSection
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

const isExpanded = ref(props.expandAll || props.depth === 0)

watch(() => props.expandAll, (newVal) => {
  isExpanded.value = newVal
})

const headingTag = computed(() => {
  const level = Math.min(props.depth + 1, 6)
  return `h${level}`
})

const hasChildren = computed(() => {
  return props.section.childSections && props.section.childSections.length > 0
})

const sortedChildren = computed(() => {
  if (!props.section.childSections) return []
  return [...props.section.childSections].sort((a, b) => a.orderIndex - b.orderIndex)
})

const sanitizedContent = computed(() => {
  return sanitizeHTML(props.section.content)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  emit('section-click', props.section.id)
}
</script>

<style scoped>
.chapter-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #1976D2;
}

.section-title:hover {
  color: #1565C0;
}

.depth-0 .section-title {
  font-size: 1.75rem;
  font-weight: 500;
}

.depth-1 .section-title {
  font-size: 1.5rem;
  font-weight: 500;
}

.depth-2 .section-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.section-body {
  padding-left: 1rem;
}

.section-content {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.section-content :deep(p) {
  margin-bottom: 1rem;
}

.section-content :deep(ul),
.section-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.section-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.child-sections {
  border-left: 2px solid #e0e0e0;
  padding-left: 1rem;
}
</style>
