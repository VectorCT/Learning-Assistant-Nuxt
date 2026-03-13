<template>
  <div class="section-editor">
    <v-card
      v-for="(section, index) in sections"
      :key="section.id || index"
      class="mb-3"
      :class="{ 'ml-8': depth > 0 }"
    >
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-2">
          <v-chip size="small" color="primary">
            Section {{ index + 1 }}
          </v-chip>
          <div>
            <v-btn
              icon="mdi-chevron-up"
              size="x-small"
              variant="text"
              :disabled="index === 0"
              @click="moveSection(index, -1)"
            />
            <v-btn
              icon="mdi-chevron-down"
              size="x-small"
              variant="text"
              :disabled="index === sections.length - 1"
              @click="moveSection(index, 1)"
            />
            <v-btn
              icon="mdi-delete"
              size="x-small"
              variant="text"
              color="error"
              @click="removeSection(index)"
            />
          </div>
        </div>
        
        <v-text-field
          v-model="section.title"
          label="Section Title"
          density="compact"
          class="mb-2"
        />
        
        <v-textarea
          v-model="section.content"
          label="Content"
          rows="3"
          density="compact"
          class="mb-2"
        />
        
        <v-text-field
          v-model="section.imageUrl"
          label="Image URL (optional)"
          density="compact"
          class="mb-2"
        />
        
        <v-divider class="my-2" />
        
        <div class="d-flex justify-space-between align-center">
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-plus"
            @click="addChildSection(index)"
          >
            Add Subsection
          </v-btn>
          
          <v-btn
            v-if="section.childSections && section.childSections.length > 0"
            size="small"
            variant="text"
            :prepend-icon="section.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="toggleExpand(section)"
          >
            {{ section.expanded ? 'Hide' : 'Show' }} Subsections ({{ section.childSections.length }})
          </v-btn>
        </div>
        
        <div v-if="section.childSections && section.childSections.length > 0 && section.expanded" class="mt-3">
          <SectionEditor
            v-model="section.childSections"
            :depth="depth + 1"
            @update:modelValue="section.childSections = $event"
          />
        </div>
      </v-card-text>
    </v-card>
    
    <v-alert v-if="sections.length === 0" type="info" variant="tonal" class="mb-3">
      No sections yet. Click "Add Section" to create one.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Section {
  id?: string
  title: string
  content: string
  imageUrl?: string
  orderIndex: number
  parentSectionId?: string | null
  childSections?: Section[]
  expanded?: boolean
}

interface Props {
  modelValue: Section[]
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})

const emit = defineEmits<{
  'update:modelValue': [sections: Section[]]
}>()

const sections = ref<Section[]>([...props.modelValue])

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  sections.value = [...newValue]
}, { deep: true })

// Emit changes
watch(sections, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

function addChildSection(parentIndex: number) {
  const parentSection = sections.value[parentIndex]
  
  if (!parentSection.childSections) {
    parentSection.childSections = []
  }
  
  parentSection.childSections.push({
    id: crypto.randomUUID(),
    title: '',
    content: '',
    imageUrl: '',
    orderIndex: parentSection.childSections.length,
    parentSectionId: parentSection.id || null,
    childSections: [],
    expanded: false
  })
  
  parentSection.expanded = true
}

function removeSection(index: number) {
  sections.value.splice(index, 1)
  // Update order indices
  sections.value.forEach((section, idx) => {
    section.orderIndex = idx
  })
}

function moveSection(index: number, direction: number) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= sections.value.length) return
  
  const temp = sections.value[index]
  sections.value[index] = sections.value[newIndex]
  sections.value[newIndex] = temp
  
  // Update order indices
  sections.value.forEach((section, idx) => {
    section.orderIndex = idx
  })
}

function toggleExpand(section: Section) {
  section.expanded = !section.expanded
}
</script>

<style scoped>
.section-editor {
  max-height: 500px;
  overflow-y: auto;
}
</style>
