<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale, getLocaleMessage } = useI18n();

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

interface HookSize {
    mm: string;
    us: string;
    uk: string;
}

const sizeTypes = ['mm', 'us', 'uk'] as const;
type SizeType = typeof sizeTypes[number];

const getHookSizes = (): HookSize[] => {
    try {
        const messages = getLocaleMessage(locale.value as string);
        return (messages as any)?.tools?.hook?.sizes || [];
    } catch (e) {
        return [];
    }
};

const hookSizes = computed(() => getHookSizes());

const sizeLabels: Record<SizeType, string> = {
    mm: 'mm',
    us: 'US',
    uk: 'UK'
};

const sizeOptions = computed(() => [
    { title: sizeLabels.mm, value: 'mm' },
    { title: sizeLabels.us, value: 'us' },
    { title: sizeLabels.uk, value: 'uk' }
]);

const getSizesForType = (type: SizeType): Array<{ title: string; value: string }> => {
    if (!type) return [];
    return hookSizes.value
        .filter(size => size[type] !== '-')
        .map(size => ({
            title: size[type],
            value: size[type]
        }));
};

const selectedSizeTypeFrom = ref<SizeType | ''>('');
const selectedSizeValueFrom = ref('');
const selectedSizeTypeTo = ref<SizeType | ''>('');
const selectedSizeValueTo = ref('');

const sizeListFrom = computed(() => getSizesForType(selectedSizeTypeFrom.value as SizeType));

const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

const removeTermHook = (): void => {
    emit('remove', props.id)
}

const convertSize = (): void => {
    if (!selectedSizeValueFrom.value || !selectedSizeTypeTo.value) {
        selectedSizeValueTo.value = '';
        return;
    }

    // Find the size entry that matches the source value
    const sizeEntry = hookSizes.value.find(
        size => size[selectedSizeTypeFrom.value as SizeType] === selectedSizeValueFrom.value
    );

    if (sizeEntry) {
        selectedSizeValueTo.value = sizeEntry[selectedSizeTypeTo.value as SizeType];
    } else {
        selectedSizeValueTo.value = '';
    }
}
</script>

<template>
    <div class="box" style="position: relative;">
        <a style="right: 10px; top: 5px; position: absolute; cursor: pointer; z-index: 10;"
            @click.stop="removeTermHook()">
            <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
        </a>

        <div class="pa-4 text-center width-100">
            <div class="text-subtitle-1 font-weight-bold mb-2">Convertisseur taille crochet</div>

            <v-row>
                <v-col cols="5">
                    <v-select label="Type de taille" v-model="selectedSizeTypeFrom" variant="outlined" density="compact"
                        style="margin: 10px; border-radius: 8px;" hide-details :items="sizeOptions" item-title="title" item-value="value">
                    </v-select>
                    <v-select label="Taille" v-model="selectedSizeValueFrom" variant="outlined" density="compact"
                        style="margin: 10px; border-radius: 8px;" hide-details :items="sizeListFrom" item-title="title" item-value="value" :disabled="selectedSizeTypeFrom == ''">
                    </v-select>
                </v-col>

                <v-col cols="2" style="display: flex; align-items: center; justify-content: center;">
                    <v-btn class="buttonColor" variant="tonal" size="medium" icon @click="convertSize()">
                        <v-icon icon="mdi-arrow-right" size="24"></v-icon>
                    </v-btn>
                </v-col>

                <v-col cols="5">
                    <v-select label="Type de taille" v-model="selectedSizeTypeTo" variant="outlined" density="compact"
                        style="margin: 10px; border-radius: 8px;" hide-details :items="sizeOptions" item-title="title" item-value="value">
                    </v-select>
                    <v-text-field label="Taille" v-model="selectedSizeValueTo" variant="outlined" density="compact"
                        style="margin: 10px; border-radius: 8px;" hide-details readonly></v-text-field>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<style scoped>
.box {
    background-color: var(--dark-color);
    border-radius: 5px;
    border: 2px solid transparent;
    margin: 0 0 15px 10px;
    position: relative;
}

@media (max-width: 1250px) {
    .box {
        margin: 20px 0 5px 5px;
    }
}
</style>
