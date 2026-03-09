<script setup lang="ts">
import { ref } from 'vue';
import ShopMenu from '../Menu/ShopMenu.vue';
import { Creator } from '../../enum/creator';
import { Matter } from '../../enum/matter';
import { Category } from '../../enum/category';
import type { Custom } from '@/model/custom';
import { sendEmail } from '@/tools/email'

const validationRules = [
    (v: string) => !!v || 'Ce champ est requis',
    (v: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (emailRegex.test(v)) {
            return true
        }
        return 'Veuillez entrer un courriel valide'
    }
];

const customItem = ref<Custom>({
    name: '',
    description: '',
    creator: Creator.All,
    size: '',
    matter: [Matter.Acrylic, Matter.Cotton, Matter.Wool, Matter.Polyester, Matter.Viscose],
    category: Category.Amigurumi,
    contact: ''
});
const creatorList = Object.values(Creator);
const matterList = Object.values(Matter);
const categoryList = Object.values(Category).filter((x) => x != Category.Clothes && x != Category.Accessoires);

const SendRequest = async () => {
    const requestData = {
        name: customItem.value.name,
        description: customItem.value.description,
        creator: customItem.value.creator,
        size: customItem.value.size,
        matter: customItem.value.matter,
        category: customItem.value.category,
        contact: customItem.value.contact
    };

    const message = `
        <p><b>Nom du projet:</b> ${requestData.name}</p>
        <p><b>Description:</b> ${requestData.description}</p>
        <p><b>Créateur:</b> ${requestData.creator}</p>
        <p><b>Taille:</b> ${requestData.size}</p>
        <p><b>Matière:</b> ${requestData.matter.join(', ')}</p>
        <p><b>Catégorie:</b> ${requestData.category}</p>
    `;

    try {
        await sendEmail({
            template: 'template_ep7ik97',
            email: requestData.contact,
            message: message
        })
    } catch (err) {
        console.error('Erreur:', err)
    }

    alert("Votre demande de personnalisation a été envoyée avec succès !");
}


const checkForm = () => {
    if (customItem.value.name == '' || customItem.value.name == null)
        return false
    if (customItem.value.description == '' || customItem.value.description == null)
        return false
    if (customItem.value.size == '' || customItem.value.size == null)
        return false
    if (customItem.value.contact == '' || customItem.value.contact == null)
        return false

    if (customItem.value.creator == null)
        return false
    if (customItem.value.category == null)
        return false
    if (customItem.value.matter == null || customItem.value.matter.length == 0)
        return false

    return true;
}
</script>


<template>
    <ShopMenu />

    <h2>Commande Personnalisée</h2>

    <div class="mainSection">
        <div class="leftSection">
            <v-row>
                <v-col cols="12">
                    <v-text-field label="Nom projet" density="compact" variant="solo" maxlength="30" hide-details="auto"
                        v-model="customItem.name" />
                </v-col>

                <v-col cols="12">
                    <v-select label="Créateur" density="compact" variant="solo" :items="creatorList" hide-details="auto"
                        v-model="customItem.creator" />
                </v-col>

                <v-col cols="12">
                    <v-select label="Catégorie" density="compact" variant="solo" :items="categoryList"
                        hide-details="auto" v-model="customItem.category" />
                </v-col>

                <v-col cols="12">
                    <v-select label="Laine souhaité" density="compact" variant="solo" multiple :items="matterList"
                        hide-details="auto" v-model="customItem.matter" />
                </v-col>

                <v-col cols="12">
                    <v-text-field label="Taille (L x H x l)" density="compact" variant="solo" hide-details="auto"
                        v-model="customItem.size" />
                </v-col>

                <v-col cols="12" class="email">
                    <v-text-field label="Votre courriel" density="compact" variant="solo" hide-details="auto"
                        v-model="customItem.contact" type="email" :rules="validationRules" />
                </v-col>
            </v-row>
        </div>

        <div class="rightSection">
            <v-row>
                <v-col cols="12">
                    <v-textarea label="Description" density="compact" variant="solo" maxlength="800" rows="17"
                        hide-details="auto" v-model="customItem.description" />
                </v-col>
            </v-row>
        </div>
    </div>

    <div>
        <button style="padding-left: 100px; padding-right: 100px; margin-bottom: 150px;" class="buttonColor"
            @click="SendRequest()" :disabled="!checkForm()">Envoyer la demande</button>
    </div>
</template>

<style scoped lang="css">
.mainSection {
    display: flex;
    padding: 60px;
}

.leftSection {
    width: 40%;
    padding-right: 10px;
}

.rightSection {
    width: 60%;
    padding-left: 10px;
}

.email {
    margin-top: 65px;
}

@media screen and (max-width: 768px) {
    .mainSection {
        display: block;
    }

    .leftSection,
    .rightSection {
        width: 100%;
        padding: 0;
    }

    .leftSection {
        margin-bottom: 12px;
    }
}

@media screen and (max-width: 650px) {
    .mainSection {
        padding: 20px;
    }

    .email {
        margin-top: 0;
    }
}
</style>