<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import type { Yarn } from '@core/model/myProject/yarn.ts';
import { SizeWool } from '@core';

const lstYarn = ref<Yarn[]>([]);
const sizeWoolList = ref<{ name: string; code: number }[]>(
    Object.keys(SizeWool)
        .filter(k => isNaN(Number(k)))
        .map((k) => {
            const code = (SizeWool as any)[k] as number;
            return { name: `${k} (${code})`, code };
        })
);
const yarnModel = ref<Yarn>({
    name: '',
    compagny: '',
    color: '',
    size: 0,
    length: undefined,
    weight: undefined,
    hookSize: undefined,
    needleSize: undefined,
    noPlace: undefined,
    quantity: 1,
    matter: []
});

const showDialog = ref<boolean>(false);
const openItems = ref<Record<number, boolean>>({});

onMounted(async () => {
    const storageValue = localStorage.getItem("myProject:reserve")
    lstYarn.value = storageValue ? JSON.parse(storageValue) : []
});

const checkForm = () => {
    if (yarnModel.value.name == '')
        return false
    if (yarnModel.value.color == '')
        return false
    if (yarnModel.value.quantity <= 0)
        return false

    return true;
}

const save = () => {
    console.log(yarnModel);

    const storageValue = localStorage.getItem("myProject:reserve");
    lstYarn.value = storageValue ? JSON.parse(storageValue) : [];

    const existingEntry = lstYarn.value.find(
        (entry: Yarn) =>
            entry.name === yarnModel.value.name &&
            entry.color === yarnModel.value.color
    );

    if (existingEntry) {
        existingEntry.quantity += yarnModel.value.quantity;
    } else {
        lstYarn.value.push({ ...yarnModel.value });
    }

    localStorage.setItem('myProject:reserve', JSON.stringify(lstYarn.value));
    showDialog.value = false;
};


const showInfo = () => {
    alert('Cette information sert à tout ceux qui souhaiterais organiser leurs inventaire ou ceux qui ont tendance à perdre leurs laine (ont ce reconnais hahahha)');
}

const toggleOpen = (index: number) => {
    openItems.value[index] = !openItems.value[index];
};
</script>

<template>
    <h3 class="ma-auto">Ma réserve</h3>
    <p class="ma-auto" v-if="lstYarn.length === 0">C'est étrange, n'est-ce pas ? Votre stock est vide.</p>

    <div v-else v-for="(yarn, index) in lstYarn" :key="index" class="box">
        <div style="display: flex;">
            <img src="" :alt="yarn.name + '.png'" class="imgBox">

            <div>
                <p style="position: absolute; top: 10px; right: 10px; font-style: italic; opacity: 0.7;">{{ yarn.noPlace
                    }}</p>

                <p style="margin-top: 25px;">{{ yarn.name }}</p>
                <p><b>{{ yarn.color }}</b></p>
            </div>
        </div>

        <p>Nombre total: {{ yarn.quantity }}</p>
        <p>Nombre utilisé: TODO</p>

        <div v-if="yarn.compagny != undefined && yarn.hookSize != undefined && yarn.needleSize != undefined && yarn.length != undefined && yarn.weight != undefined"
            style="justify-content: center; display: flex; margin-top: 25px;">
            <a href="#" @click.prevent="toggleOpen(index)" style="display: flex;">
                <p>Plus de détail</p>
                <v-icon :icon="openItems[index] ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'"></v-icon>
            </a>
        </div>

        <div v-if="openItems[index]" style="display: flex;">
            <div class="mr-6">
                <p v-if="yarn.compagny != undefined">Compagnie: {{ yarn.compagny }}</p>
                <p v-if="yarn.hookSize != undefined">Taille crochet: {{ yarn.hookSize }}</p>
                <p v-if="yarn.needleSize != undefined">taille aiguille: {{ yarn.needleSize }}</p>
            </div>
            <div>
                <p v-if="yarn.length != undefined">Longueur: {{ yarn.length }}</p>
                <p v-if="yarn.weight != undefined">Poids: {{ yarn.weight }}</p>

                <!-- <p>Compagnie: {{ yarn.matter }}</p> -->
            </div>
        </div>
    </div>

    <v-btn class="buttonColor addItem" icon="mdi-plus" size="large" @click="showDialog = true;"></v-btn>

    <div v-if="showDialog" class="overlay">
        <div class="dialog" @click.stop>
            <div style="width:100%">
                <h3 class="title">Laine</h3>

                <div class="closeBtn action-text" @click="showDialog = false;">
                    <v-icon icon="mdi-close" size="30"></v-icon>
                </div>

                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="yarnModel.name" :label="t('myReserve.yarnModel.name') + ' *'"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.compagny" :label="t('myReserve.yarnModel.compagny')"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.color" :label="t('myReserve.yarnModel.color') + ' *'"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-autocomplete v-model="yarnModel.size" :items="sizeWoolList" item-title="name"
                            item-value="code" :label="t('myReserve.yarnModel.size') + ' *'" variant="outlined"
                            density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.length" :label="t('myReserve.yarnModel.length')"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.weight" :label="t('myReserve.yarnModel.weight')"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.hookSize" :label="t('myReserve.yarnModel.hookSize')"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.needleSize" :label="t('myReserve.yarnModel.needleSize')"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="11">
                        <v-text-field v-model="yarnModel.noPlace" :label="t('myReserve.yarnModel.noPlace')"
                            variant="outlined" density="compact" hide-details="auto" />

                    </v-col>
                    <v-col cols="1"
                        style="display: flex; justify-content: center; align-items: center; cursor: pointer;">
                        <v-icon icon="mdi-information-outline" size="20" @click="showInfo"></v-icon>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="yarnModel.quantity" :label="t('myReserve.yarnModel.quantity') + ' *'"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-btn style="width: 100%;" class="mt-4 buttonColor" @click="save" :disabled="!checkForm()">
                    {{ t('button.save') }}
                </v-btn>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
    max-width: 520px;
    width: 90%;
    position: relative;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);
    max-height: 80%;
    overflow-y: auto;
}

.closeBtn {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    margin: 13px 26px;
}

.box {
    background-color: var(--middle-color);
    width: 100%;
    border-radius: 8px;
    padding: 15px;
    text-align: left;
    position: relative;
    min-width: 400px;
}

.imgBox {
    height: 80px;
    width: 80px;
    background-color: var(--dark-color);
    border-radius: 5px;
    margin-right: 15px;
}
</style>