# Manual Testing Guide for Virtual Scrolling

## Prerequisites
- Application is running (`npm run dev`)
- Backend API is accessible (or mock data is available)

## Test 1: Forum List Virtual Scrolling

### Steps:
1. Navigate to `/forums`
2. Observe the forum list rendering
3. Scroll through the list
4. Open browser DevTools > Elements
5. Inspect the DOM structure

### Expected Results:
- ✅ Forum list renders immediately
- ✅ Only ~10-15 forum cards visible in DOM at any time
- ✅ Smooth scrolling with no lag
- ✅ Cards appear/disappear as you scroll
- ✅ Search functionality works correctly

### Performance Indicators:
- DOM nodes: ~15-20 (not 100+ for large lists)
- Scroll FPS: 60 FPS
- Memory usage: Constant regardless of total items

## Test 2: Admin Questions Virtual Scrolling

### Steps:
1. Login as admin
2. Navigate to `/admin/questions`
3. Observe the question list rendering
4. Scroll through the list
5. Test search functionality
6. Click edit/delete buttons

### Expected Results:
- ✅ Question list renders immediately
- ✅ Only visible questions in DOM
- ✅ Smooth scrolling
- ✅ Search filters correctly
- ✅ Action buttons work (edit, delete, manage answers)

## Test 3: Performance Test Page (1000+ Items)

### Steps:
1. Navigate to `/test-virtual-scroll`
2. Set item count to 1000
3. Click "Generate Items"
4. Switch between "Forum List" and "Question List" tabs
5. Scroll rapidly through the lists
6. Increase to 5000 items and repeat
7. Try 10,000 items

### Expected Results:
- ✅ 1000 items: Instant render, smooth scroll
- ✅ 5000 items: Fast render (<1s), smooth scroll
- ✅ 10,000 items: Renders in 1-2s, maintains smooth scroll
- ✅ No browser freezing or lag
- ✅ Memory usage stays constant

### Performance Benchmarks:

| Item Count | Render Time | Scroll FPS | DOM Nodes |
|-----------|-------------|------------|-----------|
| 1,000     | <500ms      | 60 FPS     | ~15       |
| 5,000     | <1s         | 60 FPS     | ~15       |
| 10,000    | 1-2s        | 60 FPS     | ~15       |

## Test 4: Search Functionality

### Steps:
1. On test page with 1000+ items
2. Use browser DevTools Performance tab
3. Start recording
4. Scroll through list
5. Stop recording
6. Analyze frame rate

### Expected Results:
- ✅ Consistent 60 FPS during scroll
- ✅ No long tasks (>50ms)
- ✅ Minimal layout thrashing

## Test 5: Edge Cases

### Test 5a: Empty List
1. Navigate to forums with no data
2. Expected: "No forums found" message displays

### Test 5b: Single Item
1. Test with only 1 item
2. Expected: Renders correctly without errors

### Test 5c: Rapid Scrolling
1. Scroll very fast from top to bottom
2. Expected: No blank spaces, items render smoothly

### Test 5d: Browser Resize
1. Resize browser window while scrolling
2. Expected: List adjusts correctly, no layout issues

## Test 6: Comparison Test (Before/After)

### Without Virtual Scrolling (Old AdminTable):
1. Navigate to `/admin/subjects` or `/admin/chapters`
2. Note render time and scroll performance
3. Check DOM node count

### With Virtual Scrolling (New VirtualAdminTable):
1. Navigate to `/admin/questions`
2. Compare render time and scroll performance
3. Compare DOM node count

### Expected Improvements:
- ✅ 80-90% faster initial render
- ✅ 90-95% fewer DOM nodes
- ✅ Smoother scrolling
- ✅ Lower memory usage

## Troubleshooting

### Issue: Items not rendering
**Check:**
- Container has fixed height
- Items array is not empty
- Console for errors

### Issue: Laggy scrolling
**Check:**
- Item templates are simple
- No heavy computations in templates
- Buffer size is reasonable (200-400px)

### Issue: Items jumping
**Check:**
- item-size matches actual rendered height
- No dynamic height changes
- CSS not affecting item height

## Browser Compatibility

Test in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

## Mobile Testing (Optional)

If testing on mobile:
1. Use responsive mode in DevTools
2. Test touch scrolling
3. Verify performance on slower devices

## Success Criteria

All tests pass if:
- ✅ Virtual scrolling works on forums page
- ✅ Virtual scrolling works on admin questions page
- ✅ Test page handles 10,000+ items smoothly
- ✅ Search functionality works correctly
- ✅ Action buttons work correctly
- ✅ No console errors
- ✅ Performance improvements are measurable

## Notes

- Virtual scrolling requires fixed height containers
- Item heights must be consistent or use DynamicScroller
- Buffer size affects pre-rendering (300px = ~2-3 items)
- Performance gains are most noticeable with 500+ items
