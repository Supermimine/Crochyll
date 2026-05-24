<script setup lang="ts">
import { computed } from "vue"
import { currentLocale, setLocale } from "@/i18n"

const isFr = computed(() => currentLocale.value === "fr")

const toggleLanguage = async () => {
  const newLang = isFr.value ? "en" : "fr"

  await setLocale(newLang)

  localStorage.setItem("language", newLang)
}
</script>

<template>
  <span class="languageIcon disable-text-select" style="margin: auto; margin-right: 10px; font-size: small; font-weight: bold;" @click="toggleLanguage">
    {{ isFr ? "EN" : "FR" }}
  </span>
</template>

<style scoped>
.languageIcon {
  cursor: pointer;
}

.languageIcon:hover {
  color: var(--action-color);
}
</style>