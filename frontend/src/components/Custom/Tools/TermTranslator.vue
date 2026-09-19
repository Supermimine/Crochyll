<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

const termKeys = ['mr', 'ch', 'sc', 'hdc', 'dc', 'tr', 'tdr', 'slst', 'sk', 'close', 'inc', 'dec', 'yo', 'blo', 'flo', 'cc', 'rep', 'fwdp', 'tss', 'tks', 'tps', 'trs', 'tfs', 'etss', 'tdc', 'lts', 'fpdc', 'bpdc'] as const;

const languageMap: Record<string, 'fr' | 'en' | 'uk'> = {
    'Français (FR)': 'fr',
    'French': 'fr',
    'Américaine (US)': 'en',
    'American': 'en',
    'Angleterre (UK)': 'uk',
    'British': 'uk',
};

const language = computed(() => [
    t('tools.language.fr'),
    t('tools.language.en'),
    t('tools.language.uk'),
]);

const getLanguageCode = (languageLabel: string): 'fr' | 'en' | 'uk' => {
    return languageMap[languageLabel] || 'fr';
};

const termList = computed(() => {
    if (!selectedLanguageFrom.value) return [];

    const languageCode = getLanguageCode(selectedLanguageFrom.value);
    return termKeys.map(key => ({
        title: t(`tools.term.${languageCode}.${key}`),
        value: key
    }));
});

const selectedLanguageFrom = ref('');
const termFrom = ref('');
const selectedLanguageTo = ref('');
const termTo = ref('');

const translateTerm = (): void => {
    if (!termFrom.value || !selectedLanguageTo.value) {
        termTo.value = '';
        return;
    }

    const targetLanguageCode = getLanguageCode(selectedLanguageTo.value);
    const translatedTerm = t(`tools.term.${targetLanguageCode}.${termFrom.value}`);
    termTo.value = translatedTerm;
}
</script>

<template>
    <div class="px-2 text-center">
        <h3 class="text-title-medium text-truncate w-100 ma-0 disable-text-select mb-4">
            Traducteur de terme
        </h3>

        <v-row>
            <v-col cols="5">
                <v-select label="Langue" v-model="selectedLanguageFrom" variant="outlined" density="compact"
                    style="margin: 10px; border-radius: 8px;" hide-details :items="language">
                </v-select>
                <v-select label="Terme" v-model="termFrom" variant="outlined" density="compact"
                    style="margin: 10px; border-radius: 8px;" hide-details :items="termList" item-title="title"
                    item-value="value" :disabled="selectedLanguageFrom == ''">
                </v-select>
            </v-col>

            <v-col cols="2" style="display: flex; align-items: center; justify-content: center;">
                <v-btn class="buttonColor" variant="tonal" size="medium" icon @click="translateTerm()">
                    <v-icon icon="mdi-arrow-right" size="24"></v-icon>
                </v-btn>
            </v-col>

            <v-col cols="5">
                <v-select label="Langue" v-model="selectedLanguageTo" variant="outlined" density="compact"
                    style="margin: 10px; border-radius: 8px;" hide-details :items="language">
                </v-select>
                <v-text-field label="Terme" v-model="termTo" variant="outlined" density="compact"
                    style="margin: 10px; border-radius: 8px;" hide-details readonly></v-text-field>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped></style>
