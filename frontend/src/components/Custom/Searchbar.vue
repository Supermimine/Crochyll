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
    return props.items.filter(product => {
        let query = searchQuery.value.toLowerCase();
        query = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        return product.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query) ||
            product.keywords.some(keyword => keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query));
    });
});

defineExpose({
    filteredProducts
})
</script>

<template>
    <div style="margin-bottom: 50px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <v-text-field class="search" :label="t('searchBar.label')" density="compact" variant="solo" maxlength="100"
            hide-details="auto" v-model="searchQuery" append-inner-icon="mdi-magnify" />
    </div>
</template>

<style scoped>
</style>