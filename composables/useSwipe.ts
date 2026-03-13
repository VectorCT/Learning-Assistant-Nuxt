/**
 * Composable for handling swipe gestures on touch devices
 * Supports left, right, up, and down swipe detection
 */

export interface SwipeOptions {
  threshold?: number // Minimum distance in pixels to trigger swipe (default: 50)
  timeout?: number // Maximum time in ms for swipe gesture (default: 300)
  passive?: boolean // Use passive event listeners (default: true)
}

export interface SwipeState {
  isSwiping: Ref<boolean>
  direction: Ref<'left' | 'right' | 'up' | 'down' | null>
  lengthX: Ref<number>
  lengthY: Ref<number>
}

export function useSwipe(
  target: Ref<HTMLElement | null>,
  options: SwipeOptions = {}
): SwipeState {
  const {
    threshold = 50,
    timeout = 300,
    passive = true,
  } = options

  const isSwiping = ref(false)
  const direction = ref<'left' | 'right' | 'up' | 'down' | null>(null)
  const lengthX = ref(0)
  const lengthY = ref(0)

  let startX = 0
  let startY = 0
  let startTime = 0

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    isSwiping.value = true
    direction.value = null
    lengthX.value = 0
    lengthY.value = 0
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!isSwiping.value) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    lengthX.value = Math.abs(deltaX)
    lengthY.value = Math.abs(deltaY)

    // Determine direction based on larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction.value = deltaX > 0 ? 'right' : 'left'
    } else {
      direction.value = deltaY > 0 ? 'down' : 'up'
    }
  }

  const onTouchEnd = () => {
    const duration = Date.now() - startTime
    const isValidSwipe = 
      (lengthX.value >= threshold || lengthY.value >= threshold) &&
      duration <= timeout

    if (!isValidSwipe) {
      direction.value = null
    }

    isSwiping.value = false
  }

  const onTouchCancel = () => {
    isSwiping.value = false
    direction.value = null
    lengthX.value = 0
    lengthY.value = 0
  }

  // Set up event listeners
  onMounted(() => {
    const element = target.value
    if (!element) return

    const eventOptions = { passive }

    element.addEventListener('touchstart', onTouchStart, eventOptions)
    element.addEventListener('touchmove', onTouchMove, eventOptions)
    element.addEventListener('touchend', onTouchEnd, eventOptions)
    element.addEventListener('touchcancel', onTouchCancel, eventOptions)
  })

  // Clean up event listeners
  onUnmounted(() => {
    const element = target.value
    if (!element) return

    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove', onTouchMove)
    element.removeEventListener('touchend', onTouchEnd)
    element.removeEventListener('touchcancel', onTouchCancel)
  })

  return {
    isSwiping,
    direction,
    lengthX,
    lengthY,
  }
}
