<script setup lang="ts">
import { ref } from 'vue';
import type { Product } from '@core/model/product';

const props = defineProps<{
    item: Product
}>();

const imgLoading = ref(true);

function onImgLoad() {
    imgLoading.value = false;
}

function onImgError() {
    imgLoading.value = false;
}
</script>


<template>
    <div class="disable-text-select">
        <v-progress-circular v-if="imgLoading" indeterminate color="var(--action-color)" size="50" width="5" />
        <img
            :src="`/img/${props.item?.image[0]}`"
            class="image"
            :alt="props.item?.image[0] || 'image'"
            :title="props.item?.image[0] || ''"
            @load="onImgLoad"
            @error="onImgError"
            :style="{ display: imgLoading ? 'none' : 'block' }"
        />

        <div style="width: 100%; text-align: left;">
            <p class="titleItem">{{ props.item.name }}</p>
            <p style="font-size: 18px;">${{ props.item.price }}</p>
        </div>
    </div>
</template>

<style scoped lang="css">
.image {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 5px;
}

.titleItem {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    font-weight: bold;
}
</style>