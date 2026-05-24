<script setup type="ts">
    import Pattern from '../components/Shop/Pattern.vue';
</script>

<template>
    <Suspense>
        <Pattern/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>