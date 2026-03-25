<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import BasicMenu from '../Menu/BasicMenu.vue';
import Pattern3D from './Pattern3D.vue';

// Enums et interfaces pour les modèles
enum StitchType {
    MC = 'mc', // magic circle
    CH = 'ch', // chain
    SC = 'sc', // single crochet
    HDC = 'hdc', // half double crochet
    DC = 'dc', // double crochet
    TR = 'tr', // treble crochet
    TDR = 'tdr', // double treble crochet
    SL_ST = 'sl st', // slip stitch
    SK = 'sk', // skip
    CLOSE = 'close', // maille de fermeture
}

enum StitchOrientation {
    AL = 'al', // all loop
    BL = 'bl', // back loop
    FL = 'fl', // front loop
}

enum StitchAction {
    NULL = '',
    INC = 'inc',
    DEC = 'dec'
}

interface Stitch {
    type: StitchType;
    orientation: StitchOrientation;
    action: StitchAction;
    nbTime: number;
    count: number;
}

interface Row {
    stitches: Stitch[];
    isCircular?: boolean; // Indique si le rang doit être fermé en cercle
}

interface Pattern {
    rows: Row[];
    yarnSize: string;
    projectSize: string;
}

// Données réactives
const pattern = ref<Pattern>({
    rows: [],
    yarnSize: '3mm',
    projectSize: '10cm x 10cm' // Exemple, à calculer plus tard
});

const yarnSizes = ['2mm', '2.5mm', '3mm', '3.5mm', '4mm', '5mm'];

const stitchTypes = [
    { value: StitchType.MC, label: 'MC (magic circle)' },
    { value: StitchType.CH, label: 'CH (chain)' },
    { value: StitchType.SC, label: 'SC (single crochet)' },
    { value: StitchType.HDC, label: 'HDC (half double crochet)' },
    { value: StitchType.DC, label: 'DC (double crochet)' },
    { value: StitchType.TR, label: 'TR (treble crochet)' },
    { value: StitchType.TDR, label: 'TDR (double treble crochet)' },
    { value: StitchType.SL_ST, label: 'SL ST (slip stitch)' },
    { value: StitchType.SK, label: 'SK (skip)' },
    { value: StitchType.CLOSE, label: 'CLOSE (maille de fermeture)' },
];

const stitchOrientations = [
    { value: StitchOrientation.AL, label: 'AL (all loop) [default]' },
    { value: StitchOrientation.FL, label: 'FL (front loop)' },
    { value: StitchOrientation.BL, label: 'BL (back loop)' }
]

const stitchActions = [
    { value: StitchAction.NULL, label: '' },
    { value: StitchAction.INC, label: 'INC (increase)' },
    { value: StitchAction.DEC, label: 'DEC (decrease)' },
]

// Variables pour les outils
const selectedRow = ref<number>(0);
const selectedStitchType = ref<StitchType>(StitchType.SC);
const selectedStitchOritentation = ref<StitchOrientation>(StitchOrientation.AL);
const selectedStitchAction = ref<StitchAction>(StitchAction.NULL);
const stitchCount = ref<number>(1);
const stitchInStitchCount = ref<number>(2);
const viewMode = ref<'2d' | '3d'>('2d');

// Gestion des raccourcis clavier
const handleKeydown = (event: KeyboardEvent) => {
    if (event.altKey) {
        switch (event.key) {
            case 'a':
                event.preventDefault();
                addRow();
                break;
            case 's':
                event.preventDefault();
                exportPattern();
                break;
            case 'r':
                if (selectedRow.value < pattern.value.rows.length) {
                    removeRow(selectedRow.value);
                }
                break;
        }
    }
};

// Fonctions pour manipuler le patron
const addRow = () => {
    pattern.value.rows.push({ stitches: [], isCircular: false });
    selectedRow.value = pattern.value.rows.length - 1;
};

const insertRowBefore = (index: number) => {
    pattern.value.rows.splice(index, 0, { stitches: [], isCircular: false });
    selectedRow.value = index;
};

const insertRowAfter = (index: number) => {
    pattern.value.rows.splice(index + 1, 0, { stitches: [], isCircular: false });
    selectedRow.value = index + 1;
};

const duplicateRow = (index: number) => {
    const row = pattern.value.rows[index];
    pattern.value.rows.splice(index + 1, 0, { stitches: [...row.stitches], isCircular: row.isCircular || false });
    selectedRow.value = index + 1;
};

const addStitch = () => {
    if (selectedRow.value < pattern.value.rows.length) {
        const row = pattern.value.rows[selectedRow.value];
        if (selectedStitchType.value === StitchType.MC) {
            row.isCircular = true; // MC force les rangs circulaires
        }
        pattern.value.rows[selectedRow.value].stitches.push(
            {
                type: selectedStitchType.value,
                orientation: selectedStitchOritentation.value,
                action: selectedStitchAction.value,
                nbTime: stitchInStitchCount.value,
                count: stitchCount.value
            });
    }
};

const reorderStitch = (rowIndex: number, fromIndex: number, toIndex: number) => {
    const row = pattern.value.rows[rowIndex];
    if (!row || fromIndex < 0 || toIndex < 0 || fromIndex >= row.stitches.length || toIndex >= row.stitches.length) {
        return;
    }
    const [moved] = row.stitches.splice(fromIndex, 1);
    row.stitches.splice(toIndex, 0, moved);
};

const increaseStitchCount = (rowIndex: number, stitchIndex: number) => {
    const stitch = pattern.value.rows[rowIndex]?.stitches[stitchIndex];
    if (stitch) {
        stitch.count += 1;
    }
};

const decreaseStitchCount = (rowIndex: number, stitchIndex: number) => {
    const stitch = pattern.value.rows[rowIndex]?.stitches[stitchIndex];
    if (stitch && stitch.count > 1) {
        stitch.count -= 1;
    }
};

const onDragStart = (event: DragEvent, rowIndex: number, stitchIndex: number) => {
    event.dataTransfer?.setData('text/plain', JSON.stringify({ rowIndex, stitchIndex }));
    event.dataTransfer!.effectAllowed = 'move';
};

const onDrop = (event: DragEvent, rowIndex: number, stitchIndex: number) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement | null;
    target?.classList.remove('drag-over');

    const data = event.dataTransfer?.getData('text/plain');
    if (!data) return;

    try {
        const { rowIndex: fromRow, stitchIndex: fromIndex } = JSON.parse(data);
        if (fromRow === rowIndex && fromIndex !== stitchIndex) {
            reorderStitch(rowIndex, fromIndex, stitchIndex);
        }
    } catch (error) {
        console.error('Invalid drag data', error);
    }
};

const onDragOverEntry = (event: DragEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement | null;
    target?.classList.add('drag-over');
};

const onDragLeave = (event: DragEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    target?.classList.remove('drag-over');
};

const removeRow = (rowIndex: number) => {
    pattern.value.rows.splice(rowIndex, 1);
};

const removeStitch = (rowIndex: number, stitchIndex: number) => {
    pattern.value.rows[rowIndex].stitches.splice(stitchIndex, 1);
};

const toggleCircular = (rowIndex: number) => {
    const row = pattern.value.rows[rowIndex];
    const containsMC = row.stitches.some(stitch => stitch.type === StitchType.MC);
    if (containsMC) {
        row.isCircular = true;
        return;
    }
    row.isCircular = !row.isCircular;
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
        case StitchType.MC: return '#E91E63'; // Rose (magic circle)
        case StitchType.SC: return '#4CAF50'; // Vert
        case StitchType.DC: return '#2196F3'; // Bleu
        case StitchType.TR: return '#9C27B0'; // Violet
        case StitchType.HDC: return '#00BCD4'; // Cyan
        case StitchType.CH: return '#FFEB3B'; // Jaune
        case StitchType.SL_ST: return '#795548'; // Marron
        case StitchType.CLOSE: return '#000000'; // Noir pour maille de fermeture
        default: return '#9E9E9E';
    }
};

// Fonction pour obtenir le symbole d'une maille (visu 2D)
const getStitchSymbol = (type: StitchType, orientation: StitchOrientation, action: StitchAction, nbTime: number) => {
    let symbol = '';

    // 1. Symbole de base selon le type
    switch (type) {
        case StitchType.CH: symbol = '○'; break;
        case StitchType.SC: symbol = '+'; break;
        case StitchType.HDC: symbol = '⊥'; break;
        case StitchType.DC: symbol = 'T'; break;
        case StitchType.TR: symbol = 'Ŧ'; break;
        case StitchType.TDR: symbol = 'ŧ'; break;
        case StitchType.SL_ST: symbol = '—'; break;
        case StitchType.MC: symbol = '◎'; break;
        case StitchType.SK: symbol = ' '; break;
        case StitchType.CLOSE: symbol = '◉'; break;
        default: symbol = '·';
    }

    // 2. Notation d'action si applicable
    let notation = '';
    switch (action) {
        case StitchAction.INC: notation = `↑${nbTime}`; break;
        case StitchAction.DEC: notation = `↓${nbTime}`; break;
        case StitchAction.NULL: notation = ''; break;
    }

    // 3. Notation d'orientation si ce n'est pas ALL
    let orientationSuffix = '';
    switch (orientation) {
        case StitchOrientation.BL: orientationSuffix = '[BL]'; break;
        case StitchOrientation.FL: orientationSuffix = '[FL]'; break;
        case StitchOrientation.AL: orientationSuffix = ''; break;
    }

    return `${symbol}${notation}${orientationSuffix}`;
};

// Fonction pour obtenir les mailles individuelles d'un rang
const getIndividualStitches = (row: Row) => {
    const result: { type: StitchType; orientation: StitchOrientation; action: StitchAction; nbTime: number, count: number; localIndex: number }[] = [];
    for (const stitch of row.stitches) {
        for (let i = 0; i < stitch.count; i++) {
            result.push({ type: stitch.type, orientation: stitch.orientation, action: stitch.action, nbTime: stitch.nbTime, count: stitch.count, localIndex: i });
        }
    }
    return result;
};

// Fonction pour générer
const generatePattern = () => {
    console.log('Patron généré :', pattern.value);
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
        text += `Rang ${index + 1}${row.isCircular ? ' (cercle)' : ''}: `;
        row.stitches.forEach(stitch => {
            text += `${stitch.type} x${stitch.count}, `;
        });
        text = text.slice(0, -2);
        if (row.isCircular) {
            text += ' - Fermer avec une maille coulée dans la première maille';
        }
        text += '\n';
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
    <div class="maker-page">
        <BasicMenu />

        <div class="maker-content">
            <!-- Menu d'outils -->
            <aside class="tools-menu">
                <h3>Outils de création</h3>
                <div class="shortcuts">
                    <small>Raccourcis: ALT+A (nouveau rang), ALT+S (exporter), ALT+R (supprimer rang)</small>
                </div>
                <div class="info-box">
                    <small><strong>💡 Conseils:</strong></small><br />
                    <small>• <strong>Cercle (🔄):</strong> Cliquez pour fermer le rang en cercle (joint première et
                        dernière maille)</small><br />
                    <small>• <strong>Déplacement de mailles:</strong> Cliquer et déplacer pour reclasser les mailles</small><br />
                    <small>• <strong>Modifier quantité:</strong> Utilisez les flèches ◀▶ dans chaque maille pour
                        modifier leurs quantité</small><br />
                    <small>• <strong>Sélection:</strong> Cliquez sur un rang pour ajouter des mailles dedans</small>
                </div>
                <button class="buttonOutsideInverted" @click="addRow">Ajouter un rang</button>
                <div class="stitch-tools">
                    <h4>Ajouter une maille</h4>
                    <div class="row-selector">
                        <label>Sélectionner le rang :</label>
                        <div class="row-buttons" v-if="pattern.rows.length > 0">
                            <button v-for="(row, index) in pattern.rows" :key="index" class="row-btn"
                                :class="{ active: selectedRow === index }" @click="selectedRow = index">
                                Rang {{ index + 1 }} {{ row.isCircular ? '🔄' : '' }}
                            </button>
                        </div>
                        <div v-else style="color: #999; font-size: 12px;">Créez un rang d'abord</div>
                    </div>
                    <label>Type de maille :</label>
                    <v-select v-model="selectedStitchType" :items="stitchTypes" item-title="label" item-value="value"
                        density="compact" variant="solo" hide-details="auto" />

                    <label>Orientation :</label>
                    <v-select v-model="selectedStitchOritentation" :items="stitchOrientations" item-title="label"
                        item-value="value" density="compact" variant="solo" hide-details="auto" />

                    <div class="mt-6 mb-6">
                        <label>Action :</label>
                        <v-select v-model="selectedStitchAction" :items="stitchActions" item-title="label"
                            item-value="value" density="compact" variant="solo" hide-details="auto" />

                        <div v-if="selectedStitchAction != StitchAction.NULL" class="d-flex mt-2">
                            <v-icon icon="mdi-close" size="15" class="ml-1 ma-auto"></v-icon>
                            <v-text-field v-model.number="stitchInStitchCount" type="number" min="2" density="compact"
                                variant="solo" hide-details="auto" style="width: 50%;" label="Nb dans 1 maille" />
                        </div>
                    </div>

                    <label>Nb de fois :</label>
                    <v-text-field v-model.number="stitchCount" type="number" min="1" density="compact" variant="solo"
                        hide-details="auto" />

                    <button class="buttonOutsideInverted" @click="addStitch"
                        :disabled="selectedRow >= pattern.rows.length || pattern.rows.length === 0">Ajouter
                        maille</button>
                </div>
                <div class="yarn-size">
                    <label>Taille du fil :</label>
                    <v-select v-model="pattern.yarnSize" :items="yarnSizes" density="compact" variant="solo"
                        hide-details="auto" />
                </div>
                <div class="project-size">
                    <p>Taille du projet : {{ calculateProjectSize }}</p>
                </div>
                <button @click="generatePattern" class="buttonColor">Générer</button>
                <button @click="exportPattern" class="buttonOutsideInverted">Exporter TXT</button>
            </aside>

            <!-- Section principale : visualisation du patron -->
            <main class="pattern-view">
                <h2>Patron de crochet</h2>
                <div class="view-toggle">
                    <button class="buttonOutsideInverted" @click="viewMode = '2d'"
                        :class="{ active: viewMode === '2d' }">Vue 2D</button>
                    <button class="buttonOutsideInverted" @click="viewMode = '3d'"
                        :class="{ active: viewMode === '3d' }">Vue 3D</button>
                </div>
                <div v-if="pattern.rows.length === 0" class="empty-pattern">
                    Aucun rang ajouté. Utilisez les outils pour commencer.
                </div>
                <div v-else>
                    <!-- Prévisualisation visuelle -->
                    <div v-if="viewMode === '2d'" class="preview-section">
                        <h3>Prévisualisation 2D</h3>
                        <div class="stitch-grid">
                            <div v-for="(row, rowIndex) in pattern.rows.slice().reverse()"
                                :key="`grid-row-${pattern.rows.length - 1 - rowIndex}`"
                                :class="{ 'grid-row-circular': row.isCircular, 'grid-row': !row.isCircular }">
                                <div v-for="(stitchInfo, index) in getIndividualStitches(row)" :key="index"
                                    class="stitch-circle"
                                    :data-symbol="getStitchSymbol(stitchInfo.type, stitchInfo.orientation, stitchInfo.action, stitchInfo.nbTime)"
                                    :style="{ backgroundColor: getStitchColor(stitchInfo.type), color: '#000' }"
                                    :title="`${stitchInfo.type} (${stitchInfo.localIndex + 1}/${stitchInfo.count})`">
                                    {{ getStitchSymbol(stitchInfo.type, stitchInfo.orientation, stitchInfo.action,
                                    stitchInfo.nbTime) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="viewMode === '3d'" class="preview-section">
                        <h3>Prévisualisation 3D</h3>
                        <Pattern3D :pattern="pattern" />
                    </div>

                    <!-- Liste des rangs -->
                    <div class="rows-container">
                        <div v-for="(row, rowIndex) in pattern.rows" :key="rowIndex" class="row">
                            <div class="row-header">
                                <h4>Rang {{ rowIndex + 1 }} {{ row.isCircular ? '🔄' : '' }}</h4>
                                <div class="row-actions">
                                    <button class="buttonOutsideInverted small"
                                        @click="insertRowBefore(rowIndex)">Insérer avant</button>
                                    <button class="buttonOutsideInverted small"
                                        @click="insertRowAfter(rowIndex)">Insérer après</button>
                                    <button class="buttonOutsideInverted small"
                                        @click="duplicateRow(rowIndex)">Dupliquer</button>
                                    <button class="buttonOutsideInverted small" :class="{ active: row.isCircular }"
                                        @click="toggleCircular(rowIndex)">🔄 Cercle</button>
                                    <button class="buttonColor" @click="removeRow(rowIndex)">Supprimer</button>
                                </div>
                            </div>
                            <div class="stitches">
                                <span v-for="(stitch, stitchIndex) in row.stitches" :key="stitchIndex" class="stitch"
                                    draggable="true" @dragstart="onDragStart($event, rowIndex, stitchIndex)"
                                    @dragover="onDragOverEntry($event)" @dragleave="onDragLeave($event)"
                                    @drop="onDrop($event, rowIndex, stitchIndex)">
                                    <button class="stitch-move" :disabled="stitch.count <= 1"
                                        @click="decreaseStitchCount(rowIndex, stitchIndex)">◀</button>
                                    <strong>{{ stitch.type }} x{{ stitch.count }}</strong>
                                    <small v-if="stitch.orientation !== StitchOrientation.AL" style="opacity:0.7">[{{
                                        stitch.orientation }}]</small>
                                    <small v-if="stitch.action !== StitchAction.NULL"
                                        style="opacity:0.7; color:#f39c12">{{ stitch.action }}({{ stitch.nbTime
                                        }})</small>
                                    <button class="stitch-move"
                                        @click="increaseStitchCount(rowIndex, stitchIndex)">▶</button>
                                    <a style="cursor: pointer;" @click="removeStitch(rowIndex, stitchIndex)">
                                        <v-icon icon="mdi-close" size="20"></v-icon>
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
.maker-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.maker-content {
    display: flex;
    flex: 1;
}

.tools-menu {
    width: 300px;
    padding: 20px;
    background-color: var(--dark-color);
    border-right: 1px solid #ccc;
}

.tools-menu h3,
.tools-menu h4 {
    margin-top: 0;
}

.shortcuts {
    margin-bottom: 10px;
    color: #666;
}

.info-box {
    margin-bottom: 15px;
    padding: 8px;
    background-color: var(--light-color);
    border-radius: 4px;
    border-left: 3px solid var(--primary-color);
}

.tools-menu button {
    margin: 5px 0;
    padding: 8px 12px;
    cursor: pointer;
}

.stitch-tools {
    margin: 20px 0;
}

.row-selector {
    margin-bottom: 15px;
}

.row-selector label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 12px;
}

.row-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 10px;
}

.row-btn {
    padding: 5px 10px;
    font-size: 11px;
    border: 1px solid #ccc;
    background-color: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

.row-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    font-weight: bold;
}

.row-btn:hover {
    background-color: #e0e0e0;
}

.row-btn.active:hover {
    background-color: var(--primary-color);
}

.yarn-size,
.project-size {
    margin: 20px 0;
}

.generate-btn {
    border: none;
    padding: 10px 15px;
    cursor: pointer;
}

.pattern-view {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.empty-pattern {
    text-align: center;
    opacity: 0.8;
}

.preview-section {
    margin-bottom: 30px;
    padding: 20px;
    background-color: var(--light-color);
    border-radius: 8px;
}

.preview-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
}

.stitch-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.grid-row {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
}

.grid-row-circular {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 200px;
    height: 200px;
    border: 2px dashed #999;
    position: relative;
}

.grid-row-circular::before {
    content: 'Cercle';
    position: absolute;
    font-size: 10px;
    color: #999;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
}

.stitch-circle {
    width: 22px;
    height: 22px;
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #111;
    background-color: transparent !important;
}

.stitch-circle:hover {
    transform: scale(1.3);
}

.stitch-circle[data-symbol='T'] {
    font-size: 14px;
}

.stitch-circle[data-symbol='⟟'] {
    font-size: 14px;
}


.stitch-move {
    background: transparent;
    border: 1px solid #999;
    color: #333;
    border-radius: 4px;
    padding: 2px 5px;
    margin-right: 4px;
    cursor: pointer;
    font-size: 10px;
    line-height: 1;
}

.stitch-move:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.rows-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.row {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background-color: var(--light-color);
}

.row-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.row-header h4 {
    margin: 0;
}

.row-actions {
    display: flex;
    gap: 5px;
}

.row-actions button {
    padding: 5px 8px;
    font-size: 12px;
}

.stitches {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;
}

.stitch {
    background-color: #e0e0e0;
    padding: 5px 10px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: grab;
}

.stitch:active {
    cursor: grabbing;
}

.stitch.drag-over {
    border: 2px dashed #2196F3;
}

.small {
    font-size: 11px;
    padding: 3px 6px;
}
</style>