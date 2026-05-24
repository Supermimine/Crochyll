<script setup type="ts">
    import Faq from '../components/Faq/Faq.vue';
</script>

<template>
    <Suspense>
        <Faq/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>