<script setup type="ts">
import logo from '../Custom/Logo.vue';
import theme from '../Custom/Theme.vue';

</script>

<template>
    <ul class="shopMenu">
        <li>
            <a style="padding: 6px 16px;" href="/">
                <logo />
            </a>
        </li>

        <li style="float: right; padding: 12px 16px;">
            <theme />
        </li>

    </ul>
</template>

<style scoped>
.shopMenu {
    top: 0;
    left: 0;
    right: 0;
    position: fixed;
    padding: 0;
    background-color: var(--light-color);
    z-index: 1000;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);
}

ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--light-color);
}

ul li {
    float: left;
}

ul li a {
    display: block;
    color: var(--text-color);
    text-align: center;
    padding: 14px 16px;
}
</style>