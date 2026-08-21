<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { safeStorageGet, safeStorageSet, useScreen } from '@/tools/appTools';
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router';

import logo from '../Custom/Logo.vue';
import theme from '../Custom/Theme.vue';
import language from '../Custom/Language.vue';

const { t } = useI18n()
const { isMobile } = useScreen();
const route = useRoute();

const mobileDetailShow = ref(false);
const savedIndex = safeStorageGet('menuIndex');
let selectedIndex = savedIndex !== null ? parseInt(savedIndex) : 0;

import { useCart } from '@/service/useCart';
const { carts } = useCart();

const menus = [
  { name: 'offert', link: '/shop' },
  { name: 'amigurumi', link: '/shop/amigurumi' },
  { name: 'clothe', link: '/shop/clothe' },
  { name: 'pattern', link: '/shop/pattern' }
];

const changeSelectedIndex = (index: number) => {
  selectedIndex = index;
  safeStorageSet('menuIndex', index.toString());
};

onBeforeMount(() => {
  const currentPath = route.path;

  const exactSubMenuIndex = menus.findIndex(menu =>
    menu.link !== '/shop' && currentPath.startsWith(menu.link)
  );

  if (exactSubMenuIndex !== -1) {
    changeSelectedIndex(exactSubMenuIndex);
    return;
  }

  const foundIndex: number = menus.findIndex(menu => menu.link === currentPath || currentPath === '/shop/');

  if (foundIndex !== -1) {
    changeSelectedIndex(foundIndex);
  }
});
</script>

<template>
  <div v-if="mobileDetailShow" class="overlay" @click="mobileDetailShow = false" />
  <div v-if="mobileDetailShow" class="subShopMenu">
    <ul>
      <li style="float: right; margin: 0 10px 10px 0; display: flex;">
        <language class="unSelectable" />
        <theme class="unSelectable" />
      </li>
      <li v-for="(menu, index) in menus" :key="index" style="width: 100%;">
        <router-link :to="menu.link" :class="{ selected: selectedIndex === index }" @click="changeSelectedIndex(index)">
          {{ t(`menu.${menu.name}`) }}
        </router-link>
      </li>
    </ul>
  </div>


  <ul class="shopMenu">
    <!-- Mobile -->
    <div style="display: flex;" v-if="isMobile">
      <v-icon size="35" class="ml-1 burgerMenu" style="margin: auto auto auto 10px;" icon="mdi-menu"
        @click="mobileDetailShow = !mobileDetailShow"></v-icon>

      <a href="/" style="margin: auto;">
        <logo />
      </a>

      <theme style="opacity: 0;" />

      <router-link to="/cart" :class="{ selected: selectedIndex === menus.length }" style="margin: auto 10px auto auto;"
        @click="changeSelectedIndex(menus.length)">

        <v-icon size="25" icon="mdi-cart"></v-icon>
        <span>({{ carts.length }})</span>
      </router-link>
    </div>

    <!-- Desktop -->
    <div v-else>
      <li><a style="padding: 6px 16px;" href="/">
          <logo />
        </a></li>

      <li v-for="(menu, index) in menus" :key="index">
        <router-link :to="menu.link" :class="{ selected: selectedIndex === index }" @click="changeSelectedIndex(index)">
          {{ t(`menu.${menu.name}`) }}
        </router-link>
      </li>

      <li style="float: right;">
        <router-link to="/cart" :class="{ selected: selectedIndex === menus.length }"
          @click="changeSelectedIndex(menus.length)">
          {{ t('menu.cart') }} ({{ carts.length }})
        </router-link>
      </li>

      <li style="float: right; display: flex;">
        <language class="unSelectable" style="padding: 16px 5px; margin: auto;" />
        <theme class="unSelectable" style="padding: 10px 5px;" />
      </li>
    </div>

  </ul>

</template>

<style scoped>
.shopMenu {
  top: 0;
  left: 0;
  right: 0;
  position: fixed;
  padding: 0;
  background-color: var(--light-color);
  z-index: 995;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);
}

.subShopMenu {
  background-color: var(--light-color);
  z-index: 994;
  display: grid;
  text-align: left;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 80%;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--light-color);
  padding-top: 50px;
}

ul li {
  float: left;
}

ul li a {
  display: block;
  text-align: center;
  padding: 14px 16px;
  color: var(--text-color);
}

ul li a:hover:not(.unSelectable),
ul li a.selected:not(.unSelectable) {
  background-color: var(--action-color);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 994;
  overflow-x: hidden;
}

.burgerMenu {
  float: right;
  margin: 10px 10px 5px 10px;
  cursor: pointer;
}

.logo {
  cursor: pointer;
  overflow: visible;
}

.logo text {
  font-size: 2rem;
  font-weight: 700;
  fill: white;
  font-family: system-ui, sans-serif;
}
</style>