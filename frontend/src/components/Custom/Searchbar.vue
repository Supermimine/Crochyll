<script setup lang="ts">
import type { Product } from '@core/model/product';
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const searchQuery = ref('');

const props = defineProps<{
    items: Product[];
}>();

const filteredProducts = computed(() => {
    const query = searchQuery.value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (!query) return props.items;

    return props.items.filter(product => {
        if (!product || !product.name) return false;

        const nameFr = product.name.fr
            ? product.name.fr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            : "";

        const nameEn = product.name.en
            ? product.name.en.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            : "";

        if (nameFr.includes(query) || nameEn.includes(query)) return true;

        if (product.keywords && Array.isArray(product.keywords)) {
            return product.keywords.some(keyword => {
                if (!keyword) return false;
                return keyword
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .includes(query);
            });
        }

        return false;
    });
});

defineExpose({
    filteredProducts
})
</script>

<template>
    <div class="searchbar-wrapper">
        <v-text-field class="search" :label="t('searchBar.label')" density="compact" variant="solo" maxlength="100"
            hide-details="auto" v-model="searchQuery" append-inner-icon="mdi-magnify" />
    </div>
</template>

<style scoped>
.searchbar-wrapper {
    margin: 0 auto 50px auto;
    max-width: 500px;
    position: sticky;
    top: 60px;
    z-index: 200;
    padding: 0 12px;
}
</style>