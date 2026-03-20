<script setup lang="ts">
import ShopMenu from '../Menu/ShopMenu.vue';
import Tiles from './Tiles.vue';
import Searchbar from '../Custom/Searchbar.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
import { data } from '../../data/shopData';
import { Category } from '../../enum/category';
import { ref } from 'vue';

const searchRef = ref<InstanceType<typeof Searchbar> | null>(null);

const productsFilter = data.products.filter(item => item.category === Category.Amigurumi);
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