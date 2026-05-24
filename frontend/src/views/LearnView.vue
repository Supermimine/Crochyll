<script setup type="ts">
    import Learn from '../components/Learn/Learn.vue';
</script>

<template>
    <Suspense>
        <Learn/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>