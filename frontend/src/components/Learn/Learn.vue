<script setup type="ts">
import BasicMenu from '../Menu/BasicMenu.vue';
import { useI18n } from 'vue-i18n'
import { useHead } from "@unhead/vue";


const { t } = useI18n()

useHead(() => ({
  title: 'Crochyll - ' + t('category.learn'),
  meta: [
    {
      property: 'og:title',
      content: 'Crochyll - ' + t('category.learn')
    },
    {
      name: 'twitter:title',
      content: 'Crochyll - ' + t('category.learn')
    }
  ]
}))
</script>

<template>
    <BasicMenu />

    Feature à venir ;)
</template>