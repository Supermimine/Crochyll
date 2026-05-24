<script setup lang="ts">
import ShopMenu from '../Menu/ShopMenu.vue';
import Tiles from './Tiles.vue';
import Searchbar from '../Custom/Searchbar.vue';
import { useI18n } from 'vue-i18n'
import { ref } from 'vue';

import { api } from '@/service/api';

const { t } = useI18n()
import { Category } from '@core/enum/category';

const searchRef = ref<InstanceType<typeof Searchbar> | null>(null);

const productsFilter = await api.getProductsByCategory(Category.Amigurumi);
const getFilteredProducts = () => {
    return searchRef.value ? searchRef.value.filteredProducts : productsFilter;
};
</script>


<template>
    <ShopMenu />
    <Searchbar :items="productsFilter" ref="searchRef" />

    <section class="sectionTiles">
        <router-link v-if="getFilteredProducts().length > 0" v-for="item in getFilteredProducts()" :key="item.id" :to="`/shop/amigurumi/${item.id}`">
            <Tiles :item="item" class="tiles" />
        </router-link>

        <router-link class="tiles" style="width: 185px; height: 230px;" :to="`/shop/custom`">
            <p>{{ t('offert.personalize') }}</p>
        </router-link>
    </section>
</template>

<style scoped lang="css">
.sectionTiles {
    margin-top: 25px;
    display: flex;
    flex-wrap: wrap;
    gap: 80px 50px;
    padding-bottom: 100px;
    justify-content: center;
}

@media (max-width: 650px) {
    .sectionTiles {
        gap: 10px 5px;
    }
}
</style>