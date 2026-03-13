<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      <slot name="toolbar-actions" />
    </v-toolbar>
    
    <v-card-text>
      <v-text-field
        v-model="searchQuery"
        label="Search"
        prepend-icon="mdi-magnify"
        clearable
        class="mb-4"
      />
      
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>
      
      <div v-else style="height: 600px;">
        <VirtualList
          :items="filteredItems"
          :item-size="itemHeight"
          :buffer="300"
          key-field="id"
        >
          <template #default="{ item }">
            <v-card class="mb-2 mx-1" elevation="1">
              <v-card-text class="d-flex align-center">
                <div class="flex-grow-1">
                  <slot name="item-content" :item="item">
                    <div v-for="header in contentHeaders" :key="header.key" class="mb-1">
                      <span class="font-weight-medium">{{ header.title }}:</span>
                      <slot :name="`item.${header.key}`" :item="item">
                        {{ item[header.key] }}
                      </slot>
                    </div>
                  </slot>
                </div>
                
                <div v-if="showActions" class="d-flex ml-4">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="emit('edit', item)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="emit('delete', item)"
                  />
                  
                  <v-menu v-if="customActions && customActions.length > 0">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        size="small"
                        variant="text"
                        v-bind="props"
                      />
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="action in customActions"
                        :key="action.name"
                        @click="emit('custom-action', action.name, item)"
                      >
                        <v-list-item-title>{{ action.label }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </VirtualList>
      </div>
      
      <div v-if="!loading && filteredItems.length === 0" class="text-center py-8">
        <p class="text-grey">No items found</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Header {
  title: string
  key: string
  sortable?: boolean
}

interface CustomAction {
  name: string
  label: string
}

interface Props {
  items: any[]
  headers: Header[]
  loading?: boolean
  showActions?: boolean
  customActions?: CustomAction[]
  title?: string
  itemHeight?: number
  searchFields?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showActions: true,
  customActions: () => [],
  title: '',
  itemHeight: 100,
  searchFields: () => []
})

const emit = defineEmits<{
  'edit': [item: any]
  'delete': [item: any]
  'custom-action': [actionName: string, item: any]
}>()

const searchQuery = ref('')

const contentHeaders = computed(() => {
  return props.headers.filter(h => h.key !== 'actions')
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  
  const query = searchQuery.value.toLowerCase()
  const fieldsToSearch = props.searchFields.length > 0 
    ? props.searchFields 
    : contentHeaders.value.map(h => h.key)
  
  return props.items.filter(item => {
    return fieldsToSearch.some(field => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(query)
    })
  })
})
</script>
