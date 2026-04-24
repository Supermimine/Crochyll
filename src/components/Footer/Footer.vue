<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <footer class="footer disable-text-select">
        <p>© {{ new Date().getFullYear() }} Crochyll. {{ t('footer.right') }}</p>

        <router-link to="/faq" class="link">{{ t('footer.faq') }}</router-link>
         - 
        <router-link to="/policy" class="link">{{ t('footer.policy') }}</router-link>
    </footer>
</template>

<style scoped>
.footer {
    background-color: var(--dark-color);
    color: var(--text-color);
    opacity: 0.6;
    text-align: center;
    padding: 20px 0;
    margin: 30px calc(-50vw + 50%);
    width: 100vw;
    max-width: 100vw;
    position: relative;
    box-sizing: border-box;
}

.link:hover {
    opacity: 1;
}
</style>