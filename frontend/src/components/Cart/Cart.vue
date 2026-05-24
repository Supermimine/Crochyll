<script setup lang="ts">
import { ref, computed } from 'vue';
import ShopMenu from '../Menu/ShopMenu.vue';
import CartItem from './CartItem.vue';
import Paypal from '@/components/Custom/Paypal.vue';
import AddressVue from '@/components/Cart/Address.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import type { Address } from '@core/model/address';

import { calculateShipping } from '@/service/useShipping';
import { useCart } from '@/service/useCart';
const { carts } = useCart();

const paypalRef = ref<InstanceType<typeof Paypal> | null>(null);
const addressRef = ref<InstanceType<typeof AddressVue> | null>(null);

const addressSelected = ref<Address | null>(null);

const totalPrice = computed(() => {
    return carts.value
        .map((x: { quantity: number; item: { price: number; }; }) => (x.quantity * x.item.price).toFixed(2))
        .reduce((sum: number, price: string) => sum + parseFloat(price), 0)
        .toFixed(2);
});
const totalPriceCart = computed(() => {
    return (parseFloat(totalPrice.value) + shipping.value).toFixed(2);
});

const saveAddress = (addr: Address) => {
    addressSelected.value = addr;
}

const shipping = computed(() => {
    let price = 0
    if (addressSelected.value != null) {
        carts.value.forEach((cart) => {
            const sizes = cart.item.measure.split('x').map((val: string) => val.replace('cm', '').trim());

            const subPrice = calculateShipping(
                {
                    country: addressSelected.value!.country,
                    postalCode: addressSelected.value!.postalCode
                },
                {
                    weight: cart.item.weight,
                    length: Number.parseInt(sizes[0]),
                    width: Number.parseInt(sizes[1]),
                    height: Number.parseInt(sizes[2])
                }
            )

            for (let i = 1; i <= cart.quantity; i++) {
                if (i === 1) {
                    price += subPrice
                }
                else if (i <= 5) {
                    price += subPrice * 0.5
                }
                else {
                    price += subPrice * 0.25
                }
            }
        });

        if (parseFloat(totalPrice.value) >= 150)
            price = 0;
    }

    return price;
});
</script>


<template>
    <ShopMenu />

    <div class="mainSection">
        <div class="cartSection">
            <div style="display: flex; margin-bottom: 30px;">
                <p style="font-size: 28px; margin-right: auto;">{{ t('cart.title') }}</p>
                <p style="margin-top: 16px;">{{ carts.length }} {{ t('cart.item') }}</p>
            </div>

            <hr />

            <div v-for="cart in carts" :key="`${cart.item.id}-${cart.color}-${cart.size}`">
                <CartItem :cart="cart" />
            </div>
        </div>

        <div class="summarySection">
            <p style="font-size: 20px; font-weight: bold; margin-top: 25px;">{{ t('cart.summary') }}</p>
            <hr style="margin: 10px 0 15px 0;" />
            <div style="display: flex;">
                <p style="margin-right: auto;">{{ t('cart.item') }} ({{ carts.length }})</p>
                <p>${{ totalPrice }}</p>
            </div>

            <div style="display: flex; margin-top: 10px;">
                <p style="margin-right: auto;">{{ t('cart.delivery') }}</p>
                <p>${{ shipping }}</p>
            </div>
            <a v-if="addressSelected == null" class="action-text-inverted" style="font-size: 12px;"
                @click="addressRef?.open()">{{ t('button.add') }}</a>
            <div v-else>
                <span style="font-size: 12px;">({{ addressSelected.address2 }}<span
                        v-if="addressSelected.address2 != ''">-</span>{{ addressSelected.address1 }} {{
                            addressSelected.city }}) </span>
                <a class="action-text-inverted" style="font-size: 12px;" @click="addressRef?.open()">{{ t('button.edit') }}</a>
            </div>

            <hr style="margin: 30px 0 10px 0;" />
            <div style="display: flex;">
                <p style="margin-right: auto;">{{ t('cart.totalPrice') }}</p>
                <p>${{ totalPriceCart }}</p>
            </div>

            <button :disabled="carts.length === 0 || addressSelected == null" class="buttonColor"
                style="width: 100%; margin: 2px; margin-top: 50px;" @click="paypalRef?.open()">
                {{ t('cart.placeOrder') }}
            </button>
        </div>
    </div>

    <Paypal ref="paypalRef" :totalPrice="parseFloat(totalPriceCart)" />
    <AddressVue ref="addressRef" @save="saveAddress" />
</template>

<style scoped lang="css">
.mainSection {
    display: flex;
    text-align: left;
    font-weight: bold;
}

.cartSection {
    padding: 10px 20px;
    width: 60%;
}

.summarySection {
    background-color: var(--dark-color);
    padding: 20px;
    width: 40%;
    border-radius: 5px;
}

@media screen and (max-width: 1000px) {
    .mainSection {
        display: block;
    }

    .cartSection {
        width: 100%;
        padding: 0;
    }

    .summarySection {
        width: 100%;
        margin-top: 20px;
    }
}
</style>