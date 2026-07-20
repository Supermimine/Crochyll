<script setup lang="ts">
import { computed } from "vue"
import { currentLocale, setLocale } from "@/i18n"
import { safeStorageSet } from "@/tools/appTools"

const isFr = computed(() => currentLocale.value === "fr")

const toggleLanguage = async () => {
  const newLang = isFr.value ? "en" : "fr"

  await setLocale(newLang)

  safeStorageSet("language", newLang)
}
</script>

<template>
  <router-link to="" class="languageIcon disable-text-select" style="font-size: small; font-weight: bold;" @click.prevent="toggleLanguage">
    {{ isFr ? "EN" : "FR" }}
  </router-link>
</template>

<style scoped>
.languageIcon {
  cursor: pointer;
}

.languageIcon:hover {
  color: var(--action-color);
}
</style>