<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { loadScript, type PayPalNamespace } from '@paypal/paypal-js'
import { sendEmail } from '@/tools/email'
import { useCart } from '@/service/useCart';
const { carts, cleanCart } = useCart();

const isOpen = ref(false);
const paypalContainer = ref<HTMLDivElement | null>(null);
const showSuccess = ref(false);

const props = defineProps<{
    totalPrice: number;
}>();

const CLIENT_ID = 'sb'
//const CLIENT_ID = 'AbjNOWWB4QMBKXT_KnUqV5ddF08Tpr5jeRXcXaAIt8bnoVomNT-G_D4yGOHE8MmlBUNg17vE4Pf8IJ1X'
let paypal: PayPalNamespace | null = null
let buttonsRendered = false

interface Address {
    address_line_1?: string;
    admin_area_2?: string;
    postal_code?: string;
    country_code?: string;
}

interface Shipping {
    address?: Address;
}

interface PurchaseUnit {
    shipping?: Shipping;
}

const open = () => (isOpen.value = true)
const close = () => (isOpen.value = false)

defineExpose({ open })

loadScript({
    clientId: CLIENT_ID,
    currency: 'CAD'
}).then((pp) => {
    paypal = pp
})

watch(isOpen, async (open) => {
    if (!open || !paypal || buttonsRendered) return

    await nextTick()

    if (!paypalContainer.value || !paypal.Buttons) return

    paypal.Buttons({
        createOrder: async (_data, actions) => {
            return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'CAD',
                            value: props.totalPrice.toFixed(2)
                        }
                    }
                ]
            })
        },
        onApprove: async (_data, actions) => {
            if (!actions.order) return
            const order = await actions.order.capture()

            const email = order.payer?.email_address;
            const address = order.purchase_units?.[0]?.shipping?.address;
            if (!email || !address) {
                console.error('Information utilisateur non disponible')
                return
            }

            let message = `
                <p><b>Email:</b> ${email}</p>
                <p><b>Adresse:</b> ${address?.address_line_1}, ${address?.admin_area_2}, ${address?.postal_code}, ${address?.admin_area_1}, ${address?.country_code}</p><br/>
                <p><b>Commande:</b>
            `;
            carts.value.forEach(cart => {
                message += `
                    ${cart.item.name} - ${cart.color || 'NA'} - ${cart.size || 'NA'} x${cart.quantity}</p>
                `
            });
            message += '</p>';

            try {
                await sendEmail({
                    template: 'template_ykspufs',
                    email: email,
                    message: message
                });

                cleanCart();
                showSuccess.value = true;
            } catch (err) {
                console.error('Erreur:', err)
            }
        },
        onError: (err) => {
            console.error('Erreur PayPal', err)
        }
    }).render(paypalContainer.value)

    buttonsRendered = true
})
</script>

<template>
    <div v-show="isOpen" class="overlay" @click="close">
        <div class="dialog" @click.stop>
            <a class="closeBtn" @click="close">
                <v-icon icon="mdi-close" size="30" />
            </a>

            <!--Paypal-->
            <div v-if="!showSuccess">

                <h2 style="margin-bottom: 30px;">Paiement</h2>

                <div ref="paypalContainer"></div>
            </div>

            <!--Success-->
            <div v-else>
                <div class="success-animation">
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 998;
}

.dialog {
    background: var(--main-color);
    padding: 20px;
    border-radius: 5px;
    max-width: 500px;
    width: 90%;
    position: relative;
    text-align: left;

    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);

    max-height: 80%;
    overflow: auto;
}

.closeBtn {
    position: absolute;
    top: 0px;
    right: 0px;
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    padding: 0;
    margin: 13px 26px;
}

.success-animation {
    margin: 150px auto;
}

.checkmark {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #4bb71b;
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px #4bb71b;
    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    position: relative;
    top: 5px;
    right: 5px;
    margin: 0 auto;
}

.checkmark__circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke-miterlimit: 10;
    stroke: #4bb71b;
    fill: #fff;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;

}

.checkmark__check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
    100% {
        stroke-dashoffset: 0;
    }
}

@keyframes scale {

    0%,
    100% {
        transform: none;
    }

    50% {
        transform: scale3d(1.1, 1.1, 1);
    }
}

@keyframes fill {
    100% {
        box-shadow: inset 0px 0px 0px 30px #4bb71b;
    }
}
</style>