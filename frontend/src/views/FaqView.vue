<script setup type="ts">
    import Faq from '../components/Faq/Faq.vue';
    import { useI18n } from 'vue-i18n'
    const { t } = useI18n()
</script>

<template>
    <Suspense>
        <Faq/>
        <template #fallback>
            <div style="padding: 40px; text-align: center;">{{ t('loading') }}...</div>
        </template>
    </Suspense>
</template>

<style scoped></style>