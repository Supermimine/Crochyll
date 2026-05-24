<script setup type="ts">
    import Maker from '../components/Maker/Maker.vue';
</script>

<template>
    <Suspense>
        <Maker/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>