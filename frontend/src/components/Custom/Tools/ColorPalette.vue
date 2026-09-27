<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { yarnData } from '../../../data/yarnData';
import { Matter } from '@core/enum/matter';
import { useScreen } from '@/tools/appTools';

const { isMobile } = useScreen();
const { t } = useI18n();

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

const selectedColor = ref<string>('')
const isModalOpen = ref<boolean>(false)
const selectedSwatchColor = ref<string>('')
const recommendedYarns = ref<{ name: string, color: string[], link: string }[]>([])
const selectedMatter = ref<Matter>(Matter.Acrylic)
const selectedYarnName = ref<string[]>([t('tools.colorPalette.all')]);

interface RGB {
    r: number
    g: number
    b: number
}

interface HSL {
    h: number
    s: number
    l: number
}

type SwatchesMatrix = string[][]

function hexToRgb(hex: string): RGB {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function rgbToHsl({ r, g, b }: RGB): HSL {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: HSL): string {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return rgbToHex(
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    );
}

function generate603010Palette(baseColor: string): SwatchesMatrix {
    if (!baseColor) {
        return [[], [], [], []];
    }

    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb);

    let safeH = hsl.h;
    let safeS = hsl.s;
    let safeL = hsl.l;

    if (hsl.s < 5 || hsl.l < 10 || hsl.l > 90) {
        if (hsl.h === 0 && hsl.s === 0) {
            safeH = 210;
        }
        safeS = 65;
        safeL = 50;
    }

    const row1 = [
        baseColor,
        hslToHex({ h: (safeH - 30 + 360) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH - 15 + 360) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 15) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 30) % 360, s: safeS, l: safeL })
    ];

    const row2 = [
        baseColor,
        hslToHex({ h: (safeH + 180) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 150) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 210) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 180) % 360, s: safeS, l: Math.max(15, safeL * 0.5) })
    ];

    const row3 = [
        baseColor,
        hslToHex({ h: (safeH + 120) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 240) % 360, s: safeS, l: safeL }),
        hslToHex({ h: (safeH + 120) % 360, s: Math.min(100, safeS * 0.8), l: Math.min(90, safeL * 1.2) }),
        hslToHex({ h: (safeH + 240) % 360, s: safeS, l: Math.max(15, safeL * 0.6) })
    ];

    const isLightColor = hsl.l >= 50;
    const row4 = [
        baseColor,
        isLightColor 
            ? hslToHex({ h: hsl.h, s: hsl.s, l: Math.max(0, hsl.l * 0.75) })
            : hslToHex({ h: hsl.h, s: hsl.s, l: Math.min(100, hsl.l + (100 - hsl.l) * 0.25) }),
        
        isLightColor 
            ? hslToHex({ h: hsl.h, s: hsl.s, l: Math.max(0, hsl.l * 0.50) })
            : hslToHex({ h: hsl.h, s: hsl.s, l: Math.min(100, hsl.l + (100 - hsl.l) * 0.50) }),
        
        isLightColor 
            ? hslToHex({ h: hsl.h, s: hsl.s, l: Math.max(0, hsl.l * 0.25) })
            : hslToHex({ h: hsl.h, s: hsl.s, l: Math.min(100, hsl.l + (100 - hsl.l) * 0.75) }),
        
        isLightColor 
            ? hslToHex({ h: hsl.h, s: hsl.s, l: 8 })
            : hslToHex({ h: hsl.h, s: hsl.s, l: 95 })
    ];

    return [row1, row2, row3, row4];
}

const staticPalette = ref<SwatchesMatrix>(generate603010Palette(selectedColor.value))

const generatePalette = (): void => {
    staticPalette.value = generate603010Palette(selectedColor.value)
}

const getColorDistance = (hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
}

const cleanYarnName = (name: string): string => {
    return name.replace(/\s*\(.*?\)\s*/g, '').trim();
};

const getYarn = (color: string): void => {
    if (!color) return;

    selectedSwatchColor.value = color;

    if (!yarnData || yarnData.length === 0) {
        recommendedYarns.value = [];
        isModalOpen.value = true;
        return;
    }

    recommendedYarns.value = yarnData
        .filter(yarn => yarn.composition.includes(selectedMatter.value))

        .filter(yarn => {
            const hasNoSelection = !selectedYarnName.value || selectedYarnName.value.length === 0;
            const isAllSelected = selectedYarnName.value.includes(t('tools.colorPalette.all'));

            if (hasNoSelection || isAllSelected) return true;

            const cleanedName = cleanYarnName(yarn.name);
            return selectedYarnName.value.includes(cleanedName);
        })

        .map((yarn) => {
            if (!yarn.color || yarn.color.length === 0) {
                return { yarn, minDistance: Infinity };
            }
            const distances = yarn.color.map((yarnColorHex) => getColorDistance(color, yarnColorHex));
            return { yarn, minDistance: Math.min(...distances) };
        })
        .sort((a, b) => a.minDistance - b.minDistance)
        .slice(0, 3)
        .map(item => item.yarn);

    isModalOpen.value = true;
}

const handleYarnNameChange = (newSelection: string[]): void => {
    if (newSelection.length > 1 && newSelection.includes(t('tools.colorPalette.all'))) {
        const lastSelected = newSelection[newSelection.length - 1];

        if (lastSelected === t('tools.colorPalette.all')) {
            selectedYarnName.value = [t('tools.colorPalette.all')];
        } else {
            selectedYarnName.value = newSelection.filter(name => name !== t('tools.colorPalette.all'));
        }
    } else if (newSelection.length === 0) {
        selectedYarnName.value = [t('tools.colorPalette.all')];
    } else {
        selectedYarnName.value = newSelection;
    }

    getYarn(selectedSwatchColor.value);
};


const matterList = computed(() =>
    Object.keys(Matter)
        .filter(k => isNaN(Number(k)))
        .map(key => Matter[key as keyof typeof Matter])
        .map((matter) => ({
            title: t(`enum.matter.${matter}`),
            value: matter
        }))
);

const yarnNameList = computed<string[]>(() => {
    if (!yarnData) return [t('tools.colorPalette.all')];

    const filteredYarns = yarnData.filter(yarn =>
        yarn.composition.includes(selectedMatter.value)
    );

    const names = filteredYarns.map(yarn => cleanYarnName(yarn.name));

    const uniqueNames = Array.from(new Set(names));
    return [t('tools.colorPalette.all'), ...uniqueNames];
});
</script>

<template>
    <div class="palette-widget-wrapper d-flex flex-column justify-space-between pa-2">
        <div class="px-2 text-center header-block">
            <h3 class="text-subtitle-1 text-truncate w-100 ma-0 disable-text-select">
                {{ t('tools.tool.colorPalette') }}
            </h3>
        </div>

        <div class="d-flex align-center justify-space-around flex-grow-1 w-100 main-content-row">

            <div class="input-container" @mousedown.stop>
                <v-color-input v-model="selectedColor" color-pip pip-variant="outlined"
                    :label="t('tools.colorPalette.color')" variant="outlined" density="compact"
                    hide-actions></v-color-input>
            </div>

            <div class="action-container">
                <v-btn class="buttonColor" variant="tonal" size="small" icon @click="generatePalette()">
                    <v-icon icon="mdi-arrow-right" size="20"></v-icon>
                </v-btn>
            </div>

            <div class="palette-grid-container">
                <div class="palette-container">
                    <div v-for="(row, rowIndex) in staticPalette" :key="rowIndex" class="swatches-row">
                        <div v-for="(color) in row" :key="color" :style="{ backgroundColor: color }" class="swatch-item"
                            :title="`Couleur : ${color}`" @click="getYarn(color)"></div>
                    </div>
                </div>
            </div>

        </div>

        <v-dialog v-model="isModalOpen" max-width="600px">
            <v-card class="pa-4" style="background-color: var(--main-color);">
                <v-card-title class="d-flex align-center justify-space-between border-b pb-2">
                    <div class="d-flex">
                        <p>{{ t('tools.colorPalette.closest') }}</p>
                        <a :style="{ backgroundColor: selectedSwatchColor }" class="swatch-item ml-2 mr-2 mt-1"
                            :title="`Couleur : ${selectedSwatchColor}`"></a> :
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col :cols="isMobile ? 6 : 5">
                            <v-select v-model="selectedMatter" :items="matterList" density="compact" variant="outlined"
                                hide-details class="mb-5 w-100"
                                @update:model-value="getYarn(selectedSwatchColor)">
                            </v-select>
                        </v-col>

                        <v-col :cols="isMobile ? 6 : 3">
                            <v-select v-model="selectedYarnName" :items="yarnNameList" multiple chips density="compact"
                                variant="outlined" hide-details class="mb-5" @update:model-value="handleYarnNameChange">
                            </v-select>
                        </v-col>
                    </v-row>
                    <div v-if="recommendedYarns.length > 0">
                        <div v-for="(yarn, index) in recommendedYarns" :key="index" class="mb-4">
                            <div class="d-flex">
                                <label class="font-weight-bold mr-2">{{ yarn.name }}</label>
                                <a v-for="(color) in yarn.color" :key="color" :style="{ backgroundColor: color }"
                                    class="swatch-item" :title="`Couleur : ${color}`" :href="yarn.link"></a>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        {{ t('tools.colorPalette.empty') }}
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<style scoped>
.palette-widget-wrapper {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
}

.header-block {
    height: auto;
}

.main-content-row {
    min-height: 0;
}

.input-container {
    max-width: 170px;
    width: 100%;
}

:deep(.v-input__details) {
    display: none !important;
}

.palette-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px;
    border-radius: 8px;
    width: fit-content;
}

.palette-grid-container {
    min-width: 33%;
}

.swatches-row {
    display: flex;
    gap: 4px;
}

.swatch-item {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.15);
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.swatch-item:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    z-index: 5;
    border-color: #ffffff;
}
</style>
