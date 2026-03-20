<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref, computed } from 'vue'
import Customization from './Customization.vue';
import Share from './Share.vue';
import ShopMenu from '../Menu/ShopMenu.vue';
import getItem from '../../data/shopData';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

import { Category } from '../../enum/category';
import { Size } from '../../enum/size';
import type { Product } from '@/model/product';

const shareRef = ref<InstanceType<typeof Share> | null>(null);
const customRef = ref<InstanceType<typeof Customization> | null>(null);

const item = getItem(String(window.location.pathname.split('/').pop()));
const quantity = ref(1);
const colorSelected = ref<string | null>(item?.shade && item.shade.length > 0 ? item.shade[0] : null);
const sizeSelected = ref<Size | null>(item?.size && item.size.length > 0 ? item.size[0] : null);

const imgSelected = ref<string>(`/img/${item?.image[0]}`);
const loading = ref(false);

const itemsList = ref<Product[]>([]);

import { useCart } from '@/service/useCart';
import { sleep } from '@/tools/appTools';
const { addCart } = useCart();

const addCartItem = (allCart: boolean = true) => {
  if (!item) return;

  loading.value = true;
  addCart(item, colorSelected.value, sizeSelected.value, quantity.value, itemsList.value, allCart);
  sleep(500).then(() => loading.value = false);
};

const saveItem = (items: Product[]) => {
  itemsList.value = items;
}

const description = computed(() =>
  item?.description?.[locale.value as 'fr' | 'en']
  ?? item?.description?.fr
  ?? ''
)

const schemaOrg = computed(() => ({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": item!.name,
  "image": [item!.image[0]],
  "description": item!.description.fr,
  "offers": {
    "@type": "Offer",
    "price": item!.price,
    "priceCurrency": "CAD",
    "availability": true 
      ? "https://schema.org/InStock" 
      : "https://schema.org"
  }
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(schemaOrg.value)
    }
  ]
})
</script>

<template>
  <ShopMenu />

  <div class="container">
    <div class="mainSection">
      <div class="backgroundImg">
        <div class="imgList">
          <img v-for="(image, index) in item?.image" :key="index" :src="`/img/${image}`" class="imgItem"
            @click="imgSelected = `/img/${image}`"
            :class="imgSelected == `/img/${image}` ? 'action-border-outside' : ''" :alt="image" :title="image" />
        </div>
        <img :src="imgSelected" class="imgDetail" :alt="imgSelected" :title="imgSelected" />
      </div>

      <div class="infoDetail">
        <p style="font-size: 26px;">{{ item?.name ?? '' }}</p>
        <p style="font-size: 30px; margin-bottom: 20px;">${{ item?.price ?? '' }}</p>


        <div v-if="item?.category == Category.Amigurumi">
          <p><strong>{{ t('detail.addAccessory') }}</strong></p>
          <button @click="customRef?.open()">{{ t('detail.personalize') }}</button>
          <div style="display: flex;">
            <div v-for="miniItem in customRef?.itemsList" class="miniImg">
              <img style="width: inherit; border-radius: 5px;" :src="`/img/${miniItem.image[0]}`" :alt="miniItem.image[0]" :title="miniItem.image[0]" />
            </div>
          </div>
        </div>

        <div v-if="item?.size?.length != 0" style="margin-bottom: 20px;">
          <p><strong>{{ t('detail.size') }}</strong></p>
          <button v-for="size in item?.size" :key="size" style="font-size: 12px; margin: 2px;"
            :class="sizeSelected === size ? 'action-border-outside' : ''" @click="sizeSelected = size">{{ size
            }}</button>
        </div>

        <div v-if="item?.shade?.length != 0" style="margin-bottom: 20px;">
          <p><strong>{{ t('detail.color') }}</strong></p>
          <div style="display: flex;">
            <div v-for="shade in item?.shade" :key="shade">
              <span class="colorOption action-border" :class="colorSelected === shade ? 'action-border-outside' : ''"
                @click="colorSelected = shade"></span>
            </div>
          </div>
        </div>

        <p style="margin-top: 50px;"><strong>{{ t('detail.quantity') }}</strong></p>
        <div style="margin: auto; display: flex;">
          <button class="btnQuantity" @click="quantity = Math.max(1, quantity - 1)" :disabled="quantity == 1">-</button>
          <span style="margin: 10px;">{{ quantity }}</span>
          <button class="btnQuantity" @click="quantity++">+</button>
        </div>

        <button style="width: 100%; margin: 2px;" class="buttonColor" @click="addCartItem()">
          <span v-if="loading">
            <v-progress-circular color="var(--action-color)" indeterminate></v-progress-circular>
          </span>
          <span v-else>{{ t('detail.addToCart') }}</span>
        </button>
        <button v-if="customRef?.itemsList && customRef.itemsList.length > 0" class="buttonOutsideInverted"
          style="width: 100%; margin: 2px;" @click="addCartItem(false)">
          <span v-if="loading">
            <v-progress-circular color="var(--action-color)" indeterminate></v-progress-circular>
          </span>
          <span v-else>{{ t('detail.addAccessoryToCart') }}</span>
        </button>
        <button class="buttonOutside" style="width: 100%; margin: 2px;" @click="shareRef?.open()">{{ t('button.share') }}</button>

        <div style="margin-top: 30px;">
          <p style="margin-top: 20px;"><strong>{{ t('detail.description') }}</strong></p>
          <span>{{ description }}</span>
        </div>
      </div>
    </div>

    <div class="secondSection">
      <p style="font-size: 25px; margin-bottom: 20px;"><strong>{{ t('detail.title') }}</strong></p>
      <div style="display: flex;">
        <div style="width: 50%;">
          <p><strong>{{ t('detail.type') }}: </strong> {{ item?.typeMaking }}</p>
          <p><strong>{{ t('detail.creator') }}: </strong> {{ item?.creator }}</p>
          <p><strong>{{ t('detail.measure') }}: </strong> {{ item?.measure }}</p>
          <br />
          <p><strong>{{ t('detail.matter') }}: </strong> {{item?.matter.map(m => m).join(', ')}}</p>
          <p style="display: flex;"><strong>{{ t('detail.maintenance') }}: </strong>
          <div v-for="maintenance in item?.maintenance" :key="maintenance">
            <v-icon :icon="maintenance" size="20" class="ml-1"></v-icon>
          </div>
          </p>
        </div>

        <div style="width: 50%;">
          <strong>{{ t('detail.wool') }}: </strong>
          <br />
          <div style="margin-left: 10px;">
            <div v-for="wool in item?.wool" :key="wool.compagny">
              <p><strong>{{ wool.compagny }} - {{ wool.name }}</strong></p>
              <p>{{ t('detail.size') }}: {{ wool.size }}</p>
              <p>{{ t('detail.color') }}: {{ wool.color }}</p>
              <p>{{ t('detail.composition') }}: {{wool.matter.map(m => `${m.type} (${m.percentage}%)`).join(', ')}}</p>
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Share ref="shareRef" />
  <Customization ref="customRef" @save="saveItem" />
</template>


<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
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

.container {
  margin-top: 80px;
}

.mainSection {
  display: flex;
}

.secondSection {
  margin-top: 80px;
  padding-bottom: 150px;
  text-align: left;
}

.backgroundImg {
  margin-right: 30px;
  width: 50%;
  display: flex;
}

.imgDetail {
  width: 350px;
  height: 350px;
  background-color: var(--dark-color);
  border: 2px solid var(--dark-color);
  border-radius: 5px;
}

.imgList {
  max-width: 120px;
}

.imgItem {
  height: 75px;
  width: 75px;
  max-height: 75px;
  max-width: 75px;
  min-height: 75px;
  min-width: 75px;
  margin: 0 20px 20px 0;
  background-color: var(--dark-color);
  border: 2px solid var(--dark-color);
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

.btnQuantity {
  padding: 0 5px;
  height: 30px;
  width: 30px;
  margin: auto 0;
}

.miniImg {
  width: 30px;
  height: 30px;
  margin: 5px 5px 0 0;
  border-radius: 5px;
  border: 2px solid var(--dark-color);
}

@media screen and (max-width: 1000px) {
  .mainSection {
    display: block;
  }

  .infoDetail {
    width: 100%;
  }
}

@media screen and (max-width: 650px) {
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
