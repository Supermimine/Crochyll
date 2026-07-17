<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BasicMenu from '../Menu/BasicMenu.vue';
import { useI18n } from 'vue-i18n'

import MyReserve from './MyReserve.vue';
import MyProject from './MyProject.vue'

const { t } = useI18n()

const userName = ref<string>('');

const showCreateAccount = ref<boolean>(false);
const showCreateAccountForm = ref<boolean>(false);
const showAccount = ref<boolean>(false);
const showMyProjects = ref<boolean>(false);
const showMyReserve = ref<boolean>(false);

onMounted(async () => {
    const storageValue = localStorage.getItem("myProfil:userName");

    showCreateAccount.value = true;

    if (storageValue != null) {
        userName.value = storageValue;
        showCreateAccount.value = false;
        showAccount.value = true;
    }
});

const showCreation = async () => {
    showCreateAccountForm.value = true;
};

const createAccount = async () => {
    localStorage.setItem("myProfil:userName", userName.value);
    showCreateAccount.value = false;
    showCreateAccountForm.value = false;
    showAccount.value = true;
};

const backToAccount = async () => {
    showMyProjects.value = false;
    showMyReserve.value = false;
    showAccount.value = true;
};

const myProjects = async () => {
    showAccount.value = false;
    showMyProjects.value = true;
};

const myReserve = async () => {
    showAccount.value = false;
    showMyReserve.value = true;
};
</script>

<template>
    <BasicMenu />

    <div class="disable-text-select"
        style="display: flex; justify-content: center; align-items: center; height: 80vh; padding: 0.5rem;">
        <v-card class="mx-auto card" max-width="500" v-if="showCreateAccount">
            <div v-if="!showCreateAccountForm">
                <h2 style="margin: 0;">{{ t('myProfil.hello') }}!</h2>
                <h3 style="margin: 0; font-weight: normal;">{{ t('myProfil.subTitleCreateAccount') }}</h3>

                <v-btn @click="showCreation" class="mt-4">
                    {{ t('myProfil.createAccount') }}
                </v-btn>
            </div>

            <div v-else>
                <h2 style="margin: 0;">Création du profil</h2>
                <p class="pb-5">***{{ t('myProfil.policy') }}</p>

                <v-text-field variant="outlined" density="compact" hide-details="auto" :label="t('myProfil.username')"
                    v-model="userName" />

                <v-btn @click="createAccount" class="mt-4">
                    {{ t('myProfil.confirm') }}
                </v-btn>
            </div>
        </v-card>

        <div v-if="showAccount && !showCreateAccount" style="text-align: center;">
            <div>
                <h2 style="margin: 0;">{{ t('myProfil.hello') }} {{ userName }}!</h2>
                <h3 class="pb-5" style="margin: 0; font-weight: normal;">{{ t('myProfil.subTitle') }}</h3>

                <v-card class="ma-2" link color="var(--dark-color)" :subtitle="t('myProfil.subTitleMyProject')"
                    :title="t('myProfil.myProject')" @click="myProjects()"></v-card>

                <v-card class="ma-2" link color="var(--dark-color)" :subtitle="t('myProfil.subTitleMyReserve')"
                    :title="t('myProfil.myReserve')" @click="myReserve()"></v-card>
            </div>
        </div>

        <div v-if="showMyProjects">
            <v-icon icon="mdi-arrow-left" size="30" class="backArrow ma-2" @click="backToAccount()"></v-icon>

            <MyProject />
        </div>

        <div v-if="showMyReserve">
            <v-icon icon="mdi-arrow-left" size="30" class="backArrow ma-2" @click="backToAccount()"></v-icon>

            <MyReserve />
        </div>
    </div>
</template>

<style scoped>
.card {
    background-color: var(--middle-color);
    aspect-ratio: 5/3;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px;
    min-height: 300px;
}

.addItem {
    height: 70px;
    width: 70px;
    border-radius: 50px;
    background-color: var(--action-color);
    position: fixed;
    right: 20px;
    bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.backArrow {
    position: fixed;
    left: 20px;
    top: 80px;
}
</style>