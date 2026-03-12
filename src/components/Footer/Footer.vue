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
    color: var(--light-color);
    text-align: center;
    padding: 20px 0;
    margin-top: 30px;
    width: 120%;
    left: -10%;
    position: absolute;
}

.link {
    opacity: 0.2;
}
.link:hover {
    opacity: 1;
}

@media (max-width: 650px) {
    .footer {
        width: 100%;
        left: 0;
    }
}
</style>