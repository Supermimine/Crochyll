<script setup lang="ts">
import BasicMenu from "../Menu/BasicMenu.vue";

</script>

<template>
    <BasicMenu />

    <div>
        <h1>FAQ</h1>
        <p>Voici quelques questions fréquemment posées sur Crochyll :</p>

        <v-expansion-panels>
            <v-expansion-panel title="Qu'est-ce que Crochyll ?"
                text="Crochyll est une plateforme de vente de produits réalisés à la main ainsi qu'une plateforme de lecture et de création de patrons pour le crochet.">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel title="Quel est le délai de livraison de ma commande ?"
                text="Le délai de livraison est dépend de votre localisation et du délai de confection de votre commande. Un courriel de confirmation vous sera envoyé une fois votre commande sera commencé avec un délai plus précis et un autre courriel de confirmation d'expédition, contenant les informations de suivi.">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel title="Est-ce que je peux retourner un article ?"
                text="Oui, vous pouvez retourner un article dans les 7 jours suivant la réception de votre commande et que l'état de l'article est identique a celui reçu. Veuillez contacter notre support client pour obtenir les instructions de retour (info.crochyll@gmail.com).">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel title="Suis-je obliger d'avoir un compte paypal ?"
                text="Non cela n'est pas obligatoire, le paiement par carte fonctionne. Pour ce faire, il faut choisir l'option 'carte de crédit' lors du paiement.">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel title="Comment puis-je contacter le support client de Crochyll ?"
                text="Vous pouvez contacter notre support client en envoyant un e-mail à info.crochyll@gmail.com.">
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<style scoped>
.v-expansion-panels {
    margin: 30px 50px;
    width: auto;
}

.v-expansion-panel {
    background-color: var(--main-color);
}
</style>