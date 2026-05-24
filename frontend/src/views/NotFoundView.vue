<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import BasicMenu from "@/components/Menu/BasicMenu.vue";

const { t } = useI18n()
const router = useRouter()

const goHome = () => {
    router.push({ name: 'Home' })
}
</script>

<template>
    <BasicMenu />

    <div class="not-found-page">
        <div class="not-found-card">
            <h1>404</h1>
            <h2>{{ t('notFound.title') }}</h2>
            <p>{{ t('notFound.message') }}</p>
            <button class="buttonColor" @click="goHome">{{ t('notFound.buttonHome') }}</button>
        </div>
    </div>
</template>

<style scoped>
.not-found-page {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.not-found-card {
    max-width: 520px;
    width: 100%;
    padding: 40px;
    border-radius: 16px;
    background: var(--dark-color, #ffffff);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.40);
    text-align: center;
}

.not-found-card h1 {
    font-size: 96px;
    margin: 0;
}

.not-found-card h2 {
    font-size: 28px;
    margin: 16px 0 12px;
}

.not-found-card p {
    margin: 0 0 28px;
    color: var(--text-secondary-color, #666666);
}

.buttonColor {
    padding: 12px 28px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
</style>
