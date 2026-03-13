<template>
  <v-card class="admin-table-card" elevation="0" rounded="lg">
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-per-page="itemsPerPage"
      class="admin-table"
      hover
      @update:page="emit('page-change', $event)"
    >
      <template v-slot:top>
        <v-toolbar flat color="transparent" class="px-6 py-3">
          <v-toolbar-title class="text-h5 font-weight-bold text-primary">
            {{ title }}
          </v-toolbar-title>
          <v-spacer />
          <slot name="toolbar-actions" />
        </v-toolbar>
        <v-divider class="border-opacity-100" />
      </template>
      
      <template v-slot:item.actions="{ item }" v-if="showActions">
        <div class="action-buttons d-flex ga-2 justify-end">
          <v-tooltip text="Edit" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="flat"
                color="primary"
                class="action-btn action-btn-edit"
                v-bind="props"
                @click="emit('edit', item)"
              />
            </template>
          </v-tooltip>
          
          <v-tooltip text="Delete" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="flat"
                color="error"
                class="action-btn action-btn-delete"
                v-bind="props"
                @click="handleDeleteClick(item)"
              />
            </template>
          </v-tooltip>
          
          <v-menu v-if="customActions && customActions.length > 0" location="bottom end">
            <template v-slot:activator="{ props }">
              <v-tooltip text="More actions" location="top">
                <template v-slot:activator="{ props: tooltipProps }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="flat"
                    class="action-btn action-btn-more"
                    v-bind="{ ...props, ...tooltipProps }"
                  />
                </template>
              </v-tooltip>
            </template>
            <v-list density="comfortable" class="custom-actions-menu" elevation="8" rounded="lg">
              <v-list-item
                v-for="action in customActions"
                :key="action.name"
                :prepend-icon="action.icon"
                :class="{ 'text-error': action.destructive }"
                class="custom-action-item"
                @click="handleCustomAction(action, item)"
              >
                <v-list-item-title class="font-weight-medium">{{ action.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      
      <template v-slot:loading>
        <v-skeleton-loader type="table-row@10" />
      </template>
      
      <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </v-data-table>
    
    <!-- Confirmation Dialog for Destructive Actions -->
    <v-dialog v-model="showDeleteDialog" max-width="500" persistent>
      <v-card rounded="xl" elevation="24" class="confirmation-dialog">
        <v-card-title class="text-h5 font-weight-bold d-flex align-center pa-6 pb-4">
          <v-avatar color="error" size="48" class="mr-4">
            <v-icon icon="mdi-alert-circle-outline" size="28" />
          </v-avatar>
          <span class="text-error">Confirm Deletion</span>
        </v-card-title>
        
        <v-divider class="border-opacity-100" />
        
        <v-card-text class="pa-6 text-body-1">
          {{ deleteConfirmMessage || 'Are you sure you want to delete this item? This action cannot be undone.' }}
        </v-card-text>
        
        <v-divider class="border-opacity-100" />
        
        <v-card-actions class="pa-6 pt-4">
          <v-spacer />
          <v-btn
            variant="text"
            size="large"
            class="px-6"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            size="large"
            class="px-6 ml-2"
            prepend-icon="mdi-delete"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Confirmation Dialog for Custom Destructive Actions -->
    <v-dialog v-model="showCustomActionDialog" max-width="500" persistent>
      <v-card rounded="xl" elevation="24" class="confirmation-dialog">
        <v-card-title class="text-h5 font-weight-bold d-flex align-center pa-6 pb-4">
          <v-avatar 
            :color="pendingAction?.destructive ? 'error' : 'primary'" 
            size="48" 
            class="mr-4"
          >
            <v-icon 
              :icon="pendingAction?.destructive ? 'mdi-alert-circle-outline' : (pendingAction?.icon || 'mdi-help-circle-outline')" 
              size="28" 
            />
          </v-avatar>
          <span :class="pendingAction?.destructive ? 'text-error' : 'text-primary'">
            Confirm Action
          </span>
        </v-card-title>
        
        <v-divider class="border-opacity-100" />
        
        <v-card-text class="pa-6 text-body-1">
          {{ pendingAction?.confirmMessage || `Are you sure you want to ${pendingAction?.label?.toLowerCase()}?` }}
        </v-card-text>
        
        <v-divider class="border-opacity-100" />
        
        <v-card-actions class="pa-6 pt-4">
          <v-spacer />
          <v-btn
            variant="text"
            size="large"
            class="px-6"
            @click="showCustomActionDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            :color="pendingAction?.destructive ? 'error' : 'primary'"
            variant="flat"
            size="large"
            class="px-6 ml-2"
            :prepend-icon="pendingAction?.icon"
            @click="confirmCustomAction"
          >
            {{ pendingAction?.label || 'Confirm' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Header {
  title: string
  key: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
}

interface CustomAction {
  name: string
  label: string
  icon?: string
  destructive?: boolean
  confirmMessage?: string
}

interface Props {
  items: any[]
  headers: Header[]
  loading?: boolean
  itemsPerPage?: number
  showActions?: boolean
  customActions?: CustomAction[]
  title?: string
  deleteConfirmMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  itemsPerPage: 10,
  showActions: true,
  customActions: () => [],
  title: '',
  deleteConfirmMessage: ''
})

const emit = defineEmits<{
  'edit': [item: any]
  'delete': [item: any]
  'custom-action': [actionName: string, item: any]
  'page-change': [page: number]
}>()

// Delete confirmation dialog state
const showDeleteDialog = ref(false)
const itemToDelete = ref<any>(null)

// Custom action confirmation dialog state
const showCustomActionDialog = ref(false)
const pendingAction = ref<CustomAction | null>(null)
const pendingActionItem = ref<any>(null)

function handleDeleteClick(item: any) {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

function confirmDelete() {
  if (itemToDelete.value) {
    emit('delete', itemToDelete.value)
    itemToDelete.value = null
  }
  showDeleteDialog.value = false
}

function handleCustomAction(action: CustomAction, item: any) {
  // If action requires confirmation (destructive or has confirmMessage), show dialog
  if (action.destructive || action.confirmMessage) {
    pendingAction.value = action
    pendingActionItem.value = item
    showCustomActionDialog.value = true
  } else {
    // Otherwise, emit immediately
    emit('custom-action', action.name, item)
  }
}

function confirmCustomAction() {
  if (pendingAction.value && pendingActionItem.value) {
    emit('custom-action', pendingAction.value.name, pendingActionItem.value)
    pendingAction.value = null
    pendingActionItem.value = null
  }
  showCustomActionDialog.value = false
}
</script>


<style scoped lang="scss">
.admin-table-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  :deep(.v-toolbar) {
    background: transparent;
  }
  
  :deep(.v-data-table) {
    background: transparent;
  }
  
  :deep(.v-data-table-header) {
    background-color: rgba(var(--v-theme-surface-variant), 0.4);
    
    th {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.8px;
      color: rgb(var(--v-theme-on-surface-variant));
      padding: 14px 16px;
      white-space: nowrap;
    }
  }
  
  :deep(.v-data-table__tr) {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.04);
    }
  }
  
  :deep(.v-data-table__td) {
    padding: 14px 16px;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
  }
  
  :deep(.v-data-table-footer) {
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
    padding: 8px 16px;
  }
}

.action-buttons {
  .action-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .action-btn-edit {
    &:hover {
      box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
    }
  }
  
  .action-btn-delete {
    &:hover {
      box-shadow: 0 4px 12px rgba(var(--v-theme-error), 0.3);
    }
  }
  
  .action-btn-more {
    color: rgb(var(--v-theme-on-surface-variant));
    
    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.08);
    }
  }
}

.custom-actions-menu {
  border-radius: 12px;
  overflow: hidden;
  min-width: 180px;
  
  .custom-action-item {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.06);
    }
    
    &.text-error:hover {
      background-color: rgba(var(--v-theme-error), 0.06);
    }
  }
}

.confirmation-dialog {
  overflow: hidden;
  
  :deep(.v-card-title) {
    line-height: 1.4;
  }
  
  :deep(.v-card-text) {
    color: rgb(var(--v-theme-on-surface-variant));
    line-height: 1.6;
  }
}
</style>
