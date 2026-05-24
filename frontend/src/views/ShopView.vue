<script setup type="ts">
import Shop from '../components/Shop/Shop.vue';
</script>

<template>
    <Suspense>
        <Shop/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>