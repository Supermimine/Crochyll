<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
    id: number
    isActive: boolean
    widthSlots: number
    heightSlots: number
    slotIndex: number
}>()

const emit = defineEmits<{
    (e: 'remove', id: number): void
    (e: 'update-size', size: { w: number; h: number, shiftX: number, shiftY: number }): void
    (e: 'update-position', targetSlotIndex: number): void
}>()

const GRID_COLUMNS = 5
const GRID_ROWS = 3

const isResizing = ref(false)
const isDragging = ref(false)

let startX = 0
let startY = 0
let startW = 0
let startH = 0
let currentDirection = ''

let dragStartX = 0
let dragStartY = 0
let isMoveTriggered = false
let lastSlotIndex: number | null = null

const startResize = (e: MouseEvent, direction: string) => {
    if (isDragging.value) return

    startX = e.clientX
    startY = e.clientY
    startW = props.widthSlots || 1
    startH = props.heightSlots || 1
    currentDirection = direction

    isResizing.value = true

    window.addEventListener('mousemove', resizeMove)
    window.addEventListener('mouseup', resizeStop)
}

const resizeMove = (e: MouseEvent) => {
    const container = document.querySelector('.tools-grid')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cellWidth = rect.width / GRID_COLUMNS
    const cellHeight = rect.height / GRID_ROWS

    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top

    const startCol = (props.slotIndex % GRID_COLUMNS) + 1
    const startRow = Math.floor(props.slotIndex / GRID_COLUMNS) + 1

    let targetW = startW
    let targetH = startH
    let shiftX = 0
    let shiftY = 0

    if (currentDirection.includes('e')) {
        const currentMouseCol = Math.floor(relativeX / cellWidth) + 1
        targetW = Math.max(1, currentMouseCol - startCol + 1)
    } else if (currentDirection.includes('w')) {
        const originalRightEdgeX = (startCol - 1 + startW) * cellWidth
        
        const newWidthPixels = originalRightEdgeX - relativeX
        targetW = Math.max(1, Math.round(newWidthPixels / cellWidth))
        
        shiftX = startW - targetW
    }

    if (currentDirection.includes('s')) {
        const currentMouseRow = Math.floor(relativeY / cellHeight) + 1
        targetH = Math.max(1, currentMouseRow - startRow + 1)
    } else if (currentDirection.includes('n')) {
        const originalBottomEdgeY = (startRow - 1 + startH) * cellHeight
        
        const newHeightPixels = originalBottomEdgeY - relativeY
        targetH = Math.max(1, Math.round(newHeightPixels / cellHeight))
        
        shiftY = startH - targetH
    }

    if (targetW !== props.widthSlots || targetH !== props.heightSlots) {
        emit('update-size', { w: targetW, h: targetH, shiftX, shiftY })
    }
}

const resizeStop = () => {
    isResizing.value = false
    currentDirection = ''
    window.removeEventListener('mousemove', resizeMove)
    window.removeEventListener('mouseup', resizeStop)
}

const startDrag = (e: MouseEvent) => {
    if (
        isResizing.value ||
        (e.target as HTMLElement).closest('.resize-handle') ||
        (e.target as HTMLElement).closest('button')
    ) return

    isMoveTriggered = false
    lastSlotIndex = null
    dragStartX = e.clientX
    dragStartY = e.clientY

    window.addEventListener('mousemove', dragMove)
    window.addEventListener('mouseup', dragStop)
}

const dragMove = (e: MouseEvent) => {
    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (!isMoveTriggered && distance < 5) return

    if (!isMoveTriggered) {
        isMoveTriggered = true
        isDragging.value = true
    }

    const container = document.querySelector('.tools-grid')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cellWidth = rect.width / GRID_COLUMNS
    const cellHeight = rect.height / GRID_ROWS

    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top

    const col = Math.floor(relativeX / cellWidth)
    const row = Math.floor(relativeY / cellHeight)

    if (col >= 0 && col < GRID_COLUMNS && row >= 0 && row < GRID_ROWS) {
        const targetSlotIndex = row * GRID_COLUMNS + col
        
        if (targetSlotIndex !== lastSlotIndex) {
            lastSlotIndex = targetSlotIndex
            emit('update-position', targetSlotIndex)
        }
    }
}

const dragStop = () => {
    window.removeEventListener('mousemove', dragMove)
    window.removeEventListener('mouseup', dragStop)

    if (!isMoveTriggered) return

    isDragging.value = false
    lastSlotIndex = null
}

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', resizeMove)
    window.removeEventListener('mouseup', resizeStop)
    window.removeEventListener('mousemove', dragMove)
    window.removeEventListener('mouseup', dragStop)
})
</script>

<template>
    <div class="box d-flex flex-column justify-start w-100" :class="{ active: isActive }" @mousedown="startDrag">
        <Teleport to="body">
            <div v-if="isResizing" class="interaction-overlay cursor-resize"></div>
            <div v-if="isDragging" class="interaction-overlay cursor-move"></div>
        </Teleport>

        <div style="height: 25px; position: absolute; top: 0; left: 0; right: 0; cursor: move; z-index: 2;" @mousedown="startDrag">
        </div>

        <v-btn icon="mdi-close" size="30" variant="text" density="comfortable"
            class="position-absolute btnClose action-text" style="z-index: 3;" @click.stop="emit('remove', props.id)"></v-btn>

        <div class="tool-content-wrapper flex-grow-1">
            <slot></slot>
        </div>

        <div class="resize-handle n" @mousedown.stop.prevent="startResize($event, 'n')"></div>
        <div class="resize-handle s" @mousedown.stop.prevent="startResize($event, 's')"></div>
        <div class="resize-handle e" @mousedown.stop.prevent="startResize($event, 'e')"></div>
        <div class="resize-handle w" @mousedown.stop.prevent="startResize($event, 'w')"></div>

        <div class="resize-handle nw" @mousedown.stop.prevent="startResize($event, 'nw')"></div>
        <div class="resize-handle ne" @mousedown.stop.prevent="startResize($event, 'ne')"></div>
        <div class="resize-handle sw" @mousedown.stop.prevent="startResize($event, 'sw')"></div>

        <div class="resize-handle se visible-corner" @mousedown.stop.prevent="startResize($event, 'se')"></div>
    </div>
</template>

<style scoped>
.box {
    background-color: var(--dark-color);
    border-radius: 12px;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
    min-height: 100%;
    height: 100%;
}

.box.active {
    border-color: var(--action-color);
}

.box:hover .btnClose {
    opacity: 80%;
}

.box:hover .resize-handle.visible-corner {
    background: linear-gradient(135deg, transparent 50%, var(--action-color) 50%);
}

.btnClose {
    top: 4px;
    right: 4px;
    z-index: 2;
    opacity: 0%;
    transition: ease 0.2s;
}

.tool-content-wrapper {
    width: 100%;
    height: 100%;
    min-height: 0;
}

.resize-handle {
    position: absolute;
    z-index: 10;
}

.resize-handle.n {
    top: -3px;
    left: 6px;
    right: 6px;
    height: 6px;
    cursor: n-resize;
}

.resize-handle.s {
    bottom: -3px;
    left: 6px;
    right: 6px;
    height: 6px;
    cursor: s-resize;
}

.resize-handle.e {
    right: -3px;
    top: 6px;
    bottom: 6px;
    width: 6px;
    cursor: e-resize;
}

.resize-handle.w {
    left: -3px;
    top: 6px;
    bottom: 6px;
    width: 6px;
    cursor: w-resize;
}

.resize-handle.nw {
    top: -3px;
    left: -3px;
    width: 12px;
    height: 12px;
    cursor: nw-resize;
}

.resize-handle.ne {
    top: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    cursor: ne-resize;
}

.resize-handle.sw {
    bottom: -3px;
    left: -3px;
    width: 12px;
    height: 12px;
    cursor: sw-resize;
}

.resize-handle.se {
    bottom: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    cursor: se-resize;
}

.resize-handle.visible-corner {
    width: 16px;
    height: 16px;
    bottom: 0;
    right: 0;
    background: linear-gradient(135deg, transparent 60%, rgba(255, 255, 255, 0.3) 60%);
    transition: ease 0.2s;
}


.interaction-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999 !important;
    background: transparent;
    user-select: none !important;
}

.cursor-resize {
    cursor: se-resize !important;
}

.cursor-move {
    cursor: move !important;
}
</style>
