<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <footer class="footer disable-text-select">
        <div class="wave-container">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" style="background-color: var(--main-color);">
                <path d="M0,100 
               C150,0 350,200 500,100 
               L500,200
               L0,200
               Z" style="stroke: none; fill:var(--dark-color);"></path>
            </svg>
        </div>

        <div class="footer-content">
            <p>© {{ new Date().getFullYear() }} Crochyll. {{ t('footer.right') }}</p>

            <div class="d-flex">
                <router-link to="/faq" class="link">{{ t('footer.faq') }}</router-link>
                <span>&nbsp;-&nbsp;</span>
                <router-link to="/policy" class="link">{{ t('footer.policy') }}</router-link>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    position: relative;
    background-color: var(--dark-color);
    color: var(--text-color);
    padding: 0;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    margin-top: 270px;
}

.wave-container {
    display: block;
    position: relative;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
    overflow: hidden;
    padding-bottom: 10%;
}

.wave-container svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.footer-content {
    position: relative;
    z-index: 10;
    opacity: 0.6;
    padding: 20px 0;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.link:hover {
    opacity: 1;
}
</style>