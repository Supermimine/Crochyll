<script setup type="ts">
    import Detail from '../components/Shop/Detail.vue';
</script>

<template>
    <Suspense>
        <Detail/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>