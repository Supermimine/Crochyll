<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from 'vue-i18n'
import { safeStorageGetJSON, safeStorageSetJSON, useScreen } from '@/tools/appTools';

const { t } = useI18n()
const { isMobile } = useScreen();

import translate from "@/tools/translate";
import { language } from "../../tools/appTools";
import { importPdfFile } from "@/tools/pdf/fileImport.service";
import { sanitizeHtml } from "@/tools/sanitizer";
import { validatePdfFile } from "@/tools/pdfValidator";

import { getPatternTitle } from "@/tools/pdf/reader/pdfTitle";
import { getPatternSize } from "@/tools/pdf/reader/pdfSize";
import { getPatternAbbreviations } from "@/tools/pdf/reader/pdfAbbreviation";
import { getPatternMaterials } from "@/tools/pdf/reader/pdfMaterial";
import { getPatternHookSize } from "@/tools/pdf/reader/pdfHookSize";
import { getPatternGauge } from "@/tools/pdf/reader/pdfGauge";
import { getPatternTips } from "@/tools/pdf/reader/pdfTips";

import BasicMenu from "../Menu/BasicMenu.vue";
import ToolContainer from '@/components/Custom/Tools/ToolContainer.vue'
import Counter from '@/components/Custom/Tools/Counter.vue'

import type { FilePattern, ReaderCounter } from "@core/model/filepattern";
import {
  boldPatternRoundHeadings,
  getPatternSection,
  normalizePatternAbbreviations
} from "@/tools/pdf/reader/pdfPattern";
import { useHead } from "@unhead/vue";

const filesList = ref<FilePattern[]>(safeStorageGetJSON<FilePattern[]>("files", []));
const filesSectionShow = ref(filesList.value.length > 0);
const filesSectionOpen = ref(true);
const maxState = ref(0);

const selectedFileIndex = ref<number | null>(null);
const selectedFile = ref<FilePattern | null>(null);
const uploadSectionShow = ref(selectedFileIndex.value == null ? true : false);

const loadingImport = ref(false);
const uploadError = ref<string | null>(null);

const importFile = async () => {

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/pdf";

  input.onchange = async (e) => {
    try {
      loadingImport.value = true;
      uploadError.value = null;
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Valider le fichier PDF
      const validation = await validatePdfFile(file);
      if (!validation.valid) {
        uploadError.value = validation.error || 'Erreur de validation du fichier';
        return;
      }

      const pattern = await importPdfFile(file);
      if (!pattern) {
        uploadError.value = 'Erreur lors de la lecture du PDF. Vérifiez que le fichier est valide.';
        return;
      }

      addFile(pattern);
      filesSectionShow.value = true;
    } catch (error) {
      uploadError.value = `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error('Erreur import PDF:', error);
    } finally {
      loadingImport.value = false;
    }
  };

  input.click();
};
const addFile = (file: FilePattern) => {
  const files: FilePattern[] = safeStorageGetJSON<FilePattern[]>("files", []);

  files.push(file);
  filesList.value = files;

  safeStorageSetJSON("files", files);
};
const removeFile = (index: number) => {
  const files: FilePattern[] = safeStorageGetJSON<FilePattern[]>("files", []);

  files.splice(index, 1);
  filesList.value = files;

  safeStorageSetJSON("files", files);

  unSelectedFile();

  if (filesList.value.length === 0) {
    filesSectionShow.value = false;
  }
};

const changeSelectedFile = (index: number) => {
  const file = filesList.value[index];
  if (!file) return;

  if (file.readerCounters === undefined) {
    file.readerCounters = [{ id: 1, slotIndex: 0, value: 0 }];
  }
  normalizeCounterSlots(file.readerCounters);
  safeStorageSetJSON("files", filesList.value);

  selectedFileIndex.value = index;
  uploadSectionShow.value = false;
  selectedFile.value = file;
  activeCounterId.value = file.readerCounters[0]?.id ?? null;
  filesSectionOpen.value = false;
};
const unSelectedFile = () => {
  selectedFileIndex.value = null;
  uploadSectionShow.value = true;
  selectedFile.value = null;
  activeCounterId.value = null;
};

const editFile = () => {
  if (!selectedFile.value || selectedFileIndex.value === null) return;

  filesList.value[selectedFileIndex.value] = selectedFile.value;
  safeStorageSetJSON("files", filesList.value);
};
const handleMaterialCheckboxChange = (event: Event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.name.startsWith('material-') || !selectedFile.value) return;

  selectedFile.value.materialChecks ??= {};
  selectedFile.value.materialChecks[input.name] = input.checked;
  editFile();
};
const changeState = (state: number) => {
  if (selectedFile?.value == null) return;

  if (selectedFile.value.state == 0 && state == -1) return;

  selectedFile.value.state = selectedFile?.value.state + state;
  editFile();
};

const translatedSection = ref<string>("");
const loadingTranslate = ref<boolean>(false);

const sanitizedSection = computed(() => sanitizeHtml(translatedSection.value));

const showSection = async () => {
  if (selectedFile.value == null) return;

  const sections = selectedFile.value.content?.toString().split("***SECTION***") ?? [];
  const lang = selectedFile.value.lang ?? "fra";
  const finalSections = [];
  let lastIndexCheck: number | null = null;

  // Title
  const patternTitle = getPatternTitle(sections);
  finalSections.push(
    `<h1 class="pattern-title"><b>${patternTitle}</b></h1>`
  );

  // Materials
  const patternMaterialsResult = getPatternMaterials(sections, lang as 'fra' | 'eng');
  const patternHookSize = getPatternHookSize(sections, lang as 'fra' | 'eng');

  if (patternMaterialsResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternMaterialsResult.sectionIndex);
  }

  const yarns = patternMaterialsResult.materials[0]
    .split(
      patternMaterialsResult.materials[0].includes('##yarn##')
        ? /##yarn##\s*/
        : /[\n\r,–-]|\s+(?:et|and)\s+/
    )
    .map((y: string) => y.trim())
    .filter((y: string) => y.length > 0);

  const materialCheckboxKeys: string[] = [];
  const materialCheckbox = (key: string, label: string, indented = false) => {
    materialCheckboxKeys.push(key);
    const checked = selectedFile.value?.materialChecks?.[key] ? ' checked' : '';
    const indentClass = indented ? ' class="reader-material-indent"' : '';
    return `<label${indentClass}><input type="checkbox" name="${key}"${checked}> ${label}</label><br/>`;
  };
  const hookSize = patternHookSize.match(/[\d]+(?:[.,][\d]+)?\s*mm/i)?.[0] ?? '';
  const hookLabel = hookSize
    ? `${t('reader.materials.hook')}: ${hookSize}`
    : t('reader.materials.hook');

  const translatedYarns = await Promise.all(
    yarns.map(async (y: string) => {
      const translated = await translate(y, lang, language());
      const trimmedTranslation = translated.trim();
      return trimmedTranslation.charAt(0).toUpperCase() + trimmedTranslation.slice(1);
    })
  );

  let materials = `<div><h2 class="mb-2">${t('reader.materials.title')}</h2>`
  if (patternHookSize) {
    materials += materialCheckbox('material-hook', hookLabel)
  }
  materials += `${[
    patternMaterialsResult.materials[1] ? materialCheckbox('material-needles', t('reader.materials.needles')) : '',
    patternMaterialsResult.materials[2] ? materialCheckbox('material-marker', t('reader.materials.marker')) : '',
    patternMaterialsResult.materials[3] ? materialCheckbox('material-stuffing', t('reader.materials.stuffing')) : '',
    patternMaterialsResult.materials[4] ? materialCheckbox('material-safety-eyes', t('reader.materials.safetyEyes')) : '',
  ].filter(Boolean).join('')}`;
  materials += `<span><b>${t('reader.materials.yarns')}:</b></span><br/>${translatedYarns.map((y: string, index: number) => materialCheckbox(
    `material-yarn-${index}`,
    y,
    true
  )).join('')}</div>`

  const materialsSectionIndex = finalSections.length;
  finalSections.push(materials);

  // Project size
  const patternSize = getPatternSize(sections);
  if (patternSize) {
    finalSections.push(`<h2 class="mb-2">Size</h2><span>${patternSize}</span>`);
  }

  // Abbreviations
  const patternAbbreviationsResult = getPatternAbbreviations(sections, lang as 'fra' | 'eng');
  if (patternAbbreviationsResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternAbbreviationsResult.sectionIndex);
  }
  finalSections.push(
    `<h2 class="mb-2">Abbreviations</h2><div style="margin-left: 20px;">${patternAbbreviationsResult.abbreviations}</div>`
  );

  // Gauge
  const patternGaugeResult = getPatternGauge(sections, lang as 'fra' | 'eng');
  if (patternGaugeResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternGaugeResult.sectionIndex);
  }
  if (patternGaugeResult.gauge) {
    finalSections.push(`<h2 class="mb-2"><b>Gauge</b></h2><span>${patternGaugeResult.gauge}</span>`);
  }

  // Tips/info
  const patternTipsResult = getPatternTips(sections, lang as 'fra' | 'eng');
  if (patternTipsResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternTipsResult.sectionIndex);
  }
  if (patternTipsResult.tips) {
    finalSections.push(`<h2 class="mb-2"><b>Tips</b></h2><span>${patternTipsResult.tips}</span>`);
  }

  //Pattern
  lastIndexCheck = lastIndexCheck ? lastIndexCheck + 1 : 0;
  const lastSection = sections.slice(lastIndexCheck).join(' ').trim();

  const patternSectionIndex = finalSections.length;
  const abbreviationSection = patternAbbreviationsResult.sectionIndex === null
    ? ''
    : sections[patternAbbreviationsResult.sectionIndex];
  const patternSectionResult = getPatternSection(lastSection);

  finalSections.push(...patternSectionResult.finalSection);

  maxState.value = finalSections.length - 1;

  if (!finalSections || selectedFile.value?.state == null) {
    translatedSection.value = "";
    return;
  }

  loadingTranslate.value = true;

  try {
    const currentSection = finalSections[selectedFile.value.state];
    const translated = selectedFile.value.state === materialsSectionIndex
      ? currentSection
      : await translate(currentSection, lang, language());
    const normalizedTranslation = selectedFile.value.state >= patternSectionIndex
      ? normalizePatternAbbreviations(
        translated,
        abbreviationSection,
        patternAbbreviationsResult.abbreviations,
        lang as 'fra' | 'eng',
        language()
      )
      : translated;
    const formattedTranslation = selectedFile.value.state >= patternSectionIndex
      ? boldPatternRoundHeadings(normalizedTranslation)
      : normalizedTranslation;
    const translatedDocument = new DOMParser().parseFromString(formattedTranslation, 'text/html');

    translatedDocument.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input, index) => {
      const key = input.name || materialCheckboxKeys[index];
      if (!key) return;

      input.name = key;
      const checked = Boolean(selectedFile.value?.materialChecks?.[key]);
      input.checked = checked;
      if (checked) {
        input.setAttribute('checked', '');
      } else {
        input.removeAttribute('checked');
      }

      if (key.startsWith('material-yarn-')) {
        const label = input.closest('label');
        if (label) {
          label.style.display = 'block';
          label.style.marginLeft = '20px';
        }
      }
    });

    translatedSection.value = translatedDocument.body.innerHTML;
  } catch (error) {
    translatedSection.value = "Erreur de traduction";
  } finally {
    loadingTranslate.value = false;
  }
};

const MAX_COUNTERS = 2;
const GRID_COLUMNS = 1;
const GRID_ROWS = 2;
const COUNTER_WIDTH = 1;
const COUNTER_HEIGHT = 1;
const counters = computed(() => selectedFile.value?.readerCounters ?? []);
const activeCounterId = ref<number | null>(null)
const showAddButton = computed(() => counters.value.length < MAX_COUNTERS)

const isCounterPositionAvailable = (slotIndex: number, otherCounters: ReaderCounter[]) => {
  const column = slotIndex % GRID_COLUMNS;
  const row = Math.floor(slotIndex / GRID_COLUMNS);

  if (
    column + COUNTER_WIDTH > GRID_COLUMNS ||
    row + COUNTER_HEIGHT > GRID_ROWS
  ) return false;

  return otherCounters.every(other => {
    const otherColumn = other.slotIndex % GRID_COLUMNS;
    const otherRow = Math.floor(other.slotIndex / GRID_COLUMNS);
    const overlapsHorizontally = column < otherColumn + COUNTER_WIDTH && column + COUNTER_WIDTH > otherColumn;
    const overlapsVertically = row < otherRow + COUNTER_HEIGHT && row + COUNTER_HEIGHT > otherRow;
    return !(overlapsHorizontally && overlapsVertically);
  });
};

const findFreeCounterSlot = (otherCounters: ReaderCounter[]) =>
  Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (_, index) => index)
    .find(slotIndex => isCounterPositionAvailable(slotIndex, otherCounters));

const normalizeCounterSlots = (fileCounters: ReaderCounter[]) => {
  const placedCounters: ReaderCounter[] = [];

  fileCounters.forEach(counter => {
    if (!isCounterPositionAvailable(counter.slotIndex, placedCounters)) {
      const freeSlot = findFreeCounterSlot(placedCounters);
      if (freeSlot !== undefined) counter.slotIndex = freeSlot;
    }
    placedCounters.push(counter);
  });
};

const addCounter = () => {
  if (!selectedFile.value || counters.value.length >= MAX_COUNTERS) return;

  const slotIndex = findFreeCounterSlot(counters.value);
  if (slotIndex === undefined) return;

  const newId = counters.value.reduce((maxId, counter) => Math.max(maxId, counter.id), 0) + 1;
  selectedFile.value.readerCounters ??= [];
  selectedFile.value.readerCounters.push({ id: newId, slotIndex, value: 0 });
  activeCounterId.value = newId
  editFile();
}
const removeCounter = (id: number) => {
  if (!selectedFile.value) return;
  selectedFile.value.readerCounters = counters.value.filter((counter) => counter.id !== id);

  if (activeCounterId.value === id) {
    activeCounterId.value = counters.value[0]?.id ?? null
  }
  editFile();
}

const setActiveCounter = (id: number) => {
  activeCounterId.value = id
}

const updateCounterValue = (id: number, value: number) => {
  const counter = counters.value.find(item => item.id === id);
  if (!counter) return;

  counter.value = value;
  editFile();
}

const getCounterStyle = (counter: ReaderCounter) => ({
  gridColumn: `${(counter.slotIndex % GRID_COLUMNS) + 1}`,
  gridColumnEnd: `span ${COUNTER_WIDTH}`,
  gridRow: `${Math.floor(counter.slotIndex / GRID_COLUMNS) + 1}`,
  gridRowEnd: `span ${COUNTER_HEIGHT}`
});

const getAddCounterStyle = () => {
  const slotIndex = findFreeCounterSlot(counters.value) ?? 0;
  return {
    gridColumn: `${(slotIndex % GRID_COLUMNS) + 1}`,
    gridRow: `${Math.floor(slotIndex / GRID_COLUMNS) + 1}`,
    gridRowEnd: `span ${COUNTER_HEIGHT}`
  };
};

const handleCounterMove = (counter: ReaderCounter, targetSlotIndex: number) => {
  const otherCounters = counters.value.filter(other => other.id !== counter.id);

  if (!isCounterPositionAvailable(targetSlotIndex, otherCounters)) {
    const overlappingCounter = otherCounters.find(other =>
      other.slotIndex === targetSlotIndex
    );
    if (!overlappingCounter) return;

    const remainingCounters = otherCounters.filter(other => other.id !== overlappingCounter.id);
    if (!isCounterPositionAvailable(counter.slotIndex, remainingCounters)) return;

    const previousSlotIndex = counter.slotIndex;
    counter.slotIndex = overlappingCounter.slotIndex;
    overlappingCounter.slotIndex = previousSlotIndex;
    editFile();
    return;
  }

  counter.slotIndex = targetSlotIndex;
  editFile();
};

watch(
  [selectedFile, () => selectedFile.value?.state],
  () => showSection()
);

const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.code === 'ArrowLeft') {
    event.preventDefault();
    changeState(-1)
  }
  if (event.code === 'ArrowRight') {
    event.preventDefault();
    changeState(1)
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

useHead(() => ({
  title: 'Crochyll - ' + t('category.reader'),
  meta: [
    {
      property: 'og:title',
      content: 'Crochyll - ' + t('category.reader')
    },
    {
      name: 'twitter:title',
      content: 'Crochyll - ' + t('category.reader')
    }
  ]
}))
</script>

<template>
  <BasicMenu />

  <div style="display: flex">
    <!-- Menu -->
    <div v-if="filesSectionShow" :class="['filesSection', { open: filesSectionOpen }]">
      <v-icon class="chevron ml-1 action-text"
        :icon="filesSectionOpen ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'" size="25"
        @click="filesSectionOpen = !filesSectionOpen"></v-icon>

      <h3 style="margin-bottom: 10px; margin-left: 10px">{{ t('reader.import.file') }}</h3>
      <ul class="listFilesSection"
        :style="[filesSectionOpen ? 'opacity: 1;' : 'opacity: 0; pointer-events: none; cursor: default;']">
        <li v-for="(file, index) in filesList" :key="index" class="fileBox"
          :class="{ selected: selectedFileIndex === index }" style="position: relative;"
          @click="changeSelectedFile(index)">
          <a style="right: 20px; top: 20px; position: absolute; cursor: pointer" @click.stop="removeFile(index)">
            <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
          </a>

          {{ file.name }}
        </li>
      </ul>
    </div>

    <div :style="{
      width: filesSectionShow
        ? (filesSectionOpen ? '30%' : '0%')
        : '0%'
    }"></div>

    <div :style="{
      width: filesSectionShow
        ? (filesSectionOpen ? '70%' : '100%')
        : '100%',
      marginLeft: filesSectionShow ? (isMobile ? '0' : '32px') : '0'
    }">
      <div v-if="uploadSectionShow" class="importSection"
        :style="filesSectionShow == true ? 'width: auto; margin-left: 20px;' : 'margin-left: auto;'">
        <p style="margin-bottom: 10px">{{ t('reader.import.description') }}</p>
        <v-btn class="buttonColor" @click="importFile()">{{ t('button.import') }}</v-btn>
        <div v-if="uploadError" style="color: #d32f2f; font-weight: bold; margin-top: 10px;">
          {{ uploadError }}
        </div>
      </div>
      <br />
      <div v-if="uploadSectionShow" style="opacity: 0.3;">
        <p>**{{ t('reader.import.warning1') }}</p>
        <p>{{ t('reader.import.warning2') }} info.crochyll@gmail.com</p>
      </div>

      <div v-else class="stateContainer" style=" position: relative">
        <!-- State -->
        <div class="stateBox">
          <span v-if="loadingTranslate">
            <v-progress-circular color="var(--action-color)" indeterminate></v-progress-circular>
          </span>

          <span v-else>
            <a style="right: 30px; position: absolute; cursor: pointer" @click="unSelectedFile()">
              <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
            </a>

            <div class="reader-text" :class="{ 'title-section': selectedFile?.state === 0 }"
              style="text-align: left; white-space: pre-line; max-height: 90%; height: 90%; overflow-y: auto;"
              v-html="sanitizedSection" @change="handleMaterialCheckboxChange"></div>

            <div class="btnSection">
              <v-btn class="buttonOutside arrow" style="margin-left: auto; margin-right: 5px" @click="changeState(-1)"
                :disabled="selectedFile?.state == 0">
                <v-icon icon="mdi-undo" size="14"></v-icon>
              </v-btn>
              <v-btn class="buttonOutside arrow" style="margin-right: auto; margin-left: 5px" @click="changeState(1)"
                :disabled="selectedFile && maxState !== null ? selectedFile.state >= maxState : false">
                <v-icon icon="mdi-redo" size="14"></v-icon>
              </v-btn>
            </div>
          </span>
        </div>

        <!-- Tools -->
        <div class="toolSection">
          <!--Compteur-->
          <div class="tools-grid" :style="{ '--grid-cols': GRID_COLUMNS, '--grid-rows': GRID_ROWS }">
            <div v-for="counter in counters" :key="counter.id" class="tool" :style="getCounterStyle(counter)">
              <ToolContainer :id="counter.id" :isActive="activeCounterId === counter.id" :widthSlots="COUNTER_WIDTH"
                :heightSlots="COUNTER_HEIGHT" :slotIndex="counter.slotIndex" :gridColumns="GRID_COLUMNS"
                :gridRows="GRID_ROWS" @click.capture="setActiveCounter(counter.id)"
                @update-position="handleCounterMove(counter, $event)" @remove="removeCounter" class="counter">
                <component :is="Counter" :id="counter.id" :isActive="activeCounterId === counter.id"
                  :model-value="counter.value" @update:model-value="updateCounterValue(counter.id, $event)" />
              </ToolContainer>
            </div>
            <div v-if="showAddButton" class="tool add-counter" :style="getAddCounterStyle()">
              <v-btn class="buttonColor" @click="addCounter"
                style="background-color: var(--dark-color);height: 65px;width: 45px;border-radius: 50px; padding: 8px;">
                <v-icon icon="mdi-plus" size="20" class="ma-auto"></v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#app {
  max-width: initial !important;
}

.stateContainer {
  display: flex;
  align-items: stretch;
}

.stateBox {
  height: auto;
  aspect-ratio: 3 / 2;
  margin: 0 auto;
  background-color: var(--dark-color);
  border-radius: 5px;
  padding: 20px 50px;
  position: relative;
  max-width: 850px;
  max-height: 560px;
  min-height: 400px;
  width: 70%;
}

.stateBox>span {
  display: block;
  height: 100%;
}

.btnSection {
  bottom: 10px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.importSection {
  background-color: var(--dark-color);
  border-radius: 5px;
  height: 350px;
  margin: auto;
  align-content: center;
}

.filesSection {
  background-color: var(--light-color);
  z-index: 994;
  text-align: left;
  padding: 60px 0;
  height: 100vh;
  width: 30%;
  min-width: 300px;
  position: fixed;
  left: 0;
  top: 0;


  transform: translateX(-85%);
  transition: transform 0.3s ease-in-out;
}

.reader-text ::v-deep h3:first-of-type {
  position: sticky;
  top: 0;
  background-color: var(--dark-color);
  z-index: 2;
  padding-top: 20px;
  margin: 0;
}

.reader-text :deep(.pattern-title) {
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
}

.reader-text.title-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.reader-text.title-section :deep(h3:first-of-type) {
  position: static;
  top: auto;
  flex: 0 0 100%;
  margin: auto;
  padding-top: 0;
}

.reader-text :deep(input[type="checkbox"]) {
  accent-color: var(--action-color);
  cursor: pointer;
}

.reader-text :deep(label) {
  cursor: pointer;
}

.reader-text :deep(.reader-material-indent) {
  display: inline-block;
  margin-left: 20px;
}

.filesSection.open {
  transform: translateX(0);
}

.listFilesSection {
  list-style-type: none;
  padding: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fileBox {
  padding: 10px;
  height: 70px;
  cursor: pointer;
  background-color: var(--dark-color);
  margin: 5px 0;
  position: relative;
  padding-left: 20px;
}

.fileBox::before {
  content: "";
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: calc(100% - 10px);
  background-color: orange;
  border-radius: 5px;
}

.fileBox:hover,
.fileBox.selected {
  background-color: var(--action-color);
}

.arrow {
  border-radius: 50px;
  padding: 5px 15px;
  background-color: var(--main-color) !important;
  height: 40px;
  width: 40px;
}

.chevron {
  position: absolute;
  right: 10px;
}

.toolSection {
  display: block;
  width: 30%;
  min-height: 0;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 1), minmax(0, 1fr));
  grid-template-rows: repeat(var(--grid-rows, 2), minmax(0, 1fr));
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.tool {
  min-width: 0;
  min-height: 0;
  padding: 8px;
  box-sizing: border-box;
}

.add-counter {
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter {
  height: 100%;
  min-height: 0;
}

@media (max-width: 1250px) {
  .stateContainer {
    display: block;
  }

  .stateBox {
    width: 100%;
  }

  .toolSection {
    width: 100%;
    margin-top: 16px;
  }

  .tools-grid {
    height: auto;
    grid-template-rows: repeat(var(--grid-rows, 2), 180px);
  }
}

@media (max-width: 650px) {
  .stateContainer {
    width: 80%;
    margin: auto;
  }

  .filesSection {
    transform: translateX(-90%);
  }

  .chevron {
    right: 5px;
  }

}
</style>
