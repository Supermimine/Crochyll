<script setup lang="ts">
import type { Product } from '@/model/product';

defineProps<{
    item: Product
}>();
</script>


<template>
    <div class="tilesAccessoires action-border">
        <img :src="`/img/${item.image[0]}`" class="image" :alt="item.image[0]" :title="item.image[0]" />
    </div>
</template>

<style scoped lang="css">
.tilesAccessoires {
    background-color: var(--dark-color);
    width: 125px;
    height: 125px;
    border-radius: 5px;
    border: 2px solid var(--dark-color);
    display: flex;
}

.image {
    background-color: var(--dark-color);
    height: 95%;
    width: 95%;
    border-radius: 5px;
    margin: auto;
}
</style>