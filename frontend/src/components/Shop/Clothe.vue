<script setup lang="ts">
import ShopMenu from '../Menu/ShopMenu.vue';
import Tiles from './Tiles.vue';
import Searchbar from '../Custom/Searchbar.vue';
import { useI18n } from 'vue-i18n'
import { ref } from 'vue';
import { useScreen } from '@/tools/appTools';

import { api } from '@/service/api';

import { Category } from '@core/enum/category';

const { t } = useI18n()
const { isMobile } = useScreen();

const searchRef = ref<InstanceType<typeof Searchbar> | null>(null);

const productsFilter = await api.getProductsByCategory([Category.Accessoires, Category.Clothes]);

const getFilteredProducts = () => {
    return searchRef.value ? searchRef.value.filteredProducts : productsFilter;
};
</script>


<template>
    <ShopMenu />
    <Searchbar :items="productsFilter" ref="searchRef" />

    <div style="left: 0; right: 0; position: fixed; height: 130px;
    backdrop-filter: blur(100px);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%); z-index: 3;"
        :style="{ 'margin-top': isMobile ? '-105px' : '-150px' }"></div>

    <section class="sectionTiles">
        <div v-if="getFilteredProducts().length == 0" style="margin: auto; margin-top: 20px; width: 100%;">
            {{ t('offert.allNoProduct') }}
        </div>
        <router-link v-else v-for="item in getFilteredProducts()" :key="item.id" :to="`/shop/amigurumi/${item.id}`">
            <Tiles :item="item" class="tiles" />
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