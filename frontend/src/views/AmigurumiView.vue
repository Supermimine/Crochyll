<script setup type="ts">
    import Amigurumi from '../components/Shop/Amigurumi.vue';
</script>

<template>
    <Suspense>
        <Amigurumi/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>