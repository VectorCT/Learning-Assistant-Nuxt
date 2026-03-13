# Virtual Scrolling Implementation

## Overview

Virtual scrolling has been implemented for large lists in the SA Learner Assistant Frontend to optimize performance when rendering 1000+ items. This implementation uses `vue-virtual-scroller` to render only visible items plus a buffer, significantly reducing DOM nodes and improving scroll performance.

## Components

### 1. VirtualList Component (`components/VirtualList.vue`)

A reusable wrapper around `RecycleScroller` from vue-virtual-scroller.

**Props:**
- `items` (Array): The list of items to render
- `itemSize` (Number, default: 80): Height of each item in pixels
- `buffer` (Number, default: 200): Buffer size in pixels for pre-rendering items
- `keyField` (String, default: 'id'): Field to use as unique key

**Usage:**
```vue
<VirtualList
  :items="myItems"
  :item-size="120"
  :buffer="300"
  key-field="id"
>
  <template #default="{ item, index }">
    <!-- Your item template -->
  </template>
</VirtualList>
```

### 2. VirtualAdminTable Component (`components/VirtualAdminTable.vue`)

A virtualized version of AdminTable for managing large datasets in admin pages.

**Features:**
- Virtual scrolling for large item lists
- Built-in search functionality
- Customizable item height
- Action buttons (edit, delete, custom actions)
- Slot support for custom item rendering

**Props:**
- `items` (Array): Items to display
- `headers` (Array): Column headers
- `loading` (Boolean): Loading state
- `showActions` (Boolean, default: true): Show action buttons
- `customActions` (Array): Custom action buttons
- `title` (String): Table title
- `itemHeight` (Number, default: 100): Height of each item
- `searchFields` (Array): Fields to search in

**Usage:**
```vue
<VirtualAdminTable
  :items="questions"
  :headers="headers"
  :item-height="120"
  :search-fields="['questionText', 'pointValue']"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

## Implementation Details

### Configuration

**Item Heights:**
- Forum list items: 120px
- Question list items: 100px (admin), 120px (test page)
- Buffer size: 300px (renders ~2-3 extra items above/below viewport)

**Why these values?**
- Item heights match the actual rendered card heights
- Buffer size of 300px provides smooth scrolling without lag
- These values balance performance and user experience

### Performance Benefits

**Without Virtual Scrolling:**
- 1000 items = 1000 DOM nodes
- High memory usage
- Slow initial render
- Laggy scrolling

**With Virtual Scrolling:**
- 1000 items = ~10-15 visible DOM nodes + buffer
- Constant memory usage
- Fast initial render
- Smooth scrolling

### Memory Usage Comparison

| Item Count | Without Virtual Scroll | With Virtual Scroll |
|-----------|----------------------|-------------------|
| 100       | ~100 DOM nodes       | ~15 DOM nodes     |
| 1,000     | ~1,000 DOM nodes     | ~15 DOM nodes     |
| 10,000    | ~10,000 DOM nodes    | ~15 DOM nodes     |

## Pages Updated

### 1. Forums Index (`pages/forums/index.vue`)

Updated to use VirtualList for rendering forum threads.

**Changes:**
- Replaced v-row/v-col loop with VirtualList
- Set item-size to 120px (matches card height)
- Set buffer to 300px for smooth scrolling
- Wrapped in fixed height container (600px)

### 2. Admin Questions (`pages/admin/questions/index.vue`)

Updated to use VirtualAdminTable for managing questions.

**Changes:**
- Replaced AdminTable with VirtualAdminTable
- Set item-height to 120px
- Added search-fields for filtering
- Maintains all existing functionality (edit, delete, custom actions)

## Testing

### Test Page (`pages/test-virtual-scroll.vue`)

A dedicated test page for performance testing with configurable item counts.

**Features:**
- Generate 100 to 10,000 items
- Toggle between forum and question list views
- Real-time performance comparison
- Visual feedback on item count

**Access:** Navigate to `/test-virtual-scroll`

**Test Scenarios:**
1. Generate 1,000 items - should render instantly
2. Generate 5,000 items - should still be smooth
3. Generate 10,000 items - should maintain performance
4. Scroll rapidly - should not lag or stutter

## Installation

The following package was added:

```bash
npm install vue-virtual-scroller@next
```

## Plugin Configuration

A Nuxt plugin was created to register vue-virtual-scroller globally:

**File:** `plugins/vue-virtual-scroller.ts`

```typescript
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueVirtualScroller)
})
```

## Best Practices

### 1. Fixed Item Heights

Virtual scrolling works best with fixed item heights. If your items have variable heights, consider:
- Using the largest expected height
- Using DynamicScroller instead of RecycleScroller
- Normalizing item content to fit fixed heights

### 2. Buffer Size

The buffer size determines how many items are pre-rendered outside the viewport:
- Too small: Items may pop in during fast scrolling
- Too large: Defeats the purpose of virtual scrolling
- Recommended: 200-400px (2-4 items worth)

### 3. Key Field

Always provide a unique key field for proper item tracking:
```vue
<VirtualList key-field="id" :items="items" />
```

### 4. Container Height

Virtual scrolling requires a fixed height container:
```vue
<div style="height: 600px;">
  <VirtualList :items="items" />
</div>
```

## Troubleshooting

### Items Not Rendering

**Problem:** Items don't appear or list is blank

**Solutions:**
- Ensure container has a fixed height
- Check that items array is not empty
- Verify item-size matches actual item height
- Check console for errors

### Scroll Performance Issues

**Problem:** Scrolling is still laggy

**Solutions:**
- Reduce buffer size
- Simplify item templates (remove heavy computations)
- Use v-once for static content
- Avoid complex CSS animations in items

### Items Jumping During Scroll

**Problem:** Items jump or flicker while scrolling

**Solutions:**
- Ensure item-size exactly matches rendered height
- Use fixed heights, avoid dynamic content
- Check for CSS that affects item height

## Future Enhancements

1. **Dynamic Item Heights:** Implement DynamicScroller for variable height items
2. **Infinite Scroll:** Add pagination with infinite scroll
3. **Sticky Headers:** Add section headers that stick during scroll
4. **Horizontal Scrolling:** Support horizontal virtual scrolling
5. **Grid Layout:** Implement virtual scrolling for grid layouts

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 2.7:** Performance optimization for practice question lists
- **Requirement 4.1:** Performance optimization for forum thread lists

## Performance Metrics

Expected performance improvements:

- **Initial Render:** 80-90% faster for 1000+ items
- **Memory Usage:** 90-95% reduction in DOM nodes
- **Scroll FPS:** Maintains 60 FPS even with 10,000+ items
- **Time to Interactive:** 70-80% faster

## References

- [vue-virtual-scroller Documentation](https://github.com/Akryum/vue-virtual-scroller)
- [Virtual Scrolling Best Practices](https://web.dev/virtualize-long-lists-react-window/)
