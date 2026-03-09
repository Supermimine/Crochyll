<script setup lang="ts">
import { ref } from 'vue'
import type { CartItem } from '@/model/cartItem';

const props = defineProps<{
    cart: CartItem;
}>();

import { useCart } from '@/service/useCart';
const { removeCart, updateQuantityCart } = useCart();

const quantity = ref(props.cart.quantity);

const addQuantity = () => {
    quantity.value++;
    updateQuantityCart(true, props.cart);
}
const removeQuantity = () => {
    quantity.value = Math.max(1, quantity.value - 1);
    updateQuantityCart(false, props.cart);
}
</script>

<template>
    <div class="cartItem">
        <img :src="`/img/${cart.item.image[0]}`" class="cartItemImg" :alt="cart.item.image[0]" :title="cart.item.image[0]" />

        <p class="cartItemName">{{ cart.item.name }}</p>

        <div class="cartItemEnd">
            <div class="cartItemQuantity ">
                <button class="btnQuantity" style="margin-left: auto;" :disabled="quantity <= 1"
                    @click="removeQuantity()">
                    <v-icon icon="mdi-minus" size="10"></v-icon>
                </button>
                <span style="margin: 10px;">{{ quantity }}</span>
                <button class="btnQuantity" style="margin-right: auto;" @click="addQuantity()">
                    <v-icon icon="mdi-plus" size="10"></v-icon>
                </button>
            </div>

            <div style="margin: auto;">${{ (cart.item.price * quantity).toFixed(2) }}</div>
        </div>

        <v-icon icon="mdi-close" size="20" class="ml-1 removeCart action-text" @click="removeCart(props.cart)"></v-icon>
    </div>
</template>

<style scoped>
.btnQuantity {
    padding: 0 5px;
    height: 30px;
    width: 30px;
    margin: auto 0;
    background-color: var(--light-color) !important;
}

.cartItem {
    display: flex;
    background-color: var(--dark-color);
    border-radius: 5px;
    padding: 20px;
    margin-top: 10px;
    align-items: center;
}

.cartItemSubItem {
    margin-left: 50px;
}

.cartItemName {
    margin: auto auto auto 0;
}

.cartItemQuantity {
    margin: auto;
    display: flex;
}

.cartItemImg {
    background-color: var(--action-color);
    height: 75px;
    width: 75px;
    margin-right: 20px;
    border-radius: 5px;
    min-width: 75px;
    max-width: 75px;
}

.removeCart {
    margin: auto 0 auto auto;
}

.cartItemEnd {
    display: flex;
    margin: auto;
    width: 50%;
}

@media (max-width: 650px) {

    .cartItem {
        flex-wrap: wrap;
        align-items: center;
    }

    .removeCart {
        margin: 0 0 auto auto;
    }

    .cartItemEnd {
        text-align: center;
        flex-direction: column-reverse;
        width: auto;
    }
}
</style>