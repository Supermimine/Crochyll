<script setup lang="ts">
import BasicMenu from '../Menu/BasicMenu.vue';
import { computed, onMounted, ref, watch, type CSSProperties } from 'vue';
import { useI18n } from 'vue-i18n'
import { useHead } from "@unhead/vue";

import type { tool } from "@core/model/tool";
import { toolsType } from "@core/enum/toolsType";

const { isMobile } = useScreen();

const { t } = useI18n()

import ToolContainer from '../Custom/Tools/ToolContainer.vue';
import Counter from '../Custom/Tools/Counter.vue';
import Stopwatch from '../Custom/Tools/Stopwatch.vue';
import TermTranslator from '../Custom/Tools/TermTranslator.vue';
import TermHook from '../Custom/Tools/TermHook.vue';
import PixelArt from '../Custom/Tools/PixelArt.vue';
import ColorPalette from '../Custom/Tools/ColorPalette.vue';
import YarnComparaison from '../Custom/Tools/YarnComparaison.vue';
import Note from '../Custom/Tools/Note.vue';
import { useScreen } from '@/tools/appTools.ts';

useHead(() => ({
  title: 'Crochyll - ' + t('category.tools'),
  meta: [
    { property: 'og:title', content: 'Crochyll - ' + t('category.tools') },
    { name: 'twitter:title', content: 'Crochyll - ' + t('category.tools') }
  ]
}))

const menuShow = ref(false);
const menuPosition = ref({ x: 0, y: 0 });

const componentMap: Record<toolsType, any> = {
  [toolsType.Counter]: Counter,
  [toolsType.Stopwatch]: Stopwatch,
  [toolsType.TermTranslator]: TermTranslator,
  [toolsType.TermHook]: TermHook,
  [toolsType.PixelArt]: PixelArt,
  [toolsType.ColorPalette]: ColorPalette,
  [toolsType.YarnComparaison]: YarnComparaison,
  [toolsType.Note]: Note
}

const toolSize: Record<toolsType, (isMobile: boolean) => { w: number; h: number }> = {
  [toolsType.Counter]: (isMobile) => isMobile ? { w: 2, h: 1 } : { w: 1, h: 1 },
  [toolsType.Stopwatch]: (isMobile) => isMobile ? { w: 3, h: 1 } : { w: 2, h: 1 },
  [toolsType.TermTranslator]: (isMobile) => isMobile ? { w: 3, h: 1 } : { w: 3, h: 1 },
  [toolsType.TermHook]: (isMobile) => isMobile ? { w: 3, h: 1 } : { w: 3, h: 1 },
  [toolsType.PixelArt]: (isMobile) => isMobile ? { w: 3, h: 3 } : { w: 3, h: 3 },
  [toolsType.ColorPalette]: (isMobile) => isMobile ? { w: 3, h: 1 } : { w: 2, h: 1 },
  [toolsType.YarnComparaison]: (isMobile) => isMobile ? { w: 2, h: 2 } : { w: 2, h: 2 },
  [toolsType.Note]: (isMobile) => isMobile ? { w: 1, h: 1 } : { w: 2, h: 2 }
}


const STORAGE_KEY = "tool";

const lstTools = ref<tool[]>([])
const activeToolId = ref<number | null>(null)
const selectedSlotIndex = ref<number | null>(null)
const toolsState = ref<Record<number, any>>({});

const GRID_COLUMNS = computed(() => isMobile.value ? 3 : 5)
const GRID_ROWS = computed(() => Math.max(
  3,
  ...lstTools.value.map(item => Math.floor(item.slotIndex / GRID_COLUMNS.value) + Math.max(1, item.h || 1))
))

const getMinimumGridRows = (tools: tool[]) =>
  Math.max(3, tools.reduce((total, item) => total + Math.max(1, item.h || 1), 0))

const getToolBounds = (item: tool, slotIndex: number, columns: number) => ({
  col: slotIndex % columns,
  row: Math.floor(slotIndex / columns),
  width: Math.max(1, item.w || 1),
  height: Math.max(1, item.h || 1)
})

const toolsOverlap = (
  first: ReturnType<typeof getToolBounds>,
  second: ReturnType<typeof getToolBounds>
) =>
  first.col < second.col + second.width && first.col + first.width > second.col &&
  first.row < second.row + second.height && first.row + first.height > second.row

const findToolSlot = (item: tool, placedTools: tool[], columns: number, rows: number) => {
  const slotIndexes = [
    item.slotIndex,
    ...Array.from({ length: columns * rows }, (_, index) => index)
  ];
  const visited = new Set<number>();

  return slotIndexes.find(slotIndex => {
    if (visited.has(slotIndex) || slotIndex < 0 || slotIndex >= columns * rows) return false;
    visited.add(slotIndex);

    const bounds = getToolBounds(item, slotIndex, columns);
    if (bounds.col + bounds.width > columns || bounds.row + bounds.height > rows) return false;

    return placedTools.every(other =>
      !toolsOverlap(bounds, getToolBounds(other, other.slotIndex, columns))
    );
  });
}

const normalizeToolLayout = (tools: tool[], columns: number, rows: number) => {
  const availableRows = Math.max(rows, getMinimumGridRows(tools));
  const placedTools: tool[] = [];

  for (const item of tools) {
    const normalizedItem = {
      ...item,
      w: Math.min(Math.max(1, item.w || 1), columns),
      h: Math.max(1, item.h || 1)
    };
    const slotIndex = findToolSlot(normalizedItem, placedTools, columns, availableRows);

    if (slotIndex === undefined) continue;
    placedTools.push({ ...normalizedItem, slotIndex });
  }

  return placedTools;
}

const normalizeCurrentToolLayout = () => {
  lstTools.value = normalizeToolLayout(
    lstTools.value,
    GRID_COLUMNS.value,
    getMinimumGridRows(lstTools.value)
  );
}

watch(isMobile, (newIsMobile) => {
  const oldCols = newIsMobile ? 5 : 3;
  const newCols = newIsMobile ? 3 : 5;
  const maxRows = getMinimumGridRows(lstTools.value);

  const resizedTools = lstTools.value.map(tool => {
    const oldRow = Math.floor(tool.slotIndex / oldCols);
    const oldCol = tool.slotIndex % oldCols;

    const currentW = tool.w || 1;
    const currentH = tool.h || 1;
    
    let targetW = Math.min(currentH, newCols);
    let targetH = Math.min(currentW, maxRows);
    let targetCol = Math.min(oldCol, newCols - targetW);
    let targetRow = Math.min(oldRow, maxRows - targetH);

    return {
      ...tool,
      w: targetW,
      h: targetH,
      slotIndex: targetRow * newCols + targetCol
    };
  });

  lstTools.value = normalizeToolLayout(resizedTools, newCols, maxRows);
});

onMounted(() => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed && Array.isArray(parsed.tools)) {
        lstTools.value = normalizeToolLayout(parsed.tools, GRID_COLUMNS.value, getMinimumGridRows(parsed.tools));
        toolsState.value = parsed.states || {};
      } else if (Array.isArray(parsed)) {
        lstTools.value = normalizeToolLayout(parsed, GRID_COLUMNS.value, getMinimumGridRows(parsed));
      }

      if (lstTools.value.length > 0) {
        activeToolId.value = lstTools.value[0].id;
      }
    } catch (e) {
      console.error("Erreur lors de la lecture du LocalStorage:", e);
    }
  }
});

watch(
  [lstTools, toolsState],
  ([newTools, newStates]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tools: newTools, states: newStates })
    );
  },
  { deep: true }
);

const getDefaultState = (type: toolsType) => {
  if (type === toolsType.Counter) return 0;
  if (type === toolsType.Stopwatch) return 0;
  if (type === toolsType.PixelArt) return [];
  return undefined;
};

const openContextMenu = (event: MouseEvent | TouchEvent, slotIndex: number) => {
  const menuEstimatedHeight = 280
  const menuEstimatedWidth = 160

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  let targetX = clientX
  let targetY = clientY

  if (clientY + menuEstimatedHeight > window.innerHeight) {
    targetY = clientY - menuEstimatedHeight
  }

  if (clientX + menuEstimatedWidth > window.innerWidth) {
    targetX = clientX - menuEstimatedWidth
  }

  menuPosition.value = { x: targetX, y: targetY }
  selectedSlotIndex.value = slotIndex
  menuShow.value = true
}

const addTools = (tool: toolsType) => {
  if (selectedSlotIndex.value === null) return

  const id = lstTools.value.length > 0 ? lstTools.value[lstTools.value.length - 1].id + 1 : 1

  const { w, h } = toolSize[tool](isMobile.value)
  const newTool: tool = {
    id,
    type: tool,
    slotIndex: selectedSlotIndex.value,
    w,
    h
  };
  const availableRows = Math.max(
    GRID_ROWS.value,
    getMinimumGridRows([...lstTools.value, newTool])
  );
  const slotIndex = findToolSlot(newTool, lstTools.value, GRID_COLUMNS.value, availableRows);

  if (slotIndex === undefined) return;

  lstTools.value.push({ ...newTool, slotIndex });

  const initialState = getDefaultState(tool);
  if (initialState !== undefined) {
    toolsState.value[id] = initialState;
  }

  if (activeToolId.value === null) {
    activeToolId.value = id
  }

  selectedSlotIndex.value = null
}

const removeTool = (idToRemove: number) => {
  lstTools.value = lstTools.value.filter(tool => tool.id !== idToRemove)
  delete toolsState.value[idToRemove];

  if (activeToolId.value === idToRemove) {
    activeToolId.value = lstTools.value[0]?.id || null
  }
}

const getCoordinates = (slotIndex: number) => {
  const row = Math.floor(slotIndex / GRID_COLUMNS.value) + 1
  const col = (slotIndex % GRID_COLUMNS.value) + 1
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
        const slot = (startRow - 1 + r) * GRID_COLUMNS.value + (startCol - 1 + c)
        occupied.add(slot)
      }
    }
  })

  const totalSlots = GRID_COLUMNS.value * GRID_ROWS.value
  return Array.from({ length: totalSlots }, (_, i) => i).filter(slot => !occupied.has(slot))
})

const handleResize = (tool: tool, sizeData: { w: number, h: number, shiftX: number, shiftY: number }) => {
  const { row: startRow, col: startCol } = getCoordinates(tool.slotIndex)

  const targetCol = startCol + sizeData.shiftX
  const targetRow = startRow + sizeData.shiftY

  if (
    targetCol < 1 ||
    targetRow < 1 ||
    targetCol - 1 + sizeData.w > GRID_COLUMNS.value ||
    targetRow - 1 + sizeData.h > GRID_ROWS.value
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
  tool.slotIndex = (targetRow - 1) * GRID_COLUMNS.value + (targetCol - 1)
  normalizeCurrentToolLayout()
}

const handleMove = (tool: tool, targetSlotIndex: number) => {
  const getBounds = (item: tool, slotIndex: number) => ({
    col: slotIndex % GRID_COLUMNS.value,
    row: Math.floor(slotIndex / GRID_COLUMNS.value),
    width: item.w || 1,
    height: item.h || 1
  })
  const overlaps = (first: ReturnType<typeof getBounds>, second: ReturnType<typeof getBounds>) =>
    first.col < second.col + second.width && first.col + first.width > second.col &&
    first.row < second.row + second.height && first.row + first.height > second.row
  const fitsGrid = (bounds: ReturnType<typeof getBounds>) =>
    bounds.col + bounds.width <= GRID_COLUMNS.value && bounds.row + bounds.height <= GRID_ROWS.value
  const targetBounds = getBounds(tool, targetSlotIndex)

  if (!fitsGrid(targetBounds)) return

  const otherTools = lstTools.value.filter(other => other.id !== tool.id)
  const overlappingTools = otherTools.filter(other => overlaps(targetBounds, getBounds(other, other.slotIndex)))

  if (overlappingTools.length === 0) {
    tool.slotIndex = targetSlotIndex
    normalizeCurrentToolLayout()
    return
  }

  if (overlappingTools.length !== 1) return

  const otherTool = overlappingTools[0]
  const sourceSlotIndex = tool.slotIndex
  const otherBoundsAtSource = getBounds(otherTool, sourceSlotIndex)
  const remainingTools = otherTools.filter(other => other.id !== otherTool.id)

  if (
    !fitsGrid(otherBoundsAtSource) ||
    overlaps(targetBounds, otherBoundsAtSource) ||
    remainingTools.some(other =>
      overlaps(targetBounds, getBounds(other, other.slotIndex)) ||
      overlaps(otherBoundsAtSource, getBounds(other, other.slotIndex))
    )
  ) return

  tool.slotIndex = otherTool.slotIndex
  otherTool.slotIndex = sourceSlotIndex
  normalizeCurrentToolLayout()
}
</script>

<template>
  <BasicMenu />

  <div class="d-flex" style="justify-content: center;">
    <h2 class="mt-0">{{ t('tools.title') }}</h2>
  </div>

  <v-container fluid class="fill-screen pa-2 disable-text-select" @contextmenu.prevent>
    <v-menu 
      v-model="menuShow" 
      :target="[menuPosition.x, menuPosition.y]" 
      :close-on-content-click="true" 
      class="disable-text-select"
    >
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
        <v-list-item :title="t('tools.tool.yarnComparaison')" @click="addTools(toolsType.YarnComparaison)"></v-list-item>
        <v-list-item :title="t('tools.tool.note')" @click="addTools(toolsType.Note)"></v-list-item>
      </v-list>
    </v-menu>

    <div 
      class="tools-grid"
      :style="{ 
        '--grid-cols': GRID_COLUMNS, 
        '--grid-rows': GRID_ROWS 
      }"
    >
      <div v-for="tool in lstTools" :key="tool.id" class="grid-cell" :style="getGridStyle(tool)">
        <ToolContainer :id="tool.id" :isActive="tool.id === activeToolId" :widthSlots="tool.w" :heightSlots="tool.h"
          :slotIndex="tool.slotIndex" :gridColumns="GRID_COLUMNS" :gridRows="GRID_ROWS"
          @click.capture="activeToolId = tool.id" @remove="removeTool"
          @update-size="(sizeData) => handleResize(tool, sizeData)"
          @update-position="(targetSlot) => handleMove(tool, targetSlot)">
          <component :is="componentMap[tool.type]" :id="tool.id" :isActive="tool.id === activeToolId"
            :model-value="toolsState[tool.id]" @update:model-value="(val: any) => toolsState[tool.id] = val" />
        </ToolContainer>
      </div>

      <div v-for="slot in emptySlots" :key="'empty-' + slot" class="grid-cell" :style="getEmptySlotStyle(slot)">
        <button 
          class="addItemBox d-flex align-center justify-center w-100 h-100 text-h2"
          type="button"
          @click="openContextMenu($event, slot)" 
          @contextmenu.prevent="openContextMenu($event, slot)"
        >
          <div class="buttonColor" style="padding: 18px 25px; border-radius: 30px; color: white">
            +
          </div>
        </button>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.fill-screen {
  height: 80vh;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 5), 1fr);
  grid-template-rows: repeat(var(--grid-rows, 3), calc((75vh - 32px) / var(--grid-rows, 3)));
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
  opacity: 0.3;
}

@media (hover: hover) {
  .addItemBox:hover {
    opacity: 1;
    cursor: pointer;
  }
}
</style>
