<script setup type="ts">
const setHomePageShop = () => {
    localStorage.setItem('menuIndex', 0);
}
</script>

<template>
    <div class="disable-text-select section">
        <router-link to="/shop" class="box" style="margin-left: auto;" @click="setHomePageShop()">
            <img class="backgroundBox" src="/img/icon-noBG.png" alt="Magasin" title="Magasin" draggable="false" />
            Magasin
        </router-link>

        <router-link to="/reader" class="box" style="margin-right: auto;">
            <img class="backgroundBox" src="/img/icon-noBG.png" alt="Lecteur de patron" title="Lecteur de patron" draggable="false" />
            Lecteur de patron
        </router-link>

        <router-link to="/maker" class="box" style="margin-right: auto;">
            <img class="backgroundBox" src="/img/icon-noBG.png" alt="PatternMaker" title="PatternMaker" draggable="false" />
            PatternMaker
        </router-link>

        <router-link to="/learn" class="box" style="margin-right: auto;">
            <img class="backgroundBox" src="/img/icon-noBG.png" alt="Apprendre" title="Apprendre" draggable="false" />
            Apprendre
        </router-link>
    </div>
</template>

<style scoped>
.section {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.box {
    border-radius: 5px;
    background-color: var(--dark-color);
    height: 200px;
    width: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin: auto;
}

.backgroundBox {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    z-index: -1;
    display: block;
    opacity: 0;
    transform: scale(1);
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.box:hover .backgroundBox {
    opacity: 0.5;
    transform: scale(1.1);
}

@media (max-width: 650px) {
    .backgroundBox {
        width: 300%;
    }
}
</style>