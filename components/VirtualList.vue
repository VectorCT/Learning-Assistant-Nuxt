<template>
  <RecycleScroller
    :items="items"
    :item-size="itemSize"
    :buffer="buffer"
    :key-field="keyField"
    class="virtual-list"
    v-bind="$attrs"
  >
    <template #default="{ item, index }">
      <slot :item="item" :index="index" />
    </template>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'

interface Props {
  items: any[]
  itemSize?: number
  buffer?: number
  keyField?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemSize: 80,
  buffer: 200,
  keyField: 'id'
})
</script>

<style scoped>
.virtual-list {
  height: 100%;
}
</style>
