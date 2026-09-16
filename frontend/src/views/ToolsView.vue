<script setup type="ts">
    import Tools from '../components/Tools/Tools.vue';
</script>

<template>
    <Suspense>
      <Tools/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>