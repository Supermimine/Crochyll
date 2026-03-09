<script setup type="ts">
import logo from '/img/icon-noBG.png';

</script>

<template>
    <div class="logo">
        <span class="logo-text">Crochyll</span>
        <img :src="logo" alt="Abeille" title="Abeille" class="bee">
    </div>
</template>

<style lang="css" scoped>
.logo {
    position: relative;
    display: inline-block;
    font-family: 'Poppins';
    font-size: 26.5px;
    font-weight: 700;
    cursor: pointer;
    user-select: none;
}

.logo-text {
    position: relative;
    z-index: 1;
}

.bee {
    position: absolute;
    width: 22px;
    top: 12px;
    right: -18px;

    offset-path: path("M0,0 C-25,-18 -60,25 -95,0 C-70,-15 -35,20 0,0");
    offset-rotate: auto;

    offset-distance: 0%;

    transition: offset-distance 0.3s ease;

    animation: idleFloat 3s ease-in-out infinite;
}

.logo:hover .bee {
    animation:
        flyPath 2.2s ease-in-out forwards,
        wingFlap 0.15s linear infinite;
}

@keyframes flyPath {
    0% {
        offset-distance: 0%;
    }

    40% {
        offset-distance: 60%;
    }

    70% {
        offset-distance: 90%;
    }

    100% {
        offset-distance: 100%;
    }
}

@keyframes wingFlap {
    0% {
        transform: scale(1) rotate(0deg);
    }

    50% {
        transform: scale(1.05) rotate(1deg);
    }

    100% {
        transform: scale(1) rotate(0deg);
    }
}

@keyframes idleFloat {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-2px);
    }

    100% {
        transform: translateY(0px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .bee {
        animation: none !important;
    }
}
</style>