<script setup lang="ts">
import type { Product } from '@/model/product';

defineProps<{
    item: Product
}>();
</script>


<template>
    <div class="disable-text-select">
        <img :src="`/img/${item?.image[0]}`" class="image" :alt="item?.image[0]" :title="item?.image[0]" />

        <div style="width: 100%; text-align: left;">
            <p class="titleItem">{{ item.name }}</p>
            <p style="font-size: 18px;">${{ item.price }}</p>
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