<script setup lang="ts">
import BasicMenu from '../Menu/BasicMenu.vue';
import { computed, ref, type CSSProperties } from 'vue';
import { useI18n } from 'vue-i18n'
import { useHead } from "@unhead/vue";

import type { tool } from "@core/model/tool";
import { toolsType } from "@core/enum/toolsType";

const { t } = useI18n()

import ToolContainer from '../Custom/Tools/ToolContainer.vue';
import Counter from '../Custom/Tools/Counter.vue';
import Stopwatch from '../Custom/Tools/Stopwatch.vue';
import TermTranslator from '../Custom/Tools/TermTranslator.vue';
import TermHook from '../Custom/Tools/TermHook.vue';
import PixelArt from '../Custom/Tools/PixelArt.vue';
import ColorPalette from '../Custom/Tools/ColorPalette.vue';

useHead(() => ({
  title: 'Crochyll - ' + t('category.tools'),
  meta: [
    { property: 'og:title', content: 'Crochyll - ' + t('category.tools') },
    { name: 'twitter:title', content: 'Crochyll - ' + t('category.tools') }
  ]
}))

const menuShow = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const menuStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  left: `${menuPosition.value.x}px`,
  top: `${menuPosition.value.y}px`,
}));

const componentMap: Record<toolsType, any> = {
  [toolsType.Counter]: Counter,
  [toolsType.Stopwatch]: Stopwatch,
  [toolsType.TermTranslator]: TermTranslator,
  [toolsType.TermHook]: TermHook,
  [toolsType.PixelArt]: PixelArt,
  [toolsType.ColorPalette]: ColorPalette
}

const toolSize: Record<toolsType, { w: number; h: number }> = {
  [toolsType.Counter]: { w: 1, h: 1 },
  [toolsType.Stopwatch]: { w: 2, h: 1 },
  [toolsType.TermTranslator]: { w: 3, h: 1 },
  [toolsType.TermHook]: { w: 3, h: 1 },
  [toolsType.PixelArt]: { w: 3, h: 3 },
  [toolsType.ColorPalette]: { w: 2, h: 1 }
}

const lstTools = ref<tool[]>([])
const activeToolId = ref<number | null>(null)
const selectedSlotIndex = ref<number | null>(null)

const openContextMenu = (event: MouseEvent, slotIndex: number) => {
  const menuEstimatedHeight = 280
  const menuEstimatedWidth = 160

  let targetX = event.clientX
  let targetY = event.clientY

  if (event.clientY + menuEstimatedHeight > window.innerHeight) {
    targetY = event.clientY - menuEstimatedHeight
  }

  if (event.clientX + menuEstimatedWidth > window.innerWidth) {
    targetX = event.clientX - menuEstimatedWidth
  }

  menuPosition.value = { x: targetX, y: targetY }
  selectedSlotIndex.value = slotIndex
  menuShow.value = true
}


const addTools = (tool: toolsType) => {
  if (selectedSlotIndex.value === null) return

  const id = lstTools.value.length > 0 ? lstTools.value[lstTools.value.length - 1].id + 1 : 1
  const defaultSize = toolSize[tool] || { w: 1, h: 1 }

  lstTools.value.push({
    id,
    type: tool,
    slotIndex: selectedSlotIndex.value,
    w: defaultSize.w,
    h: defaultSize.h
  })

  if (activeToolId.value === null) {
    activeToolId.value = id
  }

  selectedSlotIndex.value = null
}

const removeTool = (idToRemove: number) => {
  lstTools.value = lstTools.value.filter(tool => tool.id !== idToRemove)

  if (activeToolId.value === idToRemove) {
    activeToolId.value = lstTools.value[0]?.id || null
  }
}

const getCoordinates = (slotIndex: number) => {
  const row = Math.floor(slotIndex / 5) + 1
  const col = (slotIndex % 5) + 1
  return { row, col }
}

const getGridStyle = (tool: tool) => {
  const { row, col } = getCoordinates(tool.slotIndex)
  return {
    gridColumn: `${col} / span ${tool.w || 1}`,
    gridRow: `${row} / span ${tool.h || 1}`
  }
}

const getEmptySlotStyle = (slotIndex: number) => {
  const { row, col } = getCoordinates(slotIndex)
  return {
    gridColumn: `${col}`,
    gridRow: `${row}`
  }
}

const emptySlots = computed(() => {
  const occupied = new Set<number>()

  lstTools.value.forEach(t => {
    const { row: startRow, col: startCol } = getCoordinates(t.slotIndex)
    const w = t.w || 1
    const h = t.h || 1

    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const slot = (startRow - 1 + r) * 5 + (startCol - 1 + c)
        occupied.add(slot)
      }
    }
  })

  return Array.from({ length: 15 }, (_, i) => i).filter(slot => !occupied.has(slot))
})

const handleResize = (tool: tool, sizeData: { w: number, h: number, shiftX: number, shiftY: number }) => {
  const { row: startRow, col: startCol } = getCoordinates(tool.slotIndex)

  const targetCol = startCol + sizeData.shiftX
  const targetRow = startRow + sizeData.shiftY

  if (
    targetCol < 1 ||
    targetRow < 1 ||
    targetCol - 1 + sizeData.w > 5 ||
    targetRow - 1 + sizeData.h > 3
  ) {
    return
  }

  const isTargetSpaceFree = lstTools.value.every(other => {
    if (other.id === tool.id) return true

    const { row: otherRow, col: otherCol } = getCoordinates(other.slotIndex)
    const otherW = other.w || 1
    const otherH = other.h || 1

    const collisionX = (targetCol < otherCol + otherW) && (targetCol + sizeData.w > otherCol)
    const collisionY = (targetRow < otherRow + otherH) && (targetRow + sizeData.h > otherRow)

    return !(collisionX && collisionY)
  })

  if (!isTargetSpaceFree) {
    return
  }

  tool.w = sizeData.w
  tool.h = sizeData.h
  tool.slotIndex = (targetRow - 1) * 5 + (targetCol - 1)
}

const handleMove = (tool: tool, targetSlotIndex: number) => {
  const { row: targetRow, col: targetCol } = getCoordinates(targetSlotIndex)

  if (targetCol - 1 + tool.w > 5 || targetRow - 1 + tool.h > 3) return

  const isSpaceFree = lstTools.value.every(other => {
    if (other.id === tool.id) return true // S'ignorer soi-même

    const { row: otherRow, col: otherCol } = getCoordinates(other.slotIndex)
    const otherW = other.w || 1
    const otherH = other.h || 1

    const collisionX = (targetCol < otherCol + otherW) && (targetCol + tool.w > otherCol)
    const collisionY = (targetRow < otherRow + otherH) && (targetRow + tool.h > otherRow)

    return !(collisionX && collisionY)
  })

  if (isSpaceFree) {
    tool.slotIndex = targetSlotIndex
  }
}
</script>

<template>
  <BasicMenu />

  <div class="d-flex" style="justify-content: center;">
    <h2 class="mt-0">{{ t('tools.title') }}</h2>
  </div>

  <v-container fluid class="fill-screen pa-2 disable-text-select" @contextmenu.prevent>
    <v-menu v-model="menuShow" :style="menuStyle" :close-on-content-click="true" class="disable-text-select">
      <v-list density="compact">
        <v-list-subheader class="text-uppercase font-weight-bold text-grey-darken-1">
          {{ t('tools.addTool') }}
        </v-list-subheader>
        <v-divider></v-divider>
        <v-list-item :title="t('tools.tool.counter')" @click="addTools(toolsType.Counter)"></v-list-item>
        <v-list-item :title="t('tools.tool.stopwatch')" @click="addTools(toolsType.Stopwatch)"></v-list-item>
        <v-list-item :title="t('tools.tool.termTranslator')" @click="addTools(toolsType.TermTranslator)"></v-list-item>
        <v-list-item :title="t('tools.tool.termHook')" @click="addTools(toolsType.TermHook)"></v-list-item>
        <v-list-item :title="t('tools.tool.pixelArt')" @click="addTools(toolsType.PixelArt)"></v-list-item>
        <v-list-item :title="t('tools.tool.colorPalette')" @click="addTools(toolsType.ColorPalette)"></v-list-item>
      </v-list>
    </v-menu>

    <div class="tools-grid">
      <div v-for="tool in lstTools" :key="tool.id" class="grid-cell" :style="getGridStyle(tool)">
        <ToolContainer :id="tool.id" :isActive="tool.id === activeToolId" :widthSlots="tool.w" :heightSlots="tool.h"
          :slotIndex="tool.slotIndex" @click.capture="activeToolId = tool.id" @remove="removeTool"
          @update-size="(sizeData) => handleResize(tool, sizeData)"
          @update-position="(targetSlot: number) => handleMove(tool, targetSlot)">
          <component :is="componentMap[tool.type]" :id="tool.id" :isActive="tool.id === activeToolId" />
        </ToolContainer>
      </div>

      <div v-for="slot in emptySlots" :key="'empty-' + slot" class="grid-cell" :style="getEmptySlotStyle(slot)">
        <a class="addItemBox d-flex align-center justify-center w-100 h-100 text-h2"
          @click="openContextMenu($event, slot)" @contextmenu.prevent="openContextMenu($event, slot)">
          <div class="buttonColor" style="padding: 18px 25px; border-radius: 30px; color: white">
            +
          </div>
        </a>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.fill-screen {
  height: 80vh;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, calc((75vh - 32px) / 3));
  gap: 16px;
  width: 100%;
}

.grid-cell {
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.addItemBox {
  border: var(--action-color) dashed;
  border-radius: 24px;
  transition: ease 0.3s;
  opacity: 0;
}

.addItemBox:hover {
  opacity: 1;
  cursor: pointer;
}
</style>