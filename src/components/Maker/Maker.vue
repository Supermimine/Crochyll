<script setup type="ts">
import BasicMenu from '../Menu/BasicMenu.vue';
import Pattern3D from './Pattern3D.vue';

// Enums et interfaces pour les modèles
enum StitchType {
    SC = 'sc', // single crochet
    DC = 'dc', // double crochet
    TR = 'tr', // treble crochet
    INC = 'inc', // increase
    DEC = 'dec', // decrease
    SL_ST = 'sl st', // slip stitch
    CH = 'ch', // chain
    HDC = 'hdc', // half double crochet
    // Ajouter d'autres types si nécessaire
}

interface Stitch {
    type: StitchType;
    count: number;
}

interface Row {
    stitches: Stitch[];
}

interface Pattern {
    rows: Row[];
    yarnSize: string;
    projectSize: string;
}

// Données réactives
const pattern = ref < Pattern > ({
    rows: [],
    yarnSize: '3mm',
    projectSize: '10cm x 10cm' // Exemple, à calculer plus tard
});

const yarnSizes = ['2mm', '2.5mm', '3mm', '3.5mm', '4mm', '5mm'];

const stitchTypes = [
    { value: StitchType.SC, label: 'SC (single crochet)' },
    { value: StitchType.DC, label: 'DC (double crochet)' },
    { value: StitchType.TR, label: 'TR (treble crochet)' },
    { value: StitchType.HDC, label: 'HDC (half double crochet)' },
    { value: StitchType.CH, label: 'CH (chain)' },
    { value: StitchType.INC, label: 'INC (increase)' },
    { value: StitchType.DEC, label: 'DEC (decrease)' },
    { value: StitchType.SL_ST, label: 'SL ST (slip stitch)' },
];

// Variables pour les outils
const selectedRow = ref < number > (0);
const selectedStitchType = ref < StitchType > (StitchType.SC);
const stitchCount = ref < number > (1);
const viewMode = ref<'2d' | '3d'>('2d');

// Gestion des raccourcis clavier
const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'n':
                event.preventDefault();
                addRow();
                break;
            case 's':
                event.preventDefault();
                exportPattern();
                break;
        }
    } else {
        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                if (selectedRow.value < pattern.value.rows.length) {
                    removeRow(selectedRow.value);
                }
                break;
        }
    }
};

// Fonctions pour manipuler le patron
const addRow = () => {
    pattern.value.rows.push({ stitches: [] });
};

const insertRowBefore = (index: number) => {
    pattern.value.rows.splice(index, 0, { stitches: [] });
};

const insertRowAfter = (index: number) => {
    pattern.value.rows.splice(index + 1, 0, { stitches: [] });
};

const duplicateRow = (index: number) => {
    const row = pattern.value.rows[index];
    pattern.value.rows.splice(index + 1, 0, { stitches: [...row.stitches] });
};

const addStitchToRow = (rowIndex: number, type: StitchType, count: number = 1) => {
    pattern.value.rows[rowIndex].stitches.push({ type, count });
};

const addStitch = () => {
    if (selectedRow.value < pattern.value.rows.length) {
        addStitchToRow(selectedRow.value, selectedStitchType.value, stitchCount.value);
    }
};

const removeRow = (rowIndex: number) => {
    pattern.value.rows.splice(rowIndex, 1);
};

const removeStitch = (rowIndex: number, stitchIndex: number) => {
    pattern.value.rows[rowIndex].stitches.splice(stitchIndex, 1);
};

// Calcul de la taille du projet (simple exemple)
const calculateProjectSize = computed(() => {
    // Logique simple : nombre de rangs * 1cm, etc.
    const rowCount = pattern.value.rows.length;
    const totalStitches = pattern.value.rows.reduce((sum, row) => sum + row.stitches.reduce((s, stitch) => s + stitch.count, 0), 0);
    const yarnSizeNum = parseFloat(pattern.value.yarnSize);
    // Approximation : chaque maille fait environ 0.5 * taille du crochet
    const width = Math.sqrt(totalStitches) * yarnSizeNum * 0.5;
    const height = rowCount * yarnSizeNum * 0.5;
    return `${width.toFixed(1)}cm x ${height.toFixed(1)}cm`;
});

// Fonction pour obtenir la couleur d'une maille
const getStitchColor = (type: StitchType) => {
    switch (type) {
        case StitchType.SC: return '#4CAF50'; // Vert
        case StitchType.DC: return '#2196F3'; // Bleu
        case StitchType.TR: return '#9C27B0'; // Violet
        case StitchType.HDC: return '#00BCD4'; // Cyan
        case StitchType.CH: return '#FFEB3B'; // Jaune
        case StitchType.INC: return '#FF9800'; // Orange
        case StitchType.DEC: return '#F44336'; // Rouge
        case StitchType.SL_ST: return '#795548'; // Marron
        default: return '#9E9E9E';
    }
};

// Fonction pour obtenir les mailles individuelles d'un rang
const getIndividualStitches = (row: Row) => {
    const result: { type: StitchType; count: number; localIndex: number }[] = [];
    for (const stitch of row.stitches) {
        for (let i = 0; i < stitch.count; i++) {
            result.push({ type: stitch.type, count: stitch.count, localIndex: i });
        }
    }
    return result;
};

// Fonction pour générer
const generatePattern = () => {
    console.log('Patron généré :', pattern.value);
};

// Fonction pour exporter le patron en texte
const exportPattern = () => {
    let text = `Patron de crochet\nTaille du fil: ${pattern.value.yarnSize}\nTaille estimée: ${calculateProjectSize.value}\n\n`;
    
    pattern.value.rows.forEach((row, index) => {
        text += `Rang ${index + 1}: `;
        row.stitches.forEach(stitch => {
            text += `${stitch.type} x${stitch.count}, `;
        });
        text = text.slice(0, -2) + '\n';
    });
    
    // Créer un blob et le télécharger
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patron-crochet.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

// Fonction pour exporter le patron en texte
const exportPattern = () => {
    let text = `Patron de crochet\nTaille du fil: ${pattern.value.yarnSize}\nTaille estimée: ${calculateProjectSize.value}\n\n`;
    
    pattern.value.rows.forEach((row, index) => {
        text += `Rang ${index + 1}: `;
        row.stitches.forEach(stitch => {
            text += `${stitch.type} x${stitch.count}, `;
        });
        text = text.slice(0, -2) + '\n';
    });
    
    // Créer un blob et le télécharger
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patron-crochet.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
</script>

<template>
    <BasicMenu />

    Feature à venir ;)
</template>