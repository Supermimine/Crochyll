<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

const lengthUnits = ['m', 'yd'];
const weightUnits = ['g', 'oz'];

const yarnA = ref({ length: null as number | null, lengthUnit: 'm', weight: null as number | null, weightUnit: 'g' });
const yarnB = ref({ length: null as number | null, lengthUnit: 'm', weight: null as number | null, weightUnit: 'g' });

const resultMessage = ref('');
const typeMessage = ref<'success' | 'error' | 'info' | 'warning'>('info');

const getNormalizedRatio = (yarn: typeof yarnA.value): number => {
    if (!yarn.length || !yarn.weight) return 0;

    const meters = yarn.lengthUnit === 'yd' ? yarn.length * 0.9144 : yarn.length;
    const grams = yarn.weightUnit === 'oz' ? yarn.weight * 28.3495 : yarn.weight;

    return meters / grams;
};

const ratioA = computed(() => {
    const ratio = getNormalizedRatio(yarnA.value);
    return ratio ? `${ratio.toFixed(2)} m/g` : '--';
});

const ratioB = computed(() => {
    const ratio = getNormalizedRatio(yarnB.value);
    return ratio ? `${ratio.toFixed(2)} m/g` : '--';
});

const compareYarn = (): void => {
    const ratioAVal = getNormalizedRatio(yarnA.value);
    const ratioBVal = getNormalizedRatio(yarnB.value);

    if (!ratioAVal || !ratioBVal) {
        typeMessage.value = 'info';
        resultMessage.value = t('tools.yarnComparaison.result.info');
        return;
    }

    const diff = Math.abs((ratioAVal - ratioBVal) / ratioAVal) * 100;

    if (diff <= 5) {
        typeMessage.value = 'success';
        resultMessage.value = t('tools.yarnComparaison.result.sucess');
    } else if (diff <= 15) {
        typeMessage.value = 'warning';
        resultMessage.value = t('tools.yarnComparaison.result.warning');
    } else {
        typeMessage.value = 'error';
        resultMessage.value = t('tools.yarnComparaison.result.error');
    }
}
</script>

<template>
    <div class="px-2 text-center">
        <h3 class="text-title-medium text-truncate w-100 ma-0 disable-text-select mb-4">
            {{ t('tools.tool.yarnComparaison') }}
        </h3>

        <v-row align="center" justify="center">
            <v-col cols="5">
                <h5 class="mb-1 mt-0">{{ t('tools.yarnComparaison.yarnA') }}</h5>

                <v-text-field v-model.number="yarnA.length" type="number" :label="t('tools.yarnComparaison.length')" hide-details
                    class="mb-3 custom-field-layout" density="compact" variant="outlined">
                    <template #append-inner>
                        <v-menu location="bottom end">
                            <template #activator="{ props: menuProps }">
                                <div v-bind="menuProps" class="clickable-unit-selector">
                                    <span class="unit-display-text">{{ yarnA.lengthUnit }}</span>
                                    <v-icon icon="mdi-menu-down" size="18" class="ml-1 opacity-70"></v-icon>
                                </div>
                            </template>
                            <v-list density="compact">
                                <v-list-item v-for="unit in lengthUnits" :key="unit" :value="unit"
                                    @click="yarnA.lengthUnit = unit">
                                    <v-list-item-title>{{ unit }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </v-text-field>

                <v-text-field v-model.number="yarnA.weight" type="number" :label="t('tools.yarnComparaison.weight')" hide-details
                    class="custom-field-layout" density="compact" variant="outlined">
                    <template #append-inner>
                        <v-menu location="bottom end">
                            <template #activator="{ props: menuProps }">
                                <div v-bind="menuProps" class="clickable-unit-selector">
                                    <span class="unit-display-text">{{ yarnA.weightUnit }}</span>
                                    <v-icon icon="mdi-menu-down" size="18" class="ml-1 opacity-70"></v-icon>
                                </div>
                            </template>
                            <v-list density="compact">
                                <v-list-item v-for="unit in weightUnits" :key="unit" :value="unit"
                                    @click="yarnA.weightUnit = unit">
                                    <v-list-item-title>{{ unit }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </v-text-field>
                <div class="mt-2 opacity-70">{{ t('tools.yarnComparaison.density') }} : {{ ratioA }}</div>
            </v-col>

            <v-col cols="2" class="d-flex align-center justify-center my-2 my-md-0">
                <v-btn class="buttonColor" variant="tonal" size="large" icon @click="compareYarn()">
                    <v-icon icon="mdi-swap-horizontal" size="28" class="d-none d-md-block"></v-icon>
                    <v-icon icon="mdi-swap-vertical" size="28" class="d-block d-md-none"></v-icon>
                </v-btn>
            </v-col>

            <v-col cols="5">
                <h5 class="mb-1 mt-0">{{ t('tools.yarnComparaison.yarnB') }}</h5>

                <v-text-field v-model.number="yarnB.length" type="number" :label="t('tools.yarnComparaison.length')" hide-details
                    class="mb-3 custom-field-layout" density="compact" variant="outlined">
                    <template #append-inner>
                        <v-menu location="bottom end">
                            <template #activator="{ props: menuProps }">
                                <div v-bind="menuProps" class="clickable-unit-selector">
                                    <span class="unit-display-text">{{ yarnB.lengthUnit }}</span>
                                    <v-icon icon="mdi-menu-down" size="18" class="ml-1 opacity-70"></v-icon>
                                </div>
                            </template>
                            <v-list density="compact">
                                <v-list-item v-for="unit in lengthUnits" :key="unit" :value="unit"
                                    @click="yarnB.lengthUnit = unit">
                                    <v-list-item-title>{{ unit }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </v-text-field>

                <v-text-field v-model.number="yarnB.weight" type="number" :label="t('tools.yarnComparaison.weight')" hide-details
                    class="custom-field-layout" density="compact" variant="outlined">
                    <template #append-inner>
                        <v-menu location="bottom end">
                            <template #activator="{ props: menuProps }">
                                <div v-bind="menuProps" class="clickable-unit-selector">
                                    <span class="unit-display-text">{{ yarnB.weightUnit }}</span>
                                    <v-icon icon="mdi-menu-down" size="18" class="ml-1 opacity-70"></v-icon>
                                </div>
                            </template>
                            <v-list density="compact">
                                <v-list-item v-for="unit in weightUnits" :key="unit" :value="unit"
                                    @click="yarnB.weightUnit = unit">
                                    <v-list-item-title>{{ unit }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </v-text-field>
                <div class="mt-2 opacity-70">{{ t('tools.yarnComparaison.density') }} : {{ ratioB }}</div>
            </v-col>
        </v-row>

        <v-row v-if="resultMessage" class="mt-4">
            <v-col cols="12">
                <v-alert :type="typeMessage" variant="tonal" closable @click:close="resultMessage = ''">
                    {{ resultMessage }}
                </v-alert>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

:deep(input[type="number"]) {
    -moz-appearance: textfield;
}

:deep(.custom-field-layout .v-field__field) {
    flex: 1 1 70% !important;
}

:deep(.custom-field-layout .v-field__append-inner) {
    flex: 0 0 30% !important;
    min-width: 65px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    padding-left: 0 !important;
}

.clickable-unit-selector {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    cursor: pointer;
    user-select: none;
    padding-right: 4px;
}

.unit-display-text {
    font-size: 14px;
    font-weight: 500;
    text-align: right;
}

.opacity-70 {
    opacity: 0.7;
}
</style>
