<script setup lang="ts">
import ShopMenu from '../Menu/ShopMenu.vue';
import Footer from '../Footer/Footer.vue';
import Searchbar from '../Custom/Searchbar.vue';
import Tiles from './Tiles.vue';
import { useI18n } from 'vue-i18n'
import { useScreen } from '@/tools/appTools';

import { api } from '@/service/api';

const { t } = useI18n()
const { isMobile } = useScreen();
import { ref } from 'vue';
import { Category } from '@core/enum/category';
import type { Product } from '@core/model/product';

const searchRef = ref<InstanceType<typeof Searchbar> | null>(null);

const productsFilter: Product[] = await api.getProducts() || [];
const getFilteredProducts = () => {
    return searchRef.value ? searchRef.value.filteredProducts : productsFilter;
};

const getNewProducts = () => {
    return getFilteredProducts().slice(-5);
};
const getAmigurumiProducts = () => {
    return getFilteredProducts().filter(item => item.category == Category.Amigurumi || item.category == Category.AccessoiresAmigurumi).slice(0, 10);
};
const getClotheProducts = () => {
    return getFilteredProducts().filter(item => item.category == Category.Clothes).slice(0, 10);
};
const getAccessoriesProducts = () => {
    return getFilteredProducts().filter(item => item.category == Category.Accessoires).slice(0, 10);
};
const getPatternProducts = () => {
    return getFilteredProducts().filter(item => item.category == Category.Pattern).slice(0, 10);
};

const dynamicUrl = (item: Product) => {
    switch (item.category) {
        case Category.Amigurumi:
        case Category.AccessoiresAmigurumi:
            return `/shop/amigurumi/${item.id}`;
        case Category.Clothes:
        case Category.Accessoires:
            return `/shop/clothe/${item.id}`;
        case Category.Pattern:
            return `/shop/pattern/${item.id}`;
        default:
            return '/shop';
    }
};

const changeSelectedIndex = (index: number) => {
    localStorage.setItem('menuIndex', index.toString());
};
</script>


<template>
    <ShopMenu />
    <Searchbar :items="productsFilter" ref="searchRef" style="position: sticky;" />

    <div style="left: 0; right: 0; position: fixed; height: 130px;
    backdrop-filter: blur(100px);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%); z-index: 3;"
        :style="{ 'margin-top': isMobile ? '-105px' : '-150px' }"></div>

    <section style="padding: 0.5rem;">
        <div v-if="getFilteredProducts().length == 0" style="margin: auto; margin-top: 20px;">
            {{ t('offert.allNoProduct') }}
        </div>
        <div v-else>
            <div class="sectionBox disable-text-select">
                <div class="sectionSubtitle">
                    <p style="text-align: left;">{{ t('offert.newArrival') }}</p>
                </div>
                <hr style="margin: 10px 0 10px 0;" />
                <div class="sectionTiles">
                    <router-link v-if="getNewProducts().length != 0" v-for="item in getNewProducts()" :key="item.id"
                        :to="dynamicUrl(item)" class="slide">
                        <Tiles :item="item" :is-mobile-width="false" class="tiles" />
                    </router-link>
                    <div v-else style="margin: auto;">
                        {{ t('offert.noProduct') }}
                    </div>
                </div>
            </div>

            <div class="sectionBox disable-text-select">
                <div class="sectionSubtitle">
                    <p style="text-align: left;">{{ t('offert.amigurumi') }}</p>
                    <a class="showMore" href="/shop/amigurumi" @click="changeSelectedIndex(1)">{{ t('offert.showMore')
                        }}</a>
                </div>
                <hr style="margin: 10px 0 10px 0;" />
                <div class="sectionTiles">
                    <router-link v-if="getAmigurumiProducts().length != 0" v-for="item in getAmigurumiProducts()"
                        :key="item.id" :to="dynamicUrl(item)" class="slide">
                        <Tiles :item="item" :is-mobile-width="false" class="tiles" />
                    </router-link>
                    <div v-else style="margin: auto;">
                        {{ t('offert.noProduct') }}
                    </div>
                </div>
            </div>

            <div class="sectionBox disable-text-select">
                <div class="sectionSubtitle">
                    <p style="text-align: left;">{{ t('offert.clothe') }}</p>
                    <a class="showMore" href="/shop/clothe" @click="changeSelectedIndex(2)">{{ t('offert.showMore')
                        }}</a>
                </div>
                <hr style="margin: 10px 0 10px 0;" />
                <div class="sectionTiles">
                    <router-link v-if="getClotheProducts().length != 0" v-for="item in getClotheProducts()"
                        :key="item.id" :to="dynamicUrl(item)" class="slide">
                        <Tiles :item="item" :is-mobile-width="false" class="tiles" />
                    </router-link>
                    <div v-else style="margin: auto;">
                        {{ t('offert.noProduct') }}
                    </div>
                </div>
            </div>

            <div class="sectionBox disable-text-select">
                <div class="sectionSubtitle">
                    <p style="text-align: left;">{{ t('offert.accessories') }}</p>
                    <a class="showMore" href="/shop/clothe" @click="changeSelectedIndex(2)">{{ t('offert.showMore')
                        }}</a>
                </div>
                <hr style="margin: 10px 0 10px 0;" />
                <div class="sectionTiles">
                    <router-link v-if="getAccessoriesProducts().length != 0" v-for="item in getAccessoriesProducts()"
                        :key="item.id" :to="dynamicUrl(item)" class="slide">
                        <Tiles :item="item" :is-mobile-width="false" class="tiles" />
                    </router-link>
                    <div v-else style="margin: auto;">
                        {{ t('offert.noProduct') }}
                    </div>
                </div>
            </div>

            <div class="sectionBox disable-text-select">
                <div class="sectionSubtitle">
                    <p style="text-align: left;">{{ t('offert.pattern') }}</p>
                    <a class="showMore" href="/shop/pattern" @click="changeSelectedIndex(3)">{{ t('offert.showMore')
                        }}</a>
                </div>
                <hr style="margin: 10px 0 10px 0;" />
                <div class="sectionTiles">
                    <router-link v-if="getPatternProducts().length != 0" v-for="item in getPatternProducts()"
                        :key="item.id" :to="dynamicUrl(item)" class="slide">
                        <Tiles :item="item" :is-mobile-width="false" class="tiles" />
                    </router-link>
                    <div v-else style="margin: auto;">
                        {{ t('offert.noProduct') }}
                    </div>
                </div>
            </div>
        </div>

    </section>

    <Footer />
</template>

<style scoped lang="css">
.sectionBox {
    margin-bottom: 80px;
}

.sectionTiles {
    margin-left: 50px !important;
    margin-right: 50px !important;
    margin: auto;
    display: flex;
    gap: 15px;
    height: 265px;
    align-content: flex-start;

    overflow-x: auto;
    scroll-snap-type: x mandatory;
}

.slide {
    color: var(--text-color) !important;
    flex: 0 0 calc(23.333% - 14px);
    scroll-snap-align: start;
    transition: transform 0.3s ease;
    margin: auto 0;
}

.slide:hover {
    transform: translateY(-5px);
}

.showMore {
    margin-left: auto;
    margin-right: 50px;
}

.sectionSubtitle {
    display: flex;
}

p {
    font-weight: 600;
}

@media (max-width: 650px) {
    .sectionTiles {
        margin-left: 5px !important;
        margin-right: 5px !important;
        height: 250px;
    }

    .showMore {
        margin-right: 0;
    }
}
</style>