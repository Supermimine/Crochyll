<script setup lang="ts">
import { ref, watchEffect, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

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
import Counter from "./Counter.vue";

import type { FilePattern } from "@core/model/filepattern";
import { getPatternSection } from "@/tools/pdf/reader/pdfPattern";

const filesList = ref<FilePattern[]>(JSON.parse(localStorage.getItem("files") || "[]"));
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
  const storageValue = localStorage.getItem("files");
  const files: FilePattern[] = storageValue ? JSON.parse(storageValue) : [];

  files.push(file);
  filesList.value = files;

  localStorage.setItem("files", JSON.stringify(files));
};
const removeFile = (index: number) => {
  const storageValue = localStorage.getItem("files");
  const files: FilePattern[] = storageValue ? JSON.parse(storageValue) : [];

  files.splice(index, 1);
  filesList.value = files;

  localStorage.setItem("files", JSON.stringify(files));

  unSelectedFile();

  if (filesList.value.length === 0) {
    filesSectionShow.value = false;
  }
};

const changeSelectedFile = (index: number) => {
  selectedFileIndex.value = index;
  uploadSectionShow.value = false;

  selectedFile.value = filesList.value[index];
};
const unSelectedFile = () => {
  selectedFileIndex.value = null;
  uploadSectionShow.value = true;
  selectedFile.value = null;
};

const editFile = () => {
  const storageValue = localStorage.getItem("files");
  const files: FilePattern[] = storageValue ? JSON.parse(storageValue) : [];

  if (!selectedFile.value) return;

  const index = files.findIndex((entry) => entry.name === selectedFile.value!.name);

  if (index !== -1) {
    files[index] = selectedFile.value;
    localStorage.setItem("files", JSON.stringify(files));
  }
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
  finalSections.push(`<h3 style="margin: 100px 0;text-align: center;"><b>${patternTitle}</b></h3>`);


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

  const materials = `<h3><b>Materials</b></h3><span>${patternHookSize}</span>
    ${[
      patternMaterialsResult.materials[1] ? `<span>Needles</span><br/>` : '',
      patternMaterialsResult.materials[2] ? `<span>Marker</span><br/>` : '',
      patternMaterialsResult.materials[3] ? `<span>Stuffing</span><br/>` : '',
      patternMaterialsResult.materials[4] ? `<span>Safety eyes</span><br/>` : '',
    ].filter(Boolean).join('')}<span>Yarns:</span>
    ${yarns.map((y: string) => `<span style="margin-left: 20px;">- ${y}</span><br/>`).join('')}`;

  finalSections.push(materials);


  // Project size
  const patternSize = getPatternSize(sections);
  if (patternSize) {
    finalSections.push(`<h3><b>Size</b></h3><span>${patternSize}</span>`);
  }


  // Abbreviations
  const patternAbbreviationsResult = getPatternAbbreviations(sections, lang as 'fra' | 'eng');
  if (patternAbbreviationsResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternAbbreviationsResult.sectionIndex);
  }
  finalSections.push(`<h3><b>Abbreviations</b></h3>${patternAbbreviationsResult.abbreviations}`);


  // Gauge
  const patternGaugeResult = getPatternGauge(sections, lang as 'fra' | 'eng');
  if (patternGaugeResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternGaugeResult.sectionIndex);
  }
  if (patternGaugeResult.gauge) {
    finalSections.push(`<h3><b>Gauge</b></h3><span>${patternGaugeResult.gauge}</span>`);
  }


  // Tips/info
  const patternTipsResult = getPatternTips(sections, lang as 'fra' | 'eng');
  if (patternTipsResult.sectionIndex !== null) {
    lastIndexCheck = Math.max(lastIndexCheck ?? 0, patternTipsResult.sectionIndex);
  }
  if (patternTipsResult.tips) {
    finalSections.push(`<h3><b>Tips</b></h3><span>${patternTipsResult.tips}</span>`);
  }


  //Pattern
  lastIndexCheck = lastIndexCheck ? lastIndexCheck + 1 : 0;
  const lastSection = sections.slice(lastIndexCheck).join(' ').trim();
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

    translatedSection.value = await translate(currentSection, lang, language());
  } catch (error) {
    translatedSection.value = "Erreur de traduction";
  } finally {
    loadingTranslate.value = false;
  }
};

interface CounterItem {
  id: number
}
const counters = ref<CounterItem[]>([
  { id: 1 }
])
const activeCounterId = ref<number | null>(null)
const showAddButton = ref(true)

const addCounter = () => {
  const newId = Date.now()
  counters.value.push({ id: newId })
  activeCounterId.value = newId

  if (counters.value.length >= 2) {
    showAddButton.value = false
  }
}
const removeCounter = (id: number) => {
  counters.value = counters.value.filter(c => c.id !== id)

  if (activeCounterId.value === id) {
    activeCounterId.value = null
  }

  showAddButton.value = true
}

const setActiveCounter = (id: number) => {
  activeCounterId.value = id
}

watchEffect(() => {
  showSection();
});

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
</script>

<template>
  <BasicMenu />

  <div style="display: flex">
    <!-- Menu -->
    <div v-if="filesSectionShow" :class="['filesSection', { open: filesSectionOpen }]">
      <v-icon style="position: absolute; right: 10px;"
        :icon="filesSectionOpen ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'" size="25"
        class="ml-1 action-text" @click="filesSectionOpen = !filesSectionOpen"></v-icon>

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
        ? (filesSectionOpen ? '30%' : '5%')
        : '0%'
    }"></div>

    <div :style="{
      width: filesSectionShow
        ? (filesSectionOpen ? '70%' : '90%')
        : '100%',
      marginLeft: filesSectionShow ? '32px' : '0'
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

      <div v-else style="margin-left: 20px; position: relative">
        <!-- State -->
        <div style="
            background-color: var(--dark-color);
            border-radius: 5px;
            padding: 20px 50px;
          ">
          <span v-if="loadingTranslate">
            <v-progress-circular color="var(--action-color)" indeterminate></v-progress-circular>
          </span>

          <span v-else>
            <a style="right: 30px; position: absolute; cursor: pointer" @click="unSelectedFile()">
              <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
            </a>
            <div style="text-align: left; white-space: pre-line;" v-html="sanitizedSection"></div>

            <div style="display: flex; margin-top: 50px">
              <v-btn class="buttonOutside arrow" style="margin-left: auto; margin-right: 5px" @click="changeState(-1)"
                :disabled="selectedFile?.state == 0">
                -
              </v-btn>
              <v-btn class="buttonOutside arrow" style="margin-right: auto; margin-left: 5px" @click="changeState(1)"
                :disabled="selectedFile && maxState !== null ? selectedFile.state >= maxState : false">
                +
              </v-btn>
            </div>
          </span>
        </div>

        <!-- Tools -->
        <div style="display: flex;">
          <!--Compteur-->
          <div v-for="counter in counters" :key="counter.id" style="width: 50%;">
            <Counter :id="counter.id" :isActive="activeCounterId === counter.id" @click="setActiveCounter(counter.id)"
              @remove="removeCounter" />
          </div>

          <div v-if="showAddButton" style="width: 50%;">
            <v-btn class="buttonColor" @click="addCounter"
              style="margin: auto; background-color: var(--dark-color);height: 45px;width: 45px;border-radius: 50px; margin-top: 100px; padding: 8px;">
              <v-icon icon="mdi-plus" size="20" class="ma-auto"></v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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


  transform: translateX(-80%);
  transition: transform 0.3s ease-in-out;
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
</style>
