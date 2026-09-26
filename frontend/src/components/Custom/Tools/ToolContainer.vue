<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
    id: number
    isActive: boolean
    widthSlots: number
    heightSlots: number
    slotIndex: number,
    gridColumns: number
}>()

const emit = defineEmits<{
    (e: 'remove', id: number): void
    (e: 'update-size', size: { w: number; h: number, shiftX: number, shiftY: number }): void
    (e: 'update-position', targetSlotIndex: number): void
}>()

const GRID_ROWS = 3

const isResizing = ref(false)
const isDragging = ref(false)

let startW = 0
let startH = 0
let currentDirection = ''

let dragOffsetX = 0
let dragOffsetY = 0
let isMoveTriggered = false
let lastSlotIndex: number | null = null
let dragStartX = 0
let dragStartY = 0

const getEventCoords = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY }
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
        }
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
}

const startResize = (e: MouseEvent | TouchEvent, direction: string) => {
    if (isDragging.value) return

    const coords = getEventCoords(e)
    startW = props.widthSlots || 1
    startH = props.heightSlots || 1
    currentDirection = direction
    isResizing.value = true

    window.addEventListener('mousemove', resizeMove)
    window.addEventListener('mouseup', resizeStop)
    window.addEventListener('touchmove', resizeMove, { passive: false })
    window.addEventListener('touchend', resizeStop)
}

const resizeMove = (e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault()

    const container = document.querySelector('.tools-grid')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cellWidth = rect.width / props.gridColumns
    const cellHeight = rect.height / GRID_ROWS

    const coords = getEventCoords(e)
    const relativeX = coords.x - rect.left
    const relativeY = coords.y - rect.top

    const startCol = (props.slotIndex % props.gridColumns) + 1
    const startRow = Math.floor(props.slotIndex / props.gridColumns) + 1

    let targetW = startW
    let targetH = startH
    let shiftX = 0
    let shiftY = 0

    if (currentDirection.includes('e')) {
        const currentMouseCol = Math.floor(relativeX / cellWidth) + 1
        targetW = Math.max(1, currentMouseCol - startCol + 1)
    } else if (currentDirection.includes('w')) {
        const originalRightEdgeCol = startCol + startW - 1
        const currentMouseCol = Math.floor(relativeX / cellWidth) + 1
        targetW = Math.max(1, originalRightEdgeCol - currentMouseCol + 1)
        shiftX = (originalRightEdgeCol - targetW + 1) - startCol
    }

    if (currentDirection.includes('s')) {
        const currentMouseRow = Math.floor(relativeY / cellHeight) + 1
        targetH = Math.max(1, currentMouseRow - startRow + 1)
    } else if (currentDirection.includes('n')) {
        const originalBottomEdgeRow = startRow + startH - 1
        const currentMouseRow = Math.floor(relativeY / cellHeight) + 1
        targetH = Math.max(1, originalBottomEdgeRow - currentMouseRow + 1)
        shiftY = (originalBottomEdgeRow - targetH + 1) - startRow
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
    window.removeEventListener('touchmove', resizeMove)
    window.removeEventListener('touchend', resizeStop)
}

const startDrag = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement
    if (
        isResizing.value ||
        target.closest('.resize-handle') ||
        target.closest('button')
    ) return

    isMoveTriggered = false
    lastSlotIndex = null
    
    const coords = getEventCoords(e)
    dragStartX = coords.x
    dragStartY = coords.y

    const container = document.querySelector('.tools-grid')
    if (container) {
        const rect = container.getBoundingClientRect()
        const cellWidth = rect.width / props.gridColumns
        const cellHeight = rect.height / GRID_ROWS
        
        const startCol = props.slotIndex % props.gridColumns
        const startRow = Math.floor(props.slotIndex / props.gridColumns)
        
        const tileLeftX = rect.left + startCol * cellWidth
        const tileTopY = rect.top + startRow * cellHeight
        
        dragOffsetX = coords.x - tileLeftX
        dragOffsetY = coords.y - tileTopY
    }

    window.addEventListener('mousemove', dragMove)
    window.addEventListener('mouseup', dragStop)
    window.addEventListener('touchmove', dragMove, { passive: false })
    window.addEventListener('touchend', dragStop)
}

const dragMove = (e: MouseEvent | TouchEvent) => {
    const coords = getEventCoords(e)
    const deltaX = coords.x - dragStartX
    const deltaY = coords.y - dragStartY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (!isMoveTriggered && distance < 8) return

    if (e.cancelable) e.preventDefault()

    if (!isMoveTriggered) {
        isMoveTriggered = true
        isDragging.value = true
    }

    const container = document.querySelector('.tools-grid')
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cellWidth = rect.width / props.gridColumns
    const cellHeight = rect.height / GRID_ROWS

    const targetLeftX = coords.x - dragOffsetX - rect.left
    const targetTopY = coords.y - dragOffsetY - rect.top

    const rawCol = Math.round(targetLeftX / cellWidth)
    const rawRow = Math.round(targetTopY / cellHeight)
    
    const col = Math.max(0, Math.min(rawCol, props.gridColumns - 1))
    const row = Math.max(0, Math.min(rawRow, GRID_ROWS - 1))

    const targetSlotIndex = row * props.gridColumns + col
    
    if (targetSlotIndex !== lastSlotIndex) {
        lastSlotIndex = targetSlotIndex
        emit('update-position', targetSlotIndex)
    }
}

const dragStop = () => {
    window.removeEventListener('mousemove', dragMove)
    window.removeEventListener('mouseup', dragStop)
    window.removeEventListener('touchmove', dragMove)
    window.removeEventListener('touchend', dragStop)

    if (!isMoveTriggered) return

    isDragging.value = false
    lastSlotIndex = null
}

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', resizeMove)
    window.removeEventListener('mouseup', resizeStop)
    window.removeEventListener('touchmove', resizeMove)
    window.removeEventListener('touchend', resizeStop)
    window.removeEventListener('mousemove', dragMove)
    window.removeEventListener('mouseup', dragStop)
    window.removeEventListener('touchmove', dragMove)
    window.removeEventListener('touchend', dragStop)
})
</script>

<template>
    <div class="box d-flex flex-column justify-start w-100" :class="{ active: isActive }" @mousedown="startDrag"
        @touchstart.passive="startDrag">
        <Teleport to="body">
            <div v-if="isResizing" class="interaction-overlay cursor-resize"></div>
            <div v-if="isDragging" class="interaction-overlay cursor-move"></div>
        </Teleport>

        <div style="height: 25px; position: absolute; top: 0; left: 0; right: 0; cursor: move; z-index: 2;"
            @mousedown="startDrag" @touchstart.passive="startDrag">
        </div>

        <v-btn icon="mdi-close" size="30" variant="text" density="comfortable"
            class="position-absolute btnClose action-text" style="z-index: 3;"
            @click.stop="emit('remove', props.id)"></v-btn>

        <div class="tool-content-wrapper flex-grow-1">
            <slot></slot>
        </div>

        <div class="resize-handle n" @mousedown.stop.prevent="startResize($event, 'n')"
            @touchstart.stop.prevent="startResize($event, 'n')"></div>
        <div class="resize-handle s" @mousedown.stop.prevent="startResize($event, 's')"
            @touchstart.stop.prevent="startResize($event, 's')"></div>
        <div class="resize-handle e" @mousedown.stop.prevent="startResize($event, 'e')"
            @touchstart.stop.prevent="startResize($event, 'e')"></div>
        <div class="resize-handle w" @mousedown.stop.prevent="startResize($event, 'w')"
            @touchstart.stop.prevent="startResize($event, 'w')"></div>

        <div class="resize-handle nw" @mousedown.stop.prevent="startResize($event, 'nw')"
            @touchstart.stop.prevent="startResize($event, 'nw')"></div>
        <div class="resize-handle ne" @mousedown.stop.prevent="startResize($event, 'ne')"
            @touchstart.stop.prevent="startResize($event, 'ne')"></div>
        <div class="resize-handle sw" @mousedown.stop.prevent="startResize($event, 'sw')"
            @touchstart.stop.prevent="startResize($event, 'sw')"></div>
        <div class="resize-handle se visible-corner" @mousedown.stop.prevent="startResize($event, 'se')"
            @touchstart.stop.prevent="startResize($event, 'se')"></div>
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

.box:hover .resize-handle.visible-corner {
    background: linear-gradient(135deg, transparent 50%, var(--action-color) 50%);
}

.btnClose {
    top: 4px;
    right: 4px;
    z-index: 2;
    opacity: 80%;
    transition: ease 0.2s;
}

@media (hover: hover) {
    .btnClose {
        opacity: 0%; 
    }

    .box:hover .btnClose {
        opacity: 80%;
    }
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
