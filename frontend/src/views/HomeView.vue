<script setup type="ts">
    import Home from '../components/Home/Home.vue';
</script>

<template>
    <Suspense>
        <Home/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>