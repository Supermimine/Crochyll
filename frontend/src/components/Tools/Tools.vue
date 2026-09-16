<script setup lang="ts">
import BasicMenu from '../Menu/BasicMenu.vue';
import { computed, ref, type CSSProperties } from 'vue';
import { useI18n } from 'vue-i18n'
import { useHead } from "@unhead/vue";

const { t } = useI18n()

import Counter from '../Custom/Tools/Counter.vue';
import Stopwatch from '../Custom/Tools/Stopwatch.vue';
import TermTranslator from '../Custom/Tools/TermTranslator.vue';
import TermHook from '../Custom/Tools/TermHook.vue';
import PixelArt from '../Custom/Tools/PixelArt.vue';
import ColorPalette from '../Custom/Tools/ColorPalette.vue';

useHead(() => ({
  title: 'Crochyll - ' + t('category.tools'),
  meta: [
    {
      property: 'og:title',
      content: 'Crochyll - ' + t('category.tools')
    },
    {
      name: 'twitter:title',
      content: 'Crochyll - ' + t('category.tools')
    }
  ]
}))

const enum toolsType { Counter, Stopwatch, TermTranslator, TermHook, PixelArt, ColorPalette }
interface tool {
  id: number,
  type: toolsType,
}

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

const lstTools = ref<tool[]>([]);
const activeToolId = ref<number | null>(lstTools.value[0]?.id || null)

const openContextMenu = (event: MouseEvent) => {
  menuPosition.value = { x: event.clientX, y: event.clientY };
  menuShow.value = true;
}

const addTools = (tool: toolsType) => {
  const id = lstTools.value.length > 0 ? lstTools.value[lstTools.value.length - 1].id + 1 : 1;
  lstTools.value.push({ id, type: tool });
}

const removeTool = (idToRemove: number) => {
  lstTools.value = lstTools.value.filter(tool => tool.id !== idToRemove)

  if (activeToolId.value === idToRemove) {
    activeToolId.value = lstTools.value[0]?.id || null
  }
}
</script>

<template>
  <BasicMenu />

  <section>
    <div @contextmenu.prevent="openContextMenu" style="min-height: 85vh;">
      <v-menu v-model="menuShow" :style="menuStyle" :close-on-content-click="true">
        <v-list density="compact">
          <v-list-subheader class="text-uppercase font-weight-bold text-grey-darken-1">
            Ajouter un outils
          </v-list-subheader>

          <v-divider></v-divider>

          <v-list-item title="Counter" @click="addTools(toolsType.Counter)"></v-list-item>
          <v-list-item title="Stopwatch" @click="addTools(toolsType.Stopwatch)"></v-list-item>
          <v-list-item title="TermTranslator" @click="addTools(toolsType.TermTranslator)"></v-list-item>
          <v-list-item title="TermHook" @click="addTools(toolsType.TermHook)"></v-list-item>
          <v-list-item title="PixelArt" @click="addTools(toolsType.PixelArt)"></v-list-item>
          <v-list-item title="ColorPalette" @click="addTools(toolsType.ColorPalette)"></v-list-item>
        </v-list>
      </v-menu>

      <v-row>
        <v-col v-for="tool in lstTools" :key="tool.id" cols="12" md="4">
          <component :is="componentMap[tool.type]" :id="tool.id" :isActive="tool.id === activeToolId" @remove="removeTool"
            @click.capture="activeToolId = tool.id" @contextmenu.stop />
        </v-col>
      </v-row>
    </div>
  </section>
</template>

<style scoped>
.window-header {
  cursor: move;
  /* Indique visuellement que la zone est déplaçable */
  user-select: none;
  /* Sécurité supplémentaire contre la sélection de texte */
}

.draggable-window {
  transition: none !important;
  /* Désactive les transitions Vuetify pour éviter les saccades pendant le drag */
}
</style>