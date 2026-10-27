<script setup type="ts">
    import Learn from '../components/Learn/Learn.vue';
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
</script>

<template>
    <Suspense>
        <Learn/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">{{ t('loading') }}...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>