<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { yarnData } from '../../../data/yarnData';
import { Matter } from '@core/enum/matter';

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
        return [[], [], [], [], []]
    }

    const rgb = hexToRgb(baseColor)
    const hsl = rgbToHsl(rgb)

    const row1 = [
        baseColor,
        hslToHex({ h: (hsl.h - 22 + 360) % 360, s: Math.min(100, hsl.s * 1.0), l: Math.max(20, hsl.l * 0.93) }),
        hslToHex({ h: (hsl.h - 43 + 360) % 360, s: Math.min(100, hsl.s * 0.65), l: Math.max(15, hsl.l * 0.82) }),
        hslToHex({ h: (hsl.h - 75 + 360) % 360, s: Math.min(100, hsl.s * 0.35), l: Math.max(10, hsl.l * 1.05) }),
        hslToHex({ h: (hsl.h - 135 + 360) % 360, s: Math.min(100, hsl.s * 0.45), l: 26 })
    ]

    const row2 = [
        baseColor,
        hslToHex({ h: (hsl.h - 16 + 360) % 360, s: Math.min(100, hsl.s * 1.0), l: 53 }),
        hslToHex({ h: (hsl.h - 55 + 360) % 360, s: Math.min(100, hsl.s * 1.0), l: 43 }),
        hslToHex({ h: (hsl.h + 233) % 360, s: Math.min(100, hsl.s * 1.0), l: 65 }),
        hslToHex({ h: (hsl.h + 200) % 360, s: Math.min(100, hsl.s * 1.0), l: 50 })
    ]

    const row3 = [
        baseColor,
        hslToHex({ h: (hsl.h + 12) % 360, s: 17, l: 29 }),
        hslToHex({ h: (hsl.h + 12) % 360, s: 16, l: 69 }),
        hslToHex({ h: 120, s: 100, l: 30 }),
        hslToHex({ h: 120, s: 100, l: 19 })
    ]

    const row4 = [
        baseColor,
        hslToHex({ h: (hsl.h + 12) % 360, s: 17, l: 29 }),
        hslToHex({ h: (hsl.h + 12) % 360, s: 16, l: 69 }),
        hslToHex({ h: 202, s: 100, l: 50 }),
        hslToHex({ h: 196, s: 84, l: 41 })
    ]

    return [row1, row2, row3, row4]
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

const getYarn = (color: string): void => {
    selectedSwatchColor.value = color;

    if (!yarnData || yarnData.length === 0) {
        recommendedYarns.value = [];
        isModalOpen.value = true;
        return;
    }

    const yarnMatter = yarnData.filter(yarn => yarn.composition.includes(selectedMatter.value));

    const yarnsWithDistance = yarnMatter.map((yarn) => {
        if (!yarn.color || yarn.color.length === 0) {
            return { yarn, minDistance: Infinity };
        }
        const distances = yarn.color.map((yarnColorHex) => getColorDistance(color, yarnColorHex));
        return { yarn, minDistance: Math.min(...distances) };
    });

    yarnsWithDistance.sort((a, b) => a.minDistance - b.minDistance);

    recommendedYarns.value = yarnsWithDistance.slice(0, 3).map(item => item.yarn);
    isModalOpen.value = true;
}

const matterList = computed(() =>
    Object.keys(Matter)
        .filter(k => isNaN(Number(k)))
        .map(key => Matter[key as keyof typeof Matter])
        .map((matter) => ({
            title: t(`enum.matter.${matter}`),
            value: matter
        }))
);
</script>

<template>
    <div class="palette-widget-wrapper d-flex flex-column justify-space-between pa-2">
        <div class="px-2 text-center header-block">
            <h3 class="text-subtitle-1 text-truncate w-100 ma-0 disable-text-select">
                Générateur palette de couleurs
            </h3>
        </div>

        <div class="d-flex align-center justify-space-around flex-grow-1 w-100 main-content-row">
            
            <div class="input-container" @mousedown.stop>
                <v-color-input v-model="selectedColor" color-pip pip-variant="outlined" label="Color input"
                    variant="outlined" density="compact" hide-actions></v-color-input>
            </div>

            <div class="action-container">
                <v-btn class="buttonColor" variant="tonal" size="small" icon @click="generatePalette()">
                    <v-icon icon="mdi-arrow-right" size="20"></v-icon>
                </v-btn>
            </div>

            <div class="palette-grid-container">
                <div class="palette-container">
                    <div v-for="(row, rowIndex) in staticPalette" :key="rowIndex" class="swatches-row">
                        <div v-for="(color) in row" :key="color" :style="{ backgroundColor: color }"
                            class="swatch-item" :title="`Couleur : ${color}`" @click="getYarn(color)"></div>
                    </div>
                </div>
            </div>
            
        </div>

        <v-dialog v-model="isModalOpen" max-width="600px">
            <v-card class="pa-4" style="background-color: var(--main-color);">
                <v-card-title class="d-flex align-center justify-space-between border-b pb-2">
                    Laine ayant la couleur la plus proche de {{ selectedSwatchColor }} :
                </v-card-title>
                <v-card-text>
                    <v-select v-model="selectedMatter" :items="matterList" density="compact" variant="outlined"
                        hide-details class="mb-5" style="width: fit-content;"
                        @update:model-value="getYarn(selectedSwatchColor)">
                    </v-select>
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
                        Aucune correspondance de fil trouvée.
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

