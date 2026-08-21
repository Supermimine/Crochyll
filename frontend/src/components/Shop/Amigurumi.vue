<script setup lang="ts">
import ShopMenu from '../Menu/ShopMenu.vue';
import Tiles from './Tiles.vue';
import Searchbar from '../Custom/Searchbar.vue';
import { useI18n } from 'vue-i18n'
import { ref } from 'vue';
import { useScreen } from '@/tools/appTools';
import { Category } from '@core/enum/category';

import { api } from '@/service/api';
import { useHead } from '@unhead/vue';

const { t } = useI18n()
const { isMobile } = useScreen();

const searchRef = ref<InstanceType<typeof Searchbar> | null>(null);

const productsFilter = await api.getProductsByCategory([Category.Amigurumi]);
const getFilteredProducts = () => {
    return searchRef.value ? searchRef.value.filteredProducts : productsFilter;
};

useHead({
  title: 'Crochyll - Amigurumi',
  meta: [
    {
      property: 'og:title',
      content: 'Crochyll - Amigurumi'
    },
    {
      name: 'twitter:title',
      content: 'Crochyll - Amigurumi'
    }
  ]
})
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
        <router-link v-if="getFilteredProducts().length > 0" v-for="item in getFilteredProducts()" :key="item.id"
            :to="`/shop/amigurumi/${item.id}`">
            <Tiles :item="item" class="tiles" />
        </router-link>

        <router-link class="tiles" style="width: 185px;" :to="`/shop/custom`" :class="{ 'mobile': isMobile }"
            :style="{ height: isMobile ? '123px' : '230px' }">
            <p><b>{{ t('offert.personalize') }}</b></p>
            <p style="font-size: 14px;">{{ t('offert.personalizeDescription') }}</p>
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