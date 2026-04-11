<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import { getTheme } from "@/tools/appTools";

const theme = useTheme();

// Initialize theme
const initialTheme = getTheme();
theme.change(initialTheme);
document.documentElement.setAttribute("data-theme", initialTheme);

const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = () => {
  const newTheme = isDark.value ? "light" : "dark";

  theme.change(newTheme);
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