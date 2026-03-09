<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import { getTheme } from "@/tools/appTools";

const theme = useTheme();

theme.global.name.value = getTheme();
document.documentElement.setAttribute("data-theme", theme.global.name.value);

const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = () => {
  const newTheme = isDark.value ? "light" : "dark";

  theme.global.name.value = newTheme;
  localStorage.setItem("theme", newTheme);

  document.documentElement.setAttribute("data-theme", newTheme);
};
</script>

<template>
  <v-icon
    :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent'"
    size="25"
    @click="toggleTheme"
    class="themeIcon"
  />
</template>

<style scoped>
.themeIcon {
  cursor:pointer;
}
.themeIcon:hover {
  color: var(--action-color);
}
</style>