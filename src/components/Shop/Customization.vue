<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import TilesAccessoires from './TilesAccessoires.vue';
import type { Product } from '@/model/product';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

import { data } from '../../data/shopData';
import getItem from '../../data/shopData';
import { Category } from '../../enum/category';

const isOpen = ref(false);
const isTilesPage = ref(true);

const relatedProduct = getItem(String(window.location.pathname.split('/').pop()));

const productsFilter = data.products.filter(x => x.category === Category.AccessoiresAmigurumi && x.relatedProduct?.includes(relatedProduct?.id ?? ''));
const itemSelected = ref<Product | null>(null);

const colorSelected = ref<string | null>(null);
const imgSelected = ref<string | undefined>(undefined);

const itemsList = ref<Product[]>([]);

const description = computed(() =>
  itemSelected.value?.description?.[locale.value as 'fr' | 'en']
  ?? itemSelected.value?.description?.fr
  ?? ''
)

const open = () => {
  isOpen.value = true;
}
const close = () => {
  if (isTilesPage.value === false) {
    isTilesPage.value = true;
    return;
  }

  emit("save", itemsList.value);
  isOpen.value = false;
};

const selectItem = (item: any) => {
  itemSelected.value = getItem(item.id) as Product;
  isTilesPage.value = false;
  imgSelected.value = `/img/${itemSelected.value.image[0]}`;
  if (itemSelected.value.shade && item.shade.length > 0)
    colorSelected.value = item.shade[0];
}

const addCart = () => {
  const itemToAdd = itemSelected.value;
  if (itemToAdd) {
    itemToAdd.relatedProduct = [relatedProduct?.id ?? ''];
  }

  itemsList.value.push(itemToAdd as Product);

  isTilesPage.value = true;
}

const removeCart = () => {
  const itemToRemove = itemSelected.value;
  itemsList.value = itemsList.value.filter(i => i.id !== itemToRemove?.id && i.relatedProduct?.includes(relatedProduct?.id ?? ''));
  isTilesPage.value = true;
}

defineExpose({
  open, close, itemsList
})

const emit = defineEmits<{
  (e: "save", value: Product[]): void
}>();

watch(isOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>


<template>
  <div v-if="isOpen" class="overlay" @click="close" />

  <aside :class="['drawer', { open: isOpen }]">
    <a class="closeBtn action-text" @click="close"><v-icon icon="mdi-close" size="30" /></a>

    <div v-if="isTilesPage">
      <h2 style="margin-bottom: 50px;">{{ t('customization.title') }}</h2>

      <div class="sectionTiles">
        <p v-if="productsFilter.length == 0">{{ t('customization.noProduct') }}</p>

        <div v-else v-for="item in productsFilter" :key="item.id">
          <TilesAccessoires :item="item" @click="selectItem(item)"
            :class="itemsList.some(i => i.id === item?.id) ? 'action-border-outside' : ''" />
        </div>
      </div>
    </div>

    <div v-else>
      <h2 style="margin-bottom: 50px;">{{ t('customization.detailAccessories') }}</h2>
      <div class="mainSection">
        <div class="backgroundImg">
          <div class="imgList">
            <img v-for="(image, index) in itemSelected?.image" :key="index" :src="`/img/${image}`" class="imgItem"
              @click="imgSelected = `/img/${image}`" :alt="image" :title="image" />
          </div>
          <img :src="imgSelected" class="imgDetail" :alt="imgSelected" :title="imgSelected" />
        </div>

        <div class="infoDetail">
          <p style="font-size: 20px;">{{ itemSelected?.name }}</p>
          <p style="font-size: 30px;">+ ${{ itemSelected?.price.toFixed(2) }}</p>

          <div v-if="itemSelected?.shade?.length != 0" style="margin-bottom: 20px;">
            <p style="margin-top: 20px;"><strong>{{ t('customization.color') }}</strong></p>
            <div style="display: flex;">
              <div v-for="shade in itemSelected?.shade" :key="shade">
                <span class="colorOption action-border" :class="colorSelected === shade ? 'action-border-outside' : ''"
                  @click="colorSelected = shade"></span>
              </div>
            </div>
          </div>

          <button v-if="!itemsList.some(i => i.id === itemSelected?.id)"
            style="width: 100%; margin: 2px; margin-top: 50px;" class="buttonColor" @click="addCart">{{ t('button.add')
            }}</button>
          <button v-else style="width: 100%; margin: 2px; margin-top: 50px;" @click="removeCart">{{ t('button.remove')
          }}</button>

          <div style="margin-top: 30px;">
            <p style="margin-top: 20px;"><strong>{{ t('customization.description') }}</strong></p>
            <span>{{ description}}</span>
          </div>
        </div>
      </div>

      <div class="secondSection">
        <p style="font-size: 25px; margin-bottom: 20px;"><strong>{{ t('customization.detail') }}</strong></p>
        <div style="display: flex;">
          <div style="width: 50%;">
            <p><strong>{{ t('customization.type') }}: </strong> {{ itemSelected?.typeMaking }}</p>
            <p><strong>{{ t('customization.creator') }}: </strong> {{ itemSelected?.creator }}</p>
            <p><strong>{{ t('customization.measure') }}: </strong> {{ itemSelected?.measure }}</p>
            <br />
            <p><strong>{{ t('customization.matter') }}: </strong> {{itemSelected?.matter.map(m => m).join(', ')}}</p>
            <p style="display: flex;"><strong>{{ t('customization.maintenance') }}: </strong>
            <div v-for="maintenance in itemSelected?.maintenance" :key="maintenance">
              <v-icon :icon="maintenance" size="20" class="ml-1"></v-icon>
            </div>
            </p>
          </div>

          <div style="width: 50%;">
            <strong>{{ t('customization.wool') }}: </strong>
            <br />
            <div style="margin-left: 10px;">
              <div v-for="wool in itemSelected?.wool" :key="wool.compagny">
                <p><strong>{{ wool.compagny }} - {{ wool.name }}</strong></p>
                <p>{{ t('customization.size') }}: {{ wool.size }}</p>
                <p>{{ t('customization.color') }}: {{ wool.color }}</p>
                <p>{{ t('customization.composition') }}: {{wool.matter.map(m => `${m.type}
                  (${m.percentage}%)`).join(',')}}</p>
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>


<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 80vw;
  max-width: 1200px;
  height: 100vh;
  background-color: var(--main-color);
  z-index: 999;
  text-align: justify;

  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;

  padding: 50px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);
  overflow: scroll;
}

.drawer.open {
  transform: translateX(0);
}

.closeBtn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  margin: 13px 26px;
}

.sectionTiles {
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.mainSection {
  display: flex;
}

.secondSection {
  margin-top: 80px;
  margin-bottom: 150px;
  text-align: left;
}

.backgroundImg {
  margin-right: 30px;
  width: 50%;
  display: flex;
}

.imgDetail {
  width: 300px;
  height: 300px;
  background-color: var(--dark-color);
  border: 2px solid var(--dark-color);
  border-radius: 5px;
}

.imgList {
  max-width: 120px;
}

.imgItem {
  width: 75px;
  height: 75px;
  margin: 0 20px 20px 0;
  background-color: var(--dark-color);
  border-radius: 5px;
}

.imgItem:hover {
  cursor: pointer;
  border: 2px solid var(--action-color);
}

.infoDetail {
  width: 50%;
  max-width: 450px;
  text-align: left;
}

.colorOption {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  border: 3px solid var(--dark-color);
  display: inline-block;
  margin: 2px;
}

@media screen and (max-width: 1000px) {
  .mainSection {
    display: block;
  }

  .infoDetail {
    width: 100%;
  }
}

@media (max-width: 650px) {
  .drawer {
    width: 100%;
    padding: 30px 15px;
  }

  .backgroundImg {
    width: 100%;
    flex-direction: column-reverse;
  }

  .imgList {
    display: flex;
    max-width: 100%;
    margin: auto;
    margin-top: 10px;
  }

  .imgDetail {
    width: 100%;
    height: auto;
    max-width: 350px;
    margin: auto;
  }
}
</style>
