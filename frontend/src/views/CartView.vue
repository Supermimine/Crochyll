<script setup type="ts">
    import Cart from '../components/Cart/Cart.vue';
</script>

<template>
    <Suspense>
        <Cart/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">Chargement...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>