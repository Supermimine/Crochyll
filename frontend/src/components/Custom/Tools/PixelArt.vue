<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

const gridSize = ref<number>(25)
const selectedColor = ref<string>('#000000')
const isDrawing = ref<boolean>(false)

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

const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize.value}, 14px)`,
    gridTemplateRows: `repeat(${gridSize.value}, 14px)`,
    gap: '1px',
    cursor: 'crosshair',
    userSelect: 'none' as const
}))

const initializeGrid = (): void => {
    const totalPixels = gridSize.value * gridSize.value
    pixels.value = Array(totalPixels).fill('#FFFFFF')
    undoStack.value = []
    redoStack.value = []
    hasStateSavedInCurrentStroke.value = false
}

const saveState = (): void => {
    undoStack.value.push([...pixels.value])
    redoStack.value = []
}

const undo = (): void => {
    if (undoStack.value.length === 0) return

    redoStack.value.push([...pixels.value])
    pixels.value = undoStack.value.pop()!
}

const redo = (): void => {
    if (redoStack.value.length === 0) return

    undoStack.value.push([...pixels.value])
    pixels.value = redoStack.value.pop()!
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
}

const drawOnHover = (index: number): void => {
    if (isDrawing.value) {
        colorPixel(index)
    }
}

const startDrawing = (): void => {
    isDrawing.value = true
}

const stopDrawing = (): void => {
    isDrawing.value = false
    hasStateSavedInCurrentStroke.value = false
}

const switchAction = (action: Action): void => {
    selectedAction.value = action
}

onMounted(() => {
    initializeGrid()
    window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
    <div class="pixel-art-widget-wrapper d-flex flex-column justify-space-between pa-3">
        <div class="text-subtitle-1 font-weight-bold text-center header-block">
            Pixel Art
        </div>

        <div class="d-flex align-stretch justify-space-around flex-grow-1 w-100 main-content-row">
            <div class="controls-sidebar d-flex flex-column align-center justify-space-between py-10">
                <div class="picker-container" @mousedown.stop>
                    <v-color-picker v-model="selectedColor" hide-inputs elevation="0" mode="hex"
                        width="200"></v-color-picker>
                </div>

                <div class="tools-actions-block w-100 d-flex flex-column gap-1 align-center" @mousedown.stop>
                    <v-text-field v-model="gridSize" label="Taille de grille" variant="outlined" density="compact"
                        hide-details class="w-100 size-input"></v-text-field>

                    <div class="d-flex justify-center my-1 action-icons-row">
                        <a class="action-text mx-1" :class="{ active: selectedAction === Action.Brush }"
                            @click="switchAction(Action.Brush)">
                            <v-icon icon="mdi-brush" size="20"></v-icon>
                        </a>
                        <a class="action-text mx-1" :class="{ active: selectedAction === Action.Eraser }"
                            @click="switchAction(Action.Eraser)">
                            <v-icon icon="mdi-eraser" size="20"></v-icon>
                        </a>
                        <a class="action-text mx-1" :class="{ active: selectedAction === Action.Fill }"
                            @click="switchAction(Action.Fill)">
                            <v-icon icon="mdi-format-color-fill" size="20"></v-icon>
                        </a>
                    </div>

                    <div class="d-flex gap-2 justify-center mb-1" @mousedown.stop>
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
                        class="buttonColor w-100 delete-btn" @mousedown.stop>
                        Effacer
                    </v-btn>
                </div>
            </div>

            <div class="canvas-area d-flex align-center justify-center">
                <div class="grid-container pa-0 rounded shadow-inner" :style="[gridStyle, { '--grid-size': gridSize }]"
                    @mousedown="startDrawing" @mouseup="stopDrawing" @mouseleave="stopDrawing" @mousedown.stop>
                    <div v-for="(color, index) in pixels" :key="index" class="pixel" :style="{ backgroundColor: color }"
                        @mousedown.prevent="colorPixel(index)" @mouseover="drawOnHover(index)"></div>
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
    gap: 12px;
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

.active {
    color: var(--action-color);
}
</style>
