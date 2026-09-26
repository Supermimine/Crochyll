<script setup lang="ts">
import { useScreen } from '@/tools/appTools';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { isMobile } = useScreen();
const { t } = useI18n();

const props = defineProps<{
    id: number,
    isActive: boolean,
    modelValue?: string[]
}>()

const emit = defineEmits(['update:modelValue'])

const gridSize = ref<number>(25)
const selectedColor = ref<string>('#000000')
const isDrawing = ref<boolean>(false)
const lockDrawing = ref<boolean>(false)

const enum Action {
    Brush = 0,
    Eraser = 1,
    Fill = 2,
}

const selectedAction = ref<Action>(Action.Brush)

const undoStack = ref<string[][]>([])
const redoStack = ref<string[][]>([])
const hasStateSavedInCurrentStroke = ref<boolean>(false)
const pixels = ref<string[]>([])
const gridContainerRef = ref<HTMLElement | null>(null)

const lastTouchedIndex = ref<number | null>(null)
let touchFrameId: number | null = null

let isInitialLoad = true

const gridStyle = computed(() => {
    const sizeInPx = `${gridSize.value * 14 + (gridSize.value - 1)}px`

    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize.value}, 14px)`,
        gridTemplateRows: `repeat(${gridSize.value}, 14px)`,
        gap: '1px',
        width: sizeInPx,
        height: sizeInPx,
        cursor: 'crosshair',
        userSelect: 'none' as const,
        touchAction: 'none'
    }
})

const initializeGrid = (): void => {
    const totalPixels = gridSize.value * gridSize.value
    pixels.value = Array(totalPixels).fill('#FFFFFF')
    undoStack.value = []
    redoStack.value = []
    hasStateSavedInCurrentStroke.value = false
    syncWithParent()
}

const syncWithParent = () => {
    emit('update:modelValue', [...pixels.value])
}

const saveState = (): void => {
    undoStack.value.push([...pixels.value])
    redoStack.value = []
}

const undo = (): void => {
    if (undoStack.value.length === 0 || lockDrawing.value) return

    redoStack.value.push([...pixels.value])
    pixels.value = undoStack.value.pop()!
    syncWithParent()
}

const redo = (): void => {
    if (redoStack.value.length === 0 || lockDrawing.value) return

    undoStack.value.push([...pixels.value])
    pixels.value = redoStack.value.pop()!
    syncWithParent()
}

const handleKeyDown = (event: KeyboardEvent): void => {
    if (props.isActive) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault()
            undo()
        } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
            event.preventDefault()
            redo()
        }
    }
}

const colorPixel = (index: number): void => {
    if (index < 0 || index >= pixels.value.length || lockDrawing.value) return

    if (!hasStateSavedInCurrentStroke.value && selectedAction.value !== Action.Fill) {
        saveState()
        hasStateSavedInCurrentStroke.value = true
    }

    switch (selectedAction.value) {
        case Action.Brush:
            pixels.value[index] = selectedColor.value
            break
        case Action.Eraser:
            pixels.value[index] = '#FFFFFF'
            break
        case Action.Fill:
            floodFill(index)
            break
    }
}

const floodFill = (startIndex: number): void => {
    const targetColor = pixels.value[startIndex]
    const fillColor = selectedColor.value

    if (targetColor === fillColor) return

    saveState()
    hasStateSavedInCurrentStroke.value = true

    const visited = new Set<number>()
    const queue: number[] = [startIndex]

    while (queue.length > 0) {
        const index = queue.shift()!

        if (visited.has(index)) continue
        visited.add(index)

        if (pixels.value[index] !== targetColor) continue

        pixels.value[index] = fillColor

        const row = Math.floor(index / gridSize.value)
        const col = index % gridSize.value

        if (col > 0) {
            const leftIndex = index - 1
            if (!visited.has(leftIndex)) queue.push(leftIndex)
        }

        if (col < gridSize.value - 1) {
            const rightIndex = index + 1
            if (!visited.has(rightIndex)) queue.push(rightIndex)
        }

        if (row > 0) {
            const topIndex = index - gridSize.value
            if (!visited.has(topIndex)) queue.push(topIndex)
        }

        if (row < gridSize.value - 1) {
            const bottomIndex = index + gridSize.value
            if (!visited.has(bottomIndex)) queue.push(bottomIndex)
        }
    }
    syncWithParent()
}

const drawOnHover = (index: number): void => {
    if (isDrawing.value) {
        colorPixel(index)
    }
}

const startDrawing = (): void => {
    if (lockDrawing.value) return
    isDrawing.value = true
}

const stopDrawing = (): void => {
    if (isDrawing.value) {
        syncWithParent()
    }
    isDrawing.value = false
    hasStateSavedInCurrentStroke.value = false
    lastTouchedIndex.value = null
    if (touchFrameId) {
        cancelAnimationFrame(touchFrameId)
        touchFrameId = null
    }
}

const handleTouchStart = (event: TouchEvent): void => {
    if (lockDrawing.value) return
    
    const touch = event.touches[0]
    if (!touch || !gridContainerRef.value) return

    if (event.cancelable) event.preventDefault()
    startDrawing()

    const rect = gridContainerRef.value.getBoundingClientRect()
    
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const col = Math.floor(x / 15)
    const row = Math.floor(y / 15)

    if (col >= 0 && col < gridSize.value && row >= 0 && row < gridSize.value) {
        const index = row * gridSize.value + col
        lastTouchedIndex.value = index
        colorPixel(index)
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false })
}

const handleTouchMove = (event: TouchEvent): void => {
    if (!isDrawing.value || !gridContainerRef.value) return
    if (event.cancelable) event.preventDefault()

    const touch = event.touches[0]
    if (!touch) return

    if (touchFrameId) cancelAnimationFrame(touchFrameId)

    touchFrameId = requestAnimationFrame(() => {
        if (!gridContainerRef.value) return
        const rect = gridContainerRef.value.getBoundingClientRect()
        
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top

        const col = Math.floor(x / 15)
        const row = Math.floor(y / 15)

        if (col >= 0 && col < gridSize.value && row >= 0 && row < gridSize.value) {
            const index = row * gridSize.value + col

            if (index !== lastTouchedIndex.value) {
                lastTouchedIndex.value = index
                colorPixel(index)
            }
        }
    })
}

const handleTouchEnd = (event: TouchEvent): void => {
    stopDrawing()
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('touchcancel', handleTouchEnd)
}

const switchAction = (action: Action): void => {
    selectedAction.value = action
}

onMounted(() => {
    if (props.modelValue && props.modelValue.length > 0) {
        pixels.value = [...props.modelValue]
        gridSize.value = Math.sqrt(props.modelValue.length)
    } else {
        initializeGrid()
    }
    
    if (gridContainerRef.value) {
        gridContainerRef.value.addEventListener('touchstart', handleTouchStart, { passive: false })
    }
    
    isInitialLoad = false
    window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    if (gridContainerRef.value) {
        gridContainerRef.value.removeEventListener('touchstart', handleTouchStart)
    }
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('touchcancel', handleTouchEnd)
})

watch(gridSize, (newSize, oldSize) => {
    if (!isInitialLoad && newSize !== oldSize) {
        initializeGrid()
    }
})
</script>

<template>
    <div class="pixel-art-widget-wrapper d-flex flex-column justify-space-between pa-3">
        <div class="text-subtitle-1 font-weight-bold text-center header-block">
            {{ t('tools.tool.pixelArt') }}
        </div>

        <div class="d-flex align-stretch justify-space-around flex-grow-1 w-100 main-content-row"
            :class="isMobile ? 'flex-column-reverse' : ''">
            <div class="controls-sidebar d-flex flex-column align-center justify-space-between py-4"
                :class="isMobile ? 'w-100 max-w-none' : 'py-10'">
                <div class="picker-container" @mousedown.stop @touchstart.stop>
                    <v-color-picker v-model="selectedColor" hide-inputs elevation="0" mode="hex"
                        width="200"></v-color-picker>
                </div>

                <div class="tools-actions-block w-100 d-flex flex-column gap-1 align-center" @mousedown.stop
                    @touchstart.stop>
                    <v-text-field v-model.number="gridSize" :label="t('tools.pixelArt.gridSize')" variant="outlined"
                        density="compact" hide-details type="number" class="w-100 size-input"></v-text-field>

                    <div class="d-flex justify-center my-1 action-icons-row">
                        <v-btn :variant="selectedAction === Action.Brush ? 'flat' : 'text'" size="small" icon
                            @click="switchAction(Action.Brush)"
                            :style="selectedAction === Action.Brush ? { color: 'var(--action-color)' } : {}">
                            <v-icon icon="mdi-brush" size="20"></v-icon>
                        </v-btn>
                        <v-btn :variant="selectedAction === Action.Eraser ? 'flat' : 'text'" size="small" icon
                            @click="switchAction(Action.Eraser)"
                            :style="selectedAction === Action.Eraser ? { color: 'var(--action-color)' } : {}">
                            <v-icon icon="mdi-eraser" size="20"></v-icon>
                        </v-btn>
                        <v-btn :variant="selectedAction === Action.Fill ? 'flat' : 'text'" size="small" icon
                            @click="switchAction(Action.Fill)"
                            :style="selectedAction === Action.Fill ? { color: 'var(--action-color)' } : {}">
                            <v-icon icon="mdi-format-color-fill" size="20"></v-icon>
                        </v-btn>
                    </div>

                    <div class="d-flex gap-2 justify-center mb-1">
                        <v-btn variant="tonal" size="x-small" icon :disabled="undoStack.length === 0" @click="undo"
                            title="Ctrl+Z">
                            <v-icon icon="mdi-undo" size="14"></v-icon>
                        </v-btn>
                        <v-btn variant="tonal" size="x-small" icon :disabled="redoStack.length === 0" @click="redo"
                            title="Ctrl+Y">
                            <v-icon icon="mdi-redo" size="14"></v-icon>
                        </v-btn>
                    </div>

                    <v-btn color="error" prepend-icon="mdi-delete" variant="flat" size="small" @click="initializeGrid"
                        class="buttonColor w-100 delete-btn">
                        {{ t('tools.pixelArt.clean') }}
                    </v-btn>
                </div>
            </div>

            <div class="canvas-area d-flex align-center justify-center">
                <div class="grid-wrapper">
                    <div ref="gridContainerRef" class="grid-container pa-0 rounded shadow-inner"
                        :style="[gridStyle, { '--grid-size': gridSize }]" @mousedown="startDrawing"
                        @mouseup="stopDrawing" @mouseleave="stopDrawing" @mousedown.stop>

                        <div v-for="(color, index) in pixels" :key="index" class="pixel" :data-index="index"
                            :style="{ backgroundColor: color }" @mousedown.prevent="colorPixel(index)"
                            @mouseover="drawOnHover(index)">
                        </div>
                    </div>

                    <a class="grid-corner-icon buttonColor" @click.stop.prevent="lockDrawing = !lockDrawing" @touchstart.stop>
                        <v-icon :icon="lockDrawing ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
                            size="14"></v-icon>
                    </a>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.pixel-art-widget-wrapper {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
}

.header-block {
    height: auto;
}

.main-content-row {
    min-height: 0;
    gap: 16px;
}

.controls-sidebar {
    max-width: 180px;
    width: 100%;
    min-height: 0;
}

.max-w-none {
    max-width: none !important;
}

.picker-container {
    overflow: hidden;
    display: flex;
    justify-content: center;
}

:deep(.v-color-picker) {
    transform: scale(0.95);
    transform-origin: top center;
}

.size-input :deep(.v-input__details) {
    display: none !important;
}

.tools-actions-block {
    width: 100%;
}

.action-icons-row {
    gap: 4px;
}

.delete-btn {
    text-transform: none;
    font-size: 12px !important;
    height: 32px !important;
}

.canvas-area {
    flex-grow: 1;
    min-height: 0;
    min-width: 0;
}

.grid-container {
    display: inline-block;
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: none !important;
    overscroll-behavior: none;
}

.grid-wrapper {
    position: relative;
    display: inline-block;
}

.grid-corner-icon {
    position: absolute;
    bottom: -16px;
    right: -16px;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    padding: 5px;
    border-radius: 15px;
}

.pixel {
    width: 14px;
    height: 14px;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.05);
    transition: background-color 0.05s ease;
}

.pixel:hover {
    filter: brightness(0.9);
}

.gap-1 {
    gap: 4px;
}

.gap-2 {
    gap: 8px;
}
</style>
