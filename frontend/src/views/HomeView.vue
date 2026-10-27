<script setup type="ts">
    import Home from '../components/Home/Home.vue';
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
</script>

<template>
    <Suspense>
        <Home/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">{{ t('loading') }}...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>