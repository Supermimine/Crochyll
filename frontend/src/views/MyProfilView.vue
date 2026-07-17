<script setup type="ts">
    import MyProfil from '../components/MyProfil/MyProfil.vue';
</script>

<template>
    <Suspense>
        <MyProfil/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>