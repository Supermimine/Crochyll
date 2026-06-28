<script setup type="ts">
    import MyProject from '../components/MyProject/MyProject.vue';
</script>

<template>
    <Suspense>
        <MyProject/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>