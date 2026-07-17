<script setup lang="ts">
import theme from '../Custom/Theme.vue';
import language from '../Custom/Language.vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <div
        class="menu-bar"
        style="margin-bottom: 15px; background-color: var(--dark-color); padding: 10px; position: sticky; top: 15px; z-index: 100; text-align: justify; border-radius: 8px; display: flex; box-shadow: rgba(0, 0, 0, 0.15) 5px 10px 10px;">
        <h1 style="font-family: 'Poppins'; color: var(--action-color); font-size: 30px; margin: 0;">Crochyll</h1>

        <div
            class="menu-links"
            style="display: flex; gap: 15px; margin-left: auto; margin-right: auto; margin-top: 5px; font-weight: 500;">
            <router-link to="/shop" style="position: relative; z-index: 10000;">{{ t('category.shop') }}</router-link>
            <router-link to="/maker" style="position: relative; z-index: 10000;">{{ t('category.maker') }}</router-link>
            <router-link to="/reader" style="position: relative; z-index: 10000;">{{ t('category.reader') }}</router-link>
            <router-link to="/learn" style="position: relative; z-index: 10000;">{{ t('category.learn') }}</router-link>
            <router-link to="/myProfil" style="position: relative; z-index: 10000;">{{ t('category.myProject') }}</router-link>
        </div>

        <div class="menu-controls" style="position: absolute; display: flex; right: 10px; top: 15px;">
            <language style="margin: auto; margin-right: 10px;" />
            <theme />
        </div>
    </div>
</template>

<style scoped lang="css">
.menu-bar {
    align-items: center;
}

.menu-links {
    align-items: center;
}

@media (max-width: 770px) {
    .menu-bar {
        flex-direction: column;
        align-items: center;
        gap: 10px;
        text-align: center;
    }

    .menu-links {
        flex-wrap: wrap;
        justify-content: center;
        margin: 0;
        width: 100%;
    }

    .menu-controls {
        position: static;
        justify-content: center;
        width: 100%;
        margin-top: 5px;
    }
}
</style>