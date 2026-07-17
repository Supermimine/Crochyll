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
    compagny: undefined,
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
    const storageValue = localStorage.getItem("myProfil:reserve")
    lstYarn.value = storageValue ? JSON.parse(storageValue) : []
});

const openDialog = () => {
    showDialog.value = true;
    yarnModel.value = {
        name: '',
        compagny: undefined,
        color: '',
        size: 0,
        length: undefined,
        weight: undefined,
        hookSize: undefined,
        needleSize: undefined,
        noPlace: undefined,
        quantity: 1,
        matter: []
    }
}

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
    const storageValue = localStorage.getItem("myProfil:reserve");
    lstYarn.value = storageValue ? JSON.parse(storageValue) : [];

    const existingIndex = lstYarn.value.findIndex(
        (entry: Yarn) =>
            entry.name === yarnModel.value.name &&
            entry.color === yarnModel.value.color &&
            entry.size === yarnModel.value.size
    );

    if (existingIndex !== -1) {
        lstYarn.value[existingIndex] = { ...yarnModel.value };
    } else {
        lstYarn.value.push({ ...yarnModel.value });
    }

    localStorage.setItem('myProfil:reserve', JSON.stringify(lstYarn.value));
    showDialog.value = false;
};

const editYarn = (yarn: Yarn) => {
    showDialog.value = true;
    yarnModel.value = yarn;
}

const deleteYarn = (yarn: Yarn) => {
    const isConfirmed: boolean = window.confirm(t('myProfil.delete'));

    if (isConfirmed) {
        const storageValue = localStorage.getItem("myProfil:reserve");
        const storedYarn = storageValue ? JSON.parse(storageValue) as Yarn[] : [];

        const indexToRemove = storedYarn.findIndex(
            (entry: Yarn) =>
                entry.name === yarn.name &&
                entry.color === yarn.color &&
                entry.size === yarn.size
        );

        if (indexToRemove !== -1) {
            storedYarn.splice(indexToRemove, 1);
            lstYarn.value = storedYarn;
            localStorage.setItem('myProfil:reserve', JSON.stringify(storedYarn));
        }
    }
}

const showInfo = () => {
    alert(t('myReserve.infoNoPlace'));
}

const toggleOpen = (index: number) => {
    openItems.value[index] = !openItems.value[index];
};
</script>

<template>
    <h3 class="ma-auto">{{ t('myReserve.title') }}</h3>
    <p class="ma-auto" v-if="lstYarn.length === 0">{{ t('myReserve.empty') }}</p>

    <div v-else v-for="(yarn, index) in lstYarn" :key="index" class="box">
        <div class="card-top">
            <div class="card-header">
                <img src="/img/no-picture.png" :alt="`${yarn.name}.png`" class="imgBox">

                <div class="card-title">
                    <span v-if="yarn.noPlace" class="place">#{{ yarn.noPlace }}</span>

                    <h3>{{ yarn.color }}</h3>
                    <p class="subtitle">{{ yarn.name }}</p>

                    <div class="quantity">
                        <span>{{ yarn.quantity }} pelote{{ yarn.quantity > 1 ? 's' : '' }}</span>

                        <span>0 utilisé{{ yarn.quantity > 1 ? 's' : '' }}</span>
                    </div>
                </div>
            </div>

            <div class="card-actions">
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="editYarn(yarn)" />
                <v-btn icon="mdi-delete-outline" variant="text" size="small" @click="deleteYarn(yarn)" />
            </div>
        </div>

        <div v-if="yarn.compagny || yarn.hookSize || yarn.needleSize || yarn.length || yarn.weight"
            class="details-toggle">
            <a href="" @click.prevent="toggleOpen(index)">
                <v-icon :icon="openItems[index]
                    ? 'mdi-chevron-double-up'
                    : 'mdi-chevron-double-down'" />
            </a>
        </div>

        <v-expand-transition>
            <div v-show="openItems[index]" class="details">

                <div v-if="yarn.compagny" class="detail-row">
                    <span>{{ t('myReserve.yarnModel.compagny') }}</span>
                    <strong>{{ yarn.compagny }}</strong>
                </div>

                <div v-if="yarn.hookSize" class="detail-row">
                    <span>{{ t('myReserve.yarnModel.hook') }}</span>
                    <strong>{{ yarn.hookSize }} mm</strong>
                </div>

                <div v-if="yarn.needleSize" class="detail-row">
                    <span>{{ t('myReserve.yarnModel.needle') }}</span>
                    <strong>{{ yarn.needleSize }} mm</strong>
                </div>

                <div v-if="yarn.length" class="detail-row">
                    <span>{{ t('myReserve.yarnModel.length') }}</span>
                    <strong>{{ yarn.length }} m</strong>
                </div>

                <div v-if="yarn.weight" class="detail-row">
                    <span>{{ t('myReserve.yarnModel.weigth') }}</span>
                    <strong>{{ yarn.weight }} g</strong>
                </div>
            </div>
        </v-expand-transition>
    </div>

    <v-btn class="buttonColor addItem" icon="mdi-plus" size="large" @click="openDialog()"></v-btn>

    <div v-if="showDialog" class="overlay">
        <div class="dialog" @click.stop>
            <div class="closeBtn action-text" @click="showDialog = false;">
                <v-icon icon="mdi-close" size="30"></v-icon>
            </div>

            <div style="width:100%">
                <h3 class="title">{{ t('myReserve.yarnModel.title') }}</h3>


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
                            variant="outlined" density="compact" hide-details="auto" suffix="m" />
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.weight" :label="t('myReserve.yarnModel.weight')"
                            variant="outlined" density="compact" hide-details="auto" suffix="g" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.hookSize" :label="t('myReserve.yarnModel.hookSize')"
                            variant="outlined" density="compact" hide-details="auto" suffix="mm" />
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field v-model="yarnModel.needleSize" :label="t('myReserve.yarnModel.needleSize')"
                            variant="outlined" density="compact" hide-details="auto" suffix="mm" />
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
    position: fixed;
    right: 20px;
    bottom: 20px;

    width: 68px;
    height: 68px;

    border-radius: 50%;
    background-color: var(--action-color);

    display: flex;
    justify-content: center;
    align-items: center;

    box-shadow: 0 4px 12px rgba(0, 0, 0, .2);
    cursor: pointer;
}

.overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(0, 0, 0, .4);
    z-index: 998;
}

.dialog {
    position: relative;

    width: min(520px, 90%);
    max-height: 80vh;

    padding: 24px;

    overflow-y: auto;

    background: var(--main-color);
    border-radius: 14px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, .25);
}

.closeBtn {
    position: absolute;
    top: 18px;
    right: 18px;

    cursor: pointer;
}

.box {
    position: relative;

    width: 100%;
    min-width: 380px;

    margin: 16px 0;
    padding: 18px;

    background: var(--middle-color);
    border-radius: 14px;

    transition: .2s ease;
}

.box:hover {
    transform: translateY(-2px);
}

.imgBox {
    width: 72px;
    height: 72px;

    flex-shrink: 0;

    border-radius: 10px;
    background: var(--dark-color);

    object-fit: cover;
}

.card-title {
    position: relative;
    flex: 1;
}

.place {
    position: absolute;
    top: 0;
    right: 0;

    opacity: .6;
    font-size: .85rem;
    font-style: italic;
}

.card-title h3 {
    margin: 0;
    padding-right: 60px;

    font-size: 1.35rem;
    font-weight: 700;
}

.subtitle {
    margin-top: 4px;

    opacity: .75;
    font-size: .95rem;
}

.quantity {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: 14px;
}

.status {
    font-weight: 600;
}

.details-toggle {
    display: flex;
    justify-content: center;

    margin: 18px 0 10px;
}

.details {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-top: 8px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 2px 0;
}

.detail-row span {
    opacity: .65;
}

.detail-row strong {
    text-align: right;
}

.card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.card-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex: 1;
    min-width: 0;
}

.card-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    margin-top: auto;
    margin-bottom: auto;
}

.card-actions .v-btn {
    opacity: 0;
    transition: .2s;
}

.box:hover .card-actions .v-btn {
    opacity: 1;
}

@media (max-width: 480px) {

    .box {
        min-width: auto;
        padding: 16px;
    }

    .imgBox {
        width: 60px;
        height: 60px;
    }

    .card-title h3 {
        font-size: 1.15rem;
    }

    .quantity,
    .detail-row {
        font-size: .95rem;
    }

}
</style>