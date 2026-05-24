<script setup type="ts">
    import CustomItem from '../components/Shop/CustomItem.vue';
</script>

<template>
    <Suspense>
        <CustomItem/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>