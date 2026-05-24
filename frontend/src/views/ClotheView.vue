<script setup type="ts">
    import Clothe from '../components/Shop/Clothe.vue';
</script>

<template>
    <Suspense>
        <Clothe/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>