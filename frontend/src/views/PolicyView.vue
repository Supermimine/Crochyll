<script setup type="ts">
    import Policy from '../components/Policy/Policy.vue';
</script>

<template>
    <Suspense>
        <Policy/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>