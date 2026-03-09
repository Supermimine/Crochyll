<script lang="ts">
</script>

<template>
    <footer class="footer disable-text-select">
        <p>© {{ new Date().getFullYear() }} Crochyll. Tous droits réservés.</p>

        <router-link to="/faq" class="link">FAQ</router-link>
         - 
        <router-link to="/policy" class="link">Politique</router-link>
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