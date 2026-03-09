<script setup lang="ts">
import { ref, watchEffect } from "vue";

import translate from "@/tools/translate";
import { language } from "../../tools/appTools";
import { importPdfFile } from "@/tools/pdf/fileImport.service";

import BasicMenu from "../Menu/BasicMenu.vue";
import Counter from "./Counter.vue";

import type { FilePattern } from "@/model/filepattern";

const filesList = ref<FilePattern[]>(JSON.parse(localStorage.getItem("files") || "[]"));
const filesSectionShow = ref(filesList.value.length > 0);
const filesSectionOpen = ref(true);

const selectedFileIndex = ref<number | null>(null);
const selectedFile = ref<FilePattern | null>(null);
const uploadSectionShow = ref(selectedFileIndex.value == null ? true : false);

const loadingImport = ref(false);

const keywordsByConcept: Record<string, Record<string, string[]>> = {
  material: {
    fra: ["materiel", "materiaux", "mat."],
    eng: ["material", "materials", "equipment", "supplies", "mat."],
  },
  yarn: {
    fra: ["laine", "laines"],
    eng: ["wool", "wl", "wools", "yarn", "yarns", "yrn"],
  },
  size: {
    fra: ["taille", "grandeur", "dimension"],
    eng: ["size", "dimension"],
  },
  measurement: {
    fra: ["mesure", "mesures"],
    eng: ["measurement", "measurements"],
  },
  information: {
    fra: ["information", "informations"],
    eng: ["information", "informations"],
  },
  abbreviation: {
    fra: ["Abréviation", "Abréviations"],
    eng: ["abbreviation", "abbreviations"],
  },
  round: {
    fra: ["tour", "tours", "rang", "rangs", "rg", "rgs"],
    eng: ["round", "rounds", "rnd", "rnds", "row", "rows", "rw", "rws"],
  },
};

const importFile = async () => {

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/pdf";

  input.onchange = async (e) => {
    try {
      loadingImport.value = true;
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const pattern = await importPdfFile(file);
      if (!pattern) return;

      addFile(pattern);
      filesSectionShow.value = true;
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
type Concept = keyof typeof keywordsByConcept;

const showSection = async () => {
  const sections = selectedFile.value?.content?.toString().split("***SECTION***") ?? [];
  const lang = selectedFile.value?.lang ?? "fra";

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const otherConcepts = (Object.keys(keywordsByConcept) as Concept[]).filter(
    (c) => c !== "round"
  );

  const otherKeywords = otherConcepts
    .flatMap((concept) => keywordsByConcept[concept][lang] ?? [])
    .map((k) => escapeRegex(normalize(k)));

  const roundKeywords = (keywordsByConcept.round?.[lang] ?? []).map((k) =>
    escapeRegex(normalize(k))
  );

  const otherRegex = new RegExp(`\\b(${otherKeywords.join("|")})\\b`);
  const roundRegex = new RegExp(`\\b(${roundKeywords.join("|")})\\b`);

  const filtrer = sections.filter((section) => {
    const normalizedSection = normalize(section);

    if (roundRegex.test(normalizedSection)) {
      return true;
    }

    const match = section.match(/<h3>(.*?)<\/h3>/i);
    if (!match) return false;

    const normalizedTitle = normalize(match[1]);

    return otherRegex.test(normalizedTitle);
  });

  if (!filtrer || selectedFile.value?.state == null) {
    translatedSection.value = "";
    return;
  }

  loadingTranslate.value = true;

  try {
    const currentSection = filtrer[selectedFile.value.state];
    if (language() == lang.substring(0, 2)) {
      translatedSection.value = currentSection;
    }

    translatedSection.value = await translate(currentSection, lang, language());
  } catch (error) {
    console.error(error);
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
</script>

<template>
  <BasicMenu />

  <div style="display: flex">
    <!-- Menu -->
    <div v-if="filesSectionShow" :class="['filesSection', { open: filesSectionOpen }]">
      <v-icon style="position: absolute; right: 10px;"
        :icon="filesSectionOpen ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'" size="25"
        class="ml-1 action-text" @click="filesSectionOpen = !filesSectionOpen"></v-icon>

      <h3 style="margin-bottom: 10px; margin-left: 10px">Fichiers importés</h3>
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
      <div v-if="uploadSectionShow" class="importSection" :style="filesSectionShow == true ? 'width: auto; margin-left: 20px;' : 'margin-left: auto;'">
        <p style="margin-bottom: 10px">Importer un fichier PDF ou autres formats</p>
        <button class="buttonColor" @click="importFile()">Importer</button>
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
            <div style="text-align: left; white-space: pre-line;" v-html="translatedSection"></div>

            <div style="display: flex; margin-top: 50px">
              <button class="buttonOutside arrow" style="margin-left: auto; margin-right: 5px" @click="changeState(-1)"
                :disabled="selectedFile?.state == 0">
                -
              </button>
              <button class="buttonOutside arrow" style="margin-right: auto; margin-left: 5px" @click="changeState(1)">
                +
              </button>
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
            <button class="buttonColor" @click="addCounter"
              style="margin: auto; background-color: var(--dark-color);height: 45px;width: 45px;border-radius: 50px; margin-top: 100px; padding: 8px;">
              <v-icon icon="mdi-plus" size="20" class="ma-auto"></v-icon>
            </button>
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
