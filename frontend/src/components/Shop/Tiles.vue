<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Product } from '@core/model/product';
import { useScreen } from '@/tools/appTools';
import { useI18n } from 'vue-i18n'

const { isMobile } = useScreen();
const { locale } = useI18n()

const props = withDefaults(defineProps<{
    item: Product,
    isMobileWidth?: boolean
}>(), {
    isMobileWidth: true
});

const imgLoading = ref(true);

function onImgLoad() {
    imgLoading.value = false;
}

function onImgError() {
    imgLoading.value = false;
}

const name = computed(() =>
  props.item?.name?.[locale.value as 'fr' | 'en']
  ?? props.item?.name?.fr
  ?? ''
)
</script>


<template>
    <div class="disable-text-select" :class="{ 'mobile': props.isMobileWidth && isMobile }" :style="{ 'display': props.isMobileWidth && isMobile ? 'flex' : 'block' }">
        <v-progress-circular v-if="imgLoading" indeterminate color="var(--action-color)" size="50" width="5" />
        <img
            :src="`/img/${props.item?.image[0]}`"
            class="image"
            :class="{ 'mobile': props.isMobileWidth && isMobile }"
            :alt="props.item?.image[0] || 'image'"
            :title="props.item?.image[0] || ''"
            @load="onImgLoad"
            @error="onImgError"
            :style="{ display: imgLoading ? 'none' : 'block' }"
        />

        <div style="width: 100%; text-align: left;">
            <p class="titleItem">{{ name }}</p>
            <p style="font-size: 18px;">${{ props.item.price[0] }}</p>
        </div>
    </div>
</template>

<style scoped lang="css">
.image {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 5px;
}
.image.mobile {
    height: 100px;
    width: 100px;
    margin-bottom: 0px;
    border-radius: 5px;
    margin-right: 15px;
}

.titleItem {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    font-weight: bold;
}
</style>