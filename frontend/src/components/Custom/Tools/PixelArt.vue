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

const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

const removePixelArt = (): void => {
    emit('remove', props.id)
}

const pixels = ref<string[]>([])

const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize.value}, 20px)`,
    gridTemplateRows: `repeat(${gridSize.value}, 20px)`,
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
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault()
        undo()
    } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
        event.preventDefault()
        redo()
    }
}

const colorPixel = (index: number): void => {
    // Sauvegarder l'état UNE SEULE FOIS au premier pixel de cette action
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

    // Sauvegarder l'état AVANT le remplissage
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
    <div class="box" style="position: relative;">
        <a style="right: 10px; top: 5px; position: absolute; cursor: pointer; z-index: 10;"
            @click.stop="removePixelArt()">
            <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
        </a>

        <div class="pa-4 text-center width-100">
            <div class="text-subtitle-1 font-weight-bold mb-2">Pixel Art</div>

            <v-row>
                <v-col cols="auto">
                    <v-row class="align-center justify-center mb-6" no-gutters>
                        <v-col cols="12" sm="auto" class="d-flex justify-center mb-4">
                            <v-color-picker v-model="selectedColor" hide-inputs show-swatches elevation="0" mode="hex"
                                width="200"></v-color-picker>
                        </v-col>

                        <v-col cols="12" sm="auto" class="d-flex flex-column gap-2"
                            style="max-width: 200px; width: 100%;">
                            <v-text-field v-model="gridSize" label="Taille de grille" variant="outlined"
                                density="compact" @update:model-value="initializeGrid"></v-text-field>

                            <div>
                                <a class="action-text" :class="{ active: selectedAction === Action.Brush }" @click="switchAction(Action.Brush)">
                                    <v-icon icon="mdi-brush" size="24" class="mr-2"></v-icon>
                                </a>
                                <a class="action-text" :class="{ active: selectedAction === Action.Eraser }" @click="switchAction(Action.Eraser)">
                                    <v-icon icon="mdi-eraser" size="24" class="mr-2"></v-icon>
                                </a>
                                <a class="action-text" :class="{ active: selectedAction === Action.Fill }" @click="switchAction(Action.Fill)">
                                    <v-icon icon="mdi-format-color-fill" size="24" class="mr-2"></v-icon>
                                </a>
                            </div>

                            <div class="d-flex gap-2" style="justify-content: center;">
                                <v-btn variant="tonal" size="small" icon :disabled="undoStack.length === 0" @click="undo"
                                    title="Ctrl+Z">
                                    <v-icon icon="mdi-undo"></v-icon>
                                </v-btn>
                                <v-btn variant="tonal" size="small" icon :disabled="redoStack.length === 0" @click="redo"
                                    title="Ctrl+Y">
                                    <v-icon icon="mdi-redo"></v-icon>
                                </v-btn>
                            </div>

                            <v-btn color="error" prepend-icon="mdi-delete" variant="flat" @click="initializeGrid"
                                class="buttonColor">
                                Effacer
                            </v-btn>
                        </v-col>
                    </v-row>

                </v-col>

                <v-col>
                    <div class="grid-container pa-1 rounded shadow-inner" :style="gridStyle"
                        @mousedown="startDrawing" @mouseup="stopDrawing" @mouseleave="stopDrawing">
                        <div v-for="(color, index) in pixels" :key="index" class="pixel"
                            :style="{ backgroundColor: color }" @mousedown.prevent="colorPixel(index)"
                            @mouseover="drawOnHover(index)"></div>
                    </div>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<style scoped>
.box {
    background-color: var(--dark-color);
    border-radius: 5px;
    border: 2px solid transparent;
    margin: 0 0 15px 10px;
    position: relative;
}

.grid-container {
    display: inline-block;
    max-width: 100%;
    overflow: auto;
}

.pixel {
    width: 20px;
    height: 20px;
    transition: background-color 0.05s ease;
}

.pixel:hover {
    filter: brightness(0.9);
}

.gap-2 {
    gap: 8px;
}

.active {
    color: var(--action-color);
}

@media (max-width: 1250px) {
    .box {
        margin: 20px 0 5px 5px;
    }
}
</style>
