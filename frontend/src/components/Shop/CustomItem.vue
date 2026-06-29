<script setup lang="ts">
import { ref, computed } from 'vue';
import ShopMenu from '../Menu/ShopMenu.vue';
import { Creator } from '@core/enum/creator';
import { Matter } from '@core/enum/matter';
import { Category } from '@core/enum/category';
import type { Custom } from '@core/model/custom';
import { api } from '@/service/api';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const validationRules = [
    (v: string) => !!v || t('rule.required'),
    (v: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (emailRegex.test(v)) {
            return true
        }
        return t('rule.email')
    }
];

const customItem = ref<Custom & { category: Category.Amigurumi | Category.AccessoiresAmigurumi | Category.Pattern }>({
    name: '',
    description: '',
    creator: Creator.All,
    size: '',
    matter: [Matter.Acrylic, Matter.Cotton, Matter.Wool, Matter.Polyester, Matter.Viscose],
    category: Category.Amigurumi,
    username: '',
    contact: ''
});
const creatorList = computed(() =>
    Object.keys(Creator)
        .filter(k => isNaN(Number(k)))
        .map(key => Creator[key as keyof typeof Creator])
        .map((creator) => ({
            title: t(`enum.creator.${creator}`),
            value: creator
        }))
);

const matterList = computed(() =>
    Object.keys(Matter)
        .filter(k => isNaN(Number(k)))
        .map(key => Matter[key as keyof typeof Matter])
        .map((matter) => ({
            title: t(`enum.matter.${matter}`),
            value: matter
        }))
);

const categoryList = computed(() =>
    Object.keys(Category)
        .filter(k => isNaN(Number(k)))
        .map(key => Category[key as keyof typeof Category])
        .filter((cat) => cat != Category.Clothes && cat != Category.Accessoires)
        .map((cat) => ({
            title: t(`enum.category.${cat}`),
            value: cat
        }))
);

const SendRequest = async () => {
    const requestData = {
        name: customItem.value.name,
        description: customItem.value.description,
        creator: customItem.value.creator,
        size: customItem.value.size,
        matter: customItem.value.matter,
        category: customItem.value.category,
        username: customItem.value.username,
        contact: customItem.value.contact
    };

    const message = `
        Nom du projet: ${requestData.name}
        Description: ${requestData.description}
        Créateur: ${requestData.creator}
        Taille: ${requestData.size}
        Matière: ${requestData.matter.join(', ')}
        Catégorie: ${requestData.category}
    `;

    try {
        await api.sendPersonalizedRequestEmail({
            username: requestData.username,
            email: requestData.contact,
            subject: "Nouvelle demande de personnalisation",
            message: message
        })
    } catch (err) {
        console.error('Erreur:', err)
    }

    alert(t('personalize.sucess'));
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

    <h2>{{ t('personalize.title') }}</h2>

    <div class="mainSection">
        <div class="leftSection">
            <v-row>
                <v-col cols="12">
                    <v-text-field :label="t('personalize.name')" density="compact" variant="solo" maxlength="30" hide-details="auto"
                        v-model="customItem.name" />
                </v-col>

                <v-col cols="12">
                    <v-select :label="t('personalize.creator')" density="compact" variant="solo" :items="creatorList"
                        item-title="title" item-value="value" hide-details="auto" v-model="customItem.creator" />
                </v-col>

                <v-col cols="12">
                    <v-select :label="t('personalize.category')" density="compact" variant="solo" :items="categoryList"
                        item-title="title" item-value="value" hide-details="auto" v-model="customItem.category" />
                </v-col>

                <v-col cols="12">
                    <v-select :label="t('personalize.matter')" density="compact" variant="solo" multiple :items="matterList"
                        item-title="title" item-value="value" hide-details="auto" v-model="customItem.matter" />
                </v-col>

                <v-col cols="12">
                    <v-text-field :label="t('personalize.size')" density="compact" variant="solo" hide-details="auto"
                        v-model="customItem.size" />
                </v-col>

                <v-col cols="12" class="email">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field :label="t('personalize.username')" density="compact" variant="solo" hide-details="auto"
                                v-model="customItem.username" />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field :label="t('personalize.email')" density="compact" variant="solo" hide-details="auto"
                                v-model="customItem.contact" type="email" :rules="validationRules" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </div>

        <div class="rightSection">
            <v-row>
                <v-col cols="12">
                    <v-textarea :label="t('personalize.description')" density="compact" variant="solo" maxlength="800" rows="20"
                        hide-details="auto" v-model="customItem.description" />
                </v-col>
            </v-row>
        </div>
    </div>

    <div>
        <v-btn style="padding-left: 100px; padding-right: 100px; margin-bottom: 150px;" class="buttonColor"
            @click="SendRequest()" :disabled="!checkForm()">{{ t('personalize.send') }}</v-btn>
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