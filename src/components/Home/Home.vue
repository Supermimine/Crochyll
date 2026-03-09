<script setup lang="ts">
import Categories from './Categories.vue';
import theme from '../Custom/Theme.vue';
import Footer from '../Footer/Footer.vue';
</script>

<template>
  <theme style="position: fixed; top: 12px; right: 12px;" />

  <h1 style="margin-bottom: 8px; font-family: 'Poppins'; color: var(--action-color);">Crochyll</h1>
  <h5 style="margin-bottom: 15px;" class="disable-text-select">Ou voulez-vous aller ?</h5>

  <Categories />

  <Footer class="footer" />
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
}

@media (max-width: 650px) {
  .footer {
    margin-top: 200px;
    position: relative;
  }
}
</style>
