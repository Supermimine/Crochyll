<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useScreen } from '@/tools/appTools';
import BasicMenu from '../Menu/BasicMenu.vue';
import Pattern3D from './Pattern3D.vue';

import { StitchType } from '@core/enum/stitchType';
import { StitchOrientation } from '@core/enum/stitchOrientation';
import { StitchAction } from '@core/enum/stitchAction';
import type { Row } from '@core/model/maker/row';
import type { Pattern } from '@core/model/maker/pattern';
import { useHead } from '@unhead/vue';

const { t } = useI18n();
const { isMobile } = useScreen();

const pattern = ref<Pattern>({
    rows: [],
    yarnSize: '4',
    projectSize: ''
});

const yarnSizes = ['0', '1', '2', '3', '4', '5', '6', '7'];

const stitchTypes = computed(() => [
    { value: StitchType.MC, label: t('stitchType.MC') },
    { value: StitchType.CH, label: t('stitchType.CH') },
    { value: StitchType.SC, label: t('stitchType.SC') },
    { value: StitchType.HDC, label: t('stitchType.HDC') },
    { value: StitchType.DC, label: t('stitchType.DC') },
    { value: StitchType.TR, label: t('stitchType.TR') },
    { value: StitchType.TDR, label: t('stitchType.TDR') },
    { value: StitchType.SL_ST, label: t('stitchType.SL_ST') },
    { value: StitchType.SK, label: t('stitchType.SK') },
    { value: StitchType.CLOSE, label: t('stitchType.CLOSE') },
]);

const stitchOrientations = computed(() => [
    { value: StitchOrientation.AL, label: t('stitchOrientation.AL') },
    { value: StitchOrientation.FL, label: t('stitchOrientation.FL') },
    { value: StitchOrientation.BL, label: t('stitchOrientation.BL') }
]);

const stitchActions = computed(() => {
    const actions = [
        {
            value: StitchAction.NULL,
            label: t('stitchAction.NULL')
        },
        {
            value: StitchAction.INC,
            label: t('stitchAction.INC')
        },
        {
            value: StitchAction.DEC,
            label: t('stitchAction.DEC')
        }
    ];

    if (selectedRow.value > 0) {
        actions.push({
            value: StitchAction.TRANSITION,
            label: t('stitchAction.TRANSITION')
        });
    }

    return actions;
});

// Variables pour les outils
const selectedRow = ref<number>(0);
const selectedStitchType = ref<StitchType>(StitchType.SC);
const selectedStitchOritentation = ref<StitchOrientation>(StitchOrientation.AL);
const selectedStitchAction = ref<StitchAction>(StitchAction.NULL);
const stitchCount = ref<number>(1);
const stitchInStitchCount = ref<number>(2);
const viewMode = ref<'2d' | '3d' | null>(null);
const openInfo = ref<boolean>(false);
const mobileMode = ref<'stitch' | 'row'>('row')

const translateY = ref(0)
const isDragging = ref(false)

let startY = 0
let initialTranslateY = 0

const minTranslate = 0
const maxTranslate = ref(460)

// Gestion des raccourcis clavier
const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
            case 'A':
                event.preventDefault();
                addRow();
                break;
            case 'L':
                addStitch()
                break;
            case 'S':
                event.preventDefault();
                exportPattern();
                break;
            case 'R':
                event.preventDefault();
                if (selectedRow.value < pattern.value.rows.length) {
                    removeRow(selectedRow.value);
                }
                break;
        }
    }
};

// Fonctions pour manipuler le patron
const addRow = () => {
    let isCircular = false;
    if (pattern.value.rows.length - 1 != -1) {
        isCircular = pattern.value.rows[pattern.value.rows.length - 1].isCircular || false;
    }

    pattern.value.rows.push({ stitches: [], isCircular: isCircular });
    selectedRow.value = pattern.value.rows.length - 1;
};

const insertRowBefore = (index: number) => {
    pattern.value.rows.splice(index, 0, { stitches: [], isCircular: false });
    selectedRow.value = index;
};

const insertRowAfter = (index: number) => {
    pattern.value.rows.splice(index + 1, 0, { stitches: [], isCircular: pattern.value.rows[index].isCircular });
    selectedRow.value = index + 1;
};

const duplicateRow = (index: number) => {
    const row = pattern.value.rows[index];
    pattern.value.rows.splice(index + 1, 0, {
        stitches: row.stitches.map(stitch => ({ ...stitch })),
        isCircular: row.isCircular || false
    });
    selectedRow.value = index + 1;
};

const addStitch = () => {
    if (selectedRow.value < pattern.value.rows.length) {
        const row = pattern.value.rows[selectedRow.value];

        if (selectedStitchAction.value === StitchAction.TRANSITION) {
            selectedStitchType.value = StitchType.CH;
        }

        if (selectedStitchType.value === StitchType.MC) {
            row.isCircular = true;
        }

        const newStitch = {
            type: selectedStitchType.value,
            orientation: selectedStitchOritentation.value,
            action: selectedStitchAction.value,
            nbTime: stitchInStitchCount.value,
            count: stitchCount.value
        };
        const lastStitch = row.stitches[row.stitches.length - 1] ? JSON.parse(JSON.stringify(row.stitches[row.stitches.length - 1])) : null;

        if (lastStitch &&
            lastStitch.type === newStitch.type &&
            lastStitch.orientation === newStitch.orientation &&
            lastStitch.action === newStitch.action &&
            lastStitch.nbTime === newStitch.nbTime) {
            row.stitches[row.stitches.length - 1].count += stitchCount.value;
        } else {
            pattern.value.rows[selectedRow.value].stitches.push(newStitch);
        }
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
    selectedRow.value = pattern.value.rows.length - 1;
};

const removeStitch = (rowIndex: number, stitchIndex: number) => {
    pattern.value.rows[rowIndex].stitches.splice(stitchIndex, 1);
};

const toggleCircular = (rowIndex: number) => {
    const row = pattern.value.rows[rowIndex];
    const containsMC = row.stitches.some((s: { type: StitchType; }) => s.type === StitchType.MC);
    if (containsMC) {
        row.isCircular = true;
        return;
    }
    row.isCircular = !row.isCircular;
};

const calculateProjectSize = computed(() => {
    const yarnSizeNum = getYarnHeight(parseFloat(pattern.value.yarnSize)) / 10;

    let totalHeight = 0;
    let maxWidthStitches = 0;

    for (const row of pattern.value.rows) {
        let rowHeight = 0;
        for (const stitch of row.stitches) {
            const h = getStitchHeight(stitch.type);
            if (h > rowHeight) rowHeight = h;
        }
        totalHeight += rowHeight;

        let effectiveStitches = 0;
        for (const stitch of row.stitches) {
            effectiveStitches += stitch.count;
            if (stitch.action === StitchAction.INC) {
                effectiveStitches += (stitch.nbTime - 1) * stitch.count;
            } else if (stitch.action === StitchAction.DEC) {
                effectiveStitches -= (stitch.nbTime - 1) * stitch.count;
            }
        }
        if (effectiveStitches > maxWidthStitches) maxWidthStitches = effectiveStitches;
    }
    const stitchWidth = 0.5 * yarnSizeNum;
    const width = maxWidthStitches * stitchWidth;
    const height = totalHeight;

    return `${width.toFixed(1)}cm x ${height.toFixed(1)}cm`;
});

const getYarnHeight = (size: number): number => {
    switch (size) {
        case 0: return 2;
        case 1: return 2.75;
        case 2: return 3.5;
        case 3: return 4.13;
        case 4: return 5;
        case 5: return 6.75;
        case 6: return 10.38;
        case 7: return 13;
        default: return 0;
    }
};

const getStitchHeight = (type: StitchType) => {
    switch (type) {
        case StitchType.CH: return 0.1;
        case StitchType.SC: return 0.25;
        case StitchType.HDC: return 0.5;
        case StitchType.DC: return 0.75;
        case StitchType.TR: return 1;
        case StitchType.TDR: return 1.25;
        case StitchType.SL_ST: return 0.1;
        case StitchType.MC: return 1;
        default: return 1;
    }
};

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

const getStitchSymbol = (type: StitchType, orientation: StitchOrientation, action: StitchAction, nbTime: number) => {
    let base = '';

    switch (type) {
        case StitchType.CH:
            base = '<image href="/img/maker/CH.png" x="0" y="0" width="24" height="24" />';
            break;
        case StitchType.SC:
            if (action === StitchAction.INC) {
                switch (nbTime) {
                    case 2: base = '<image href="/img/maker/SC_Aug.png" x="0" y="0" width="24" height="24" />'; break;
                    case 3: base = '<image href="/img/maker/SC_Aug3.png" x="0" y="0" width="24" height="24" />'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = '<image href="/img/maker/SC_Aug.png" x="0" y="0" width="24" height="24" />'; break;
                }
            } else if (action === StitchAction.DEC) {
                switch (nbTime) {
                    case 2: base = '<image href="/img/maker/SC_Dim.png" x="0" y="0" width="24" height="24" />'; break;
                    case 3: base = '<image href="/img/maker/SC_Dim3.png" x="0" y="0" width="24" height="24" />'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = '<image href="/img/maker/SC_Dim.png" x="0" y="0" width="24" height="24" />'; break;
                }
            } else {
                base = '<image href="/img/maker/SC.png" x="0" y="0" width="24" height="24" />';
            }
            break;
        case StitchType.HDC:
            if (action === StitchAction.INC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else if (action === StitchAction.DEC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else {
                base = '<image href="/img/maker/HDC.png" x="0" y="0" width="24" height="24" />';
            }
            break;
        case StitchType.DC:
            if (action === StitchAction.INC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else if (action === StitchAction.DEC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else {
                base = '<image href="/img/maker/DC.png" x="0" y="0" width="24" height="24" />';
            }
            break;
        case StitchType.TR:
            if (action === StitchAction.INC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else if (action === StitchAction.DEC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else {
                base = '<image href="/img/maker/TR.png" x="0" y="0" width="24" height="24" />';
            }
            break;
        case StitchType.TDR:
            if (action === StitchAction.INC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else if (action === StitchAction.DEC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else {
                base = '<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="12" font-family="monospace" fill="black">ŧ</text>';
            }
            break;
        case StitchType.SL_ST:
            if (action === StitchAction.INC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else if (action === StitchAction.DEC) {
                switch (nbTime) {
                    case 2: base = 'TODO'; break;
                    case 3: base = 'TODO'; break;
                    case 4: base = 'TODO'; break;
                    case 5: base = 'TODO'; break;
                    case 6: base = 'TODO'; break;
                    case 7: base = 'TODO'; break;
                    case 8: base = 'TODO'; break;
                    default: base = 'TODO'; break;
                }
            } else {
                base = '<image href="/img/maker/SL_ST.png" x="0" y="0" width="24" height="24" />';
            }
            break;
        case StitchType.MC:
            base = '<image href="/img/maker/MC.png" x="0" y="0" width="24" height="24" />';
            break;
        case StitchType.SK:
            base = ' ';
            break;
        case StitchType.CLOSE:
            base = '<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="12" font-family="monospace" fill="black">◉</text>';
            break;
        default: base = '·';
    }

    const svg =
        `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            ${base}
        </svg>`;

    return svg;
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

const getStitchStyle = (
    row: Row,
    stitchIndex: number,
    rowIndex: number
) => {
    if (!row.isCircular) return '';

    const stitches = getIndividualStitches(row);
    const totalStitches = stitches.length;

    const centerX = 100;
    const centerY = 100;

    // --------------------------------------------------
    // Trouver le premier rang circulaire
    // --------------------------------------------------
    let firstCircularRow: Row | null = null;

    for (let i = 0; i < pattern.value.rows.length; i++) {
        if (pattern.value.rows[i].isCircular) {
            firstCircularRow = pattern.value.rows[i];
            break;
        }
    }

    const firstCircularStitches = firstCircularRow
        ? getIndividualStitches(firstCircularRow).length
        : totalStitches;

    const stitchSpacing = 15;

    const baseRadius = Math.max(
        10,
        (firstCircularStitches * stitchSpacing) / (2 * Math.PI)
    );

    // Jusqu'a 9 mailles, le premier rang circulaire definit un polygone.
    // A partir de 10 mailles, le rendu reste circulaire.
    const polygonSides = firstCircularStitches >= 3 && firstCircularStitches < 10
        ? firstCircularStitches
        : null;

    // --------------------------------------------------
    // Calcul du radius dynamique basé sur les rangs
    // précédents
    // --------------------------------------------------
    let dynamicOffset = 0;
    let circularRowsBefore = 0;

    for (let i = 0; i < rowIndex; i++) {
        const previousRow = pattern.value.rows[i];

        if (!previousRow.isCircular) {
            continue;
        }

        circularRowsBefore++;

        const stitchesPrev = getIndividualStitches(previousRow);

        // Compter les TRANSITION au début du rang précédent
        let transitionCountPrev = 0;

        for (const stitch of stitchesPrev) {
            if (stitch.action === StitchAction.TRANSITION) {
                transitionCountPrev++;
            } else {
                break;
            }
        }

        // Les transitions créent l'espace entre les rangs.
        if (transitionCountPrev > 0) {
            dynamicOffset += (transitionCountPrev - 1) * stitchSpacing;
        } else {
            dynamicOffset += 18;
        }
    }

    const radius = baseRadius + dynamicOffset;

    // --------------------------------------------------
    // Compter les TRANSITION du début du rang courant
    // --------------------------------------------------
    let firstTransitionGroupCount = 0;

    for (const stitch of stitches) {
        if (stitch.action === StitchAction.TRANSITION) {
            firstTransitionGroupCount++;
        } else {
            break;
        }
    }

    // --------------------------------------------------
    // Hauteur occupée par le groupe de transition
    // --------------------------------------------------
    const transitionBlockHeight =
        firstTransitionGroupCount > 0
            ? (firstTransitionGroupCount - 1) * 12
            : 0;

    // --------------------------------------------------
    // Placement des mailles TRANSITION entre deux rangs
    // --------------------------------------------------
    if (
        circularRowsBefore > 0 &&
        stitchIndex < firstTransitionGroupCount &&
        stitches[stitchIndex].action === StitchAction.TRANSITION
    ) {
        const prevRadius =
            radius +
            (
                firstTransitionGroupCount > 0
                    ? transitionBlockHeight
                    : 18
            );

        const gapMiddle =
            centerY -
            ((radius + prevRadius) / 2);

        const spacing = 12;

        const totalHeight =
            spacing * (firstTransitionGroupCount - 1);

        const x = centerX;

        const y =
            gapMiddle -
            totalHeight / 2 +
            (stitchIndex * spacing);

        const rotation = 90;

        return `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform:
                translate(-50%, -50%)
                rotate(${rotation}deg);
        `;
    }

    // --------------------------------------------------
    // Placement circulaire classique
    // --------------------------------------------------

    // Les TRANSITION ne doivent pas être comptées dans
    // les mailles qui tournent autour du cercle.
    const remainingCount =
        totalStitches - firstTransitionGroupCount;

    const startAngle = 270;

    let angle: number;

    if (remainingCount <= 0) {
        angle =
            startAngle +
            (stitchIndex / totalStitches) * 360;
    } else {
        const remainingIndex =
            stitchIndex - firstTransitionGroupCount;

        angle =
            startAngle +
            (remainingIndex / remainingCount) * 360;
    }

    const radian =
        (angle * Math.PI) / 180;

    let displayRadius = radius;

    if (polygonSides) {
        const sectorAngle = 360 / polygonSides;
        const angleFromStart = ((angle - startAngle) % 360 + 360) % 360;
        const angleInSector = angleFromStart % sectorAngle;
        const distanceFromVertex = Math.min(
            angleInSector,
            sectorAngle - angleInSector
        );
        const apothem = radius * Math.cos(Math.PI / polygonSides);

        // La distance au centre varie entre les sommets et les cotes.
        displayRadius = apothem / Math.cos(
            (distanceFromVertex * Math.PI) / 180
        );
    }

    const x = centerX + displayRadius * Math.cos(radian);
    const y = centerY + displayRadius * Math.sin(radian);

    return `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        transform:
            translate(-50%, -50%)
            rotate(${angle + 90}deg);
    `;
};

const generatePattern = () => {
    console.log('Patron généré :', pattern.value);
};

onMounted(() => {
    maxTranslate.value = window.innerHeight * 0.50
    translateY.value = maxTranslate.value

    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

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

const onTouchStart = (event: TouchEvent) => {
    startY = event.touches[0].clientY
    initialTranslateY = translateY.value
    isDragging.value = true
}

const onTouchMove = (event: TouchEvent) => {
    if (!isDragging.value) return

    const currentY = event.touches[0].clientY
    const deltaY = currentY - startY

    const newTranslate = initialTranslateY + deltaY

    translateY.value = Math.max(minTranslate, Math.min(maxTranslate.value, newTranslate))
}

const onTouchEnd = () => {
    isDragging.value = false

    const midpoint = maxTranslate.value / 2

    if (translateY.value > midpoint) {
        translateY.value = maxTranslate.value
    } else {
        translateY.value = minTranslate
    }
}

watch(
    [selectedStitchAction, selectedRow],
    ([action, rowIndex]) => {

        if (
            action === StitchAction.TRANSITION &&
            rowIndex > 0
        ) {
            selectedStitchType.value = StitchType.CH;
        }
    }
);

useHead(() => ({
  title: 'Crochyll - ' + t('category.maker'),
  meta: [
    {
      property: 'og:title',
      content: 'Crochyll - ' + t('category.maker')
    },
    {
      name: 'twitter:title',
      content: 'Crochyll - ' + t('category.maker')
    }
  ]
}))
</script>

<template>
    <div class="maker-page disable-text-select">
        <BasicMenu />

        <div class="maker-content">
            <div v-if="viewMode === null" class="view-toggle">
                <div>Veuillez choisir une vue pour commencer à créer votre patron :</div>
                <v-btn class="buttonOutsideInverted ma-2" @click="viewMode = '2d'"
                    :class="{ active: viewMode === '2d' }">Patron 2D</v-btn>
                <v-btn class="buttonOutsideInverted ma-2" @click="viewMode = '3d'"
                    :class="{ active: viewMode === '3d' }">Patron 3D</v-btn>
            </div>

            <div v-if="viewMode" style="width: 100%;">
                <!-- ZONE DESKTOP -->
                <div v-if="!isMobile">
                    <aside class="tools-menu">
                        <h3>{{ t('maker.menu.title') }}</h3>

                        <!-- Raccourcis -->
                        <div class="shortcuts">
                            <small>
                                {{ t('maker.menu.shortcut.title') }}: <br />
                                {{ t('maker.menu.shortcut.addRow') }}, {{ t('maker.menu.shortcut.delete') }},<br />
                                {{ t('maker.menu.shortcut.addStitch') }}, {{ t('maker.menu.shortcut.export') }}
                            </small>
                        </div>

                        <!-- Boîte d'information pliable -->
                        <div class="info-box mb-4">
                            <small class="d-flex align-center justify-space-between">
                                <strong>💡 {{ t('maker.menu.info.title') }}:</strong>
                                <a href="#" @click.prevent="openInfo = !openInfo">
                                    <v-icon :icon="openInfo ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'" />
                                </a>
                            </small>

                            <ul v-if="openInfo" class="mt-2 pa-0 list-none">
                                <li><small>• <strong>Cercle (🔄):</strong> Joint la première et dernière maille pour
                                        fermer
                                        le rang.</small></li>
                                <li><small>• <strong>Déplacement:</strong> Glissez-déposez pour reclasser les
                                        mailles.</small></li>
                                <li><small>• <strong>Quantité:</strong> Modifiez via les flèches ◀▶ de chaque
                                        maille.</small></li>
                                <li><small>• <strong>Sélection:</strong> Cliquez sur un rang pour y ajouter des
                                        mailles.</small></li>
                            </ul>
                        </div>

                        <!-- Panneau : Gestion des Rangs -->
                        <v-expansion-panels class="mb-4">
                            <v-expansion-panel class="panel">
                                <v-expansion-panel-title class="title">
                                    {{ t('maker.menu.tool.row.title') }}
                                </v-expansion-panel-title>

                                <v-expansion-panel-text class="small-text">
                                    <div v-if="pattern.rows.length > 0" class="row-selection">
                                        <button v-for="(row, index) in pattern.rows" :key="index"
                                            :class="{ active: selectedRow === index }" @click="selectedRow = index">
                                            Rang {{ index + 1 }} {{ row.isCircular ? '🔄' : '' }}
                                        </button>
                                    </div>
                                    <div v-else class="empty-row-text mb-2">Créez un rang d'abord</div>

                                    <div class="d-flex align-center">
                                        <v-select v-model="pattern.yarnSize" :items="yarnSizes" label="Taille du fil"
                                            density="compact" variant="solo" hide-details class="ma-2" />
                                        <v-btn class="buttonColor ma-2" @click="addRow">
                                            Ajouter un rang
                                        </v-btn>
                                    </div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>

                        <!-- Panneau : Gestion des Mailles -->
                        <v-expansion-panels class="mb-4">
                            <v-expansion-panel class="panel">
                                <v-expansion-panel-title class="title">
                                    {{ t('maker.menu.tool.stitch.title') }}
                                </v-expansion-panel-title>

                                <v-expansion-panel-text class="small-text">
                                    <div class="d-flex">
                                        <v-select v-model="selectedStitchType" :items="stitchTypes" item-title="label"
                                            item-value="value" label="Type de maille" density="compact" variant="solo"
                                            hide-details class="ma-2" />
                                        <v-select v-model="selectedStitchOritentation" :items="stitchOrientations"
                                            item-title="label" item-value="value" label="Orientation" density="compact"
                                            variant="solo" hide-details class="ma-2" />
                                    </div>

                                    <div class="d-flex align-center">
                                        <v-select v-model="selectedStitchAction" :items="stitchActions"
                                            item-title="label" item-value="value" label="Action" density="compact"
                                            variant="solo" hide-details class="ma-2" />
                                        <div v-if="selectedStitchAction !== StitchAction.NULL"
                                            class="d-flex align-center ma-2" style="width: 50%;">
                                            <v-icon icon="mdi-close" size="15" class="mr-2" />
                                            <v-text-field v-model.number="stitchInStitchCount" type="number" :min="2"
                                                label="Nb dans 1 maille" density="compact" variant="solo"
                                                hide-details />
                                        </div>
                                    </div>

                                    <v-text-field v-model.number="stitchCount" type="number" :min="1" label="Nb de fois"
                                        density="compact" variant="solo" hide-details class="ma-2" />

                                    <v-btn :disabled="selectedRow >= pattern.rows.length || pattern.rows.length === 0"
                                        class="buttonColor w-100 mt-2" @click="addStitch">
                                        Ajouter maille
                                    </v-btn>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>

                        <!-- Actions & Stats -->
                        <div class="project-size my-2">
                            <p>Taille du projet : {{ calculateProjectSize }}</p>
                        </div>
                        <v-btn class="buttonColor ma-1" @click="generatePattern">Générer PDF</v-btn>
                        <v-btn class="buttonOutsideInverted ma-1" @click="exportPattern">Exporter TXT</v-btn>
                    </aside>

                    <main style=" margin-left: 300px; padding: 20px;">
                        <div v-if="pattern.rows.length === 0 && viewMode !== null" class="empty-pattern">
                            Aucun rang ajouté. Utilisez les outils pour commencer.
                        </div>
                        <div v-else>
                            <!-- Prévisualisation visuelle -->
                            <div v-if="viewMode === '2d'" class="preview-section">
                                <h3>Prévisualisation</h3>
                                <div class="stitch-grid">
                                    <div v-for="(row, rowIndex) in pattern.rows.slice().reverse()"
                                        :key="`grid-row-${pattern.rows.length - 1 - rowIndex}`"
                                        :class="{ 'grid-row-circular': row.isCircular, 'grid-row': !row.isCircular }">
                                        <div v-for="(stitchInfo, index) in getIndividualStitches(row)" :key="index"
                                            class="stitch-circle"
                                            :style="getStitchStyle(row, index, pattern.rows.length - 1 - rowIndex)"
                                            :data-symbol="getStitchSymbol(stitchInfo.type, stitchInfo.orientation, stitchInfo.action, stitchInfo.nbTime)"
                                            :title="`${t(`stitchType.${stitchInfo.type}`).split('(')[0] || stitchInfo.type}${(stitchInfo.orientation !== StitchOrientation.AL ? '[' + stitchInfo.orientation + '] ' : '')}${(stitchInfo.action !== StitchAction.NULL ? `[${stitchInfo.action} x${stitchInfo.nbTime}] ` : '')}(${stitchInfo.localIndex + 1}/${stitchInfo.count})`"
                                            v-html="getStitchSymbol(stitchInfo.type, stitchInfo.orientation, stitchInfo.action, stitchInfo.nbTime)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="viewMode === '3d'" class="preview-section">
                                <h3>Prévisualisation</h3>
                                <Pattern3D :pattern="pattern" />
                            </div>

                            <!-- Liste des rangs -->
                            <div class="rows-container">
                                <div v-for="(row, rowIndex) in pattern.rows" :key="rowIndex" class="row">
                                    <div class="row-header">
                                        <h4>Rang {{ rowIndex + 1 }} {{ row.isCircular ? '🔄' : '' }}</h4>
                                        <div class="row-actions">
                                            <v-btn class="buttonOutsideInverted small"
                                                @click="insertRowBefore(rowIndex)">Insérer avant</v-btn>
                                            <v-btn class="buttonOutsideInverted small"
                                                @click="insertRowAfter(rowIndex)">Insérer
                                                après</v-btn>
                                            <v-btn class="buttonOutsideInverted small"
                                                @click="duplicateRow(rowIndex)">Dupliquer</v-btn>
                                            <v-btn class="buttonOutsideInverted small"
                                                :class="{ active: row.isCircular }" @click="toggleCircular(rowIndex)">🔄
                                                Cercle</v-btn>
                                            <v-btn class="buttonColor" @click="removeRow(rowIndex)">Supprimer</v-btn>
                                        </div>
                                    </div>
                                    <div class="stitches">
                                        <span v-for="(stitch, stitchIndex) in row.stitches" :key="stitchIndex"
                                            class="stitch" draggable="true"
                                            @dragstart="onDragStart($event, rowIndex, stitchIndex)"
                                            @dragover="onDragOverEntry($event)" @dragleave="onDragLeave($event)"
                                            @drop="onDrop($event, rowIndex, stitchIndex)">
                                            <v-btn class="stitch-move" :disabled="stitch.count <= 1"
                                                @click="decreaseStitchCount(rowIndex, stitchIndex)">◀</v-btn>
                                            <strong>{{ t(`stitchType.${stitch.type}`).split("(")[0] || stitch.type }}
                                                x{{
                                                    stitch.count }}</strong>
                                            <small v-if="stitch.orientation !== StitchOrientation.AL"
                                                style="opacity:0.7">[{{
                                                    stitch.orientation }}]</small>
                                            <small v-if="stitch.action !== StitchAction.NULL"
                                                style="opacity:0.7; color:#f39c12">{{ stitch.action }}({{ stitch.nbTime
                                                }})</small>
                                            <v-btn class="stitch-move"
                                                @click="increaseStitchCount(rowIndex, stitchIndex)">▶</v-btn>
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

                <!-- ZONE MOBILE -->
                <v-layout v-else style="height: 94vh; width: 100vw; overflow: hidden; position: relative;">
                    <v-main class="d-flex align-center justify-center">
                        <div class="text-center" style="width: 100%;">
                            <div v-if="pattern.rows.length === 0 && viewMode !== null" class="empty-pattern">
                                Aucun rang ajouté. Utilisez les outils pour commencer.
                            </div>
                            <div v-else>
                                <!-- Prévisualisation visuelle -->
                                <div v-if="viewMode === '2d'" class="preview-section preview-section-mobile">
                                    <h3>Prévisualisation</h3>
                                    <div class="stitch-grid">
                                        <div v-for="(row, rowIndex) in pattern.rows.slice().reverse()"
                                            :key="`grid-row-${pattern.rows.length - 1 - rowIndex}`"
                                            :class="{ 'grid-row-circular': row.isCircular, 'grid-row': !row.isCircular }">
                                            <div v-for="(stitchInfo, index) in getIndividualStitches(row)" :key="index"
                                                class="stitch-circle"
                                                :style="getStitchStyle(row, index, pattern.rows.length - 1 - rowIndex)"
                                                :data-symbol="getStitchSymbol(stitchInfo.type, stitchInfo.orientation, stitchInfo.action, stitchInfo.nbTime)"
                                                :title="`${t(`stitchType.${stitchInfo.type}`).split('(')[0] || stitchInfo.type}${(stitchInfo.orientation !== StitchOrientation.AL ? '[' + stitchInfo.orientation + '] ' : '')}${(stitchInfo.action !== StitchAction.NULL ? `[${stitchInfo.action} x${stitchInfo.nbTime}] ` : '')}(${stitchInfo.localIndex + 1}/${stitchInfo.count})`"
                                                v-html="getStitchSymbol(stitchInfo.type, stitchInfo.orientation, stitchInfo.action, stitchInfo.nbTime)">
                                            </div>
                                        </div>
                                    </div>

                                    <p>{{ calculateProjectSize }}</p>
                                </div>
                                <div v-else-if="viewMode === '3d'" class="preview-section preview-section-mobile">
                                    <h3>Prévisualisation</h3>
                                    <Pattern3D :pattern="pattern" />
                                </div>

                                <!-- Liste des rangs -->
                                <div class="rows-container rows-container-mobile">
                                    <div v-for="(row, rowIndex) in pattern.rows" :key="rowIndex" class="row"
                                        @click="selectedRow = rowIndex">
                                        <div class="row-header">
                                            <h4 :class="{ active: rowIndex == selectedRow }">Rang {{ rowIndex + 1 }} {{
                                                row.isCircular ? '🔄' : '' }}</h4>
                                        </div>
                                        <div class="stitches">
                                            <span v-for="(stitch, stitchIndex) in row.stitches" :key="stitchIndex"
                                                class="stitch" draggable="true"
                                                @dragstart="onDragStart($event, rowIndex, stitchIndex)"
                                                @dragover="onDragOverEntry($event)" @dragleave="onDragLeave($event)"
                                                @drop="onDrop($event, rowIndex, stitchIndex)">
                                                <v-btn class="stitch-move" :disabled="stitch.count <= 1"
                                                    @click="decreaseStitchCount(rowIndex, stitchIndex)">◀</v-btn>
                                                <strong>{{ t(`stitchType.${stitch.type}`).split("(")[0] || stitch.type
                                                }}
                                                    x{{
                                                        stitch.count }}</strong>
                                                <small v-if="stitch.orientation !== StitchOrientation.AL"
                                                    style="opacity:0.7">[{{
                                                        stitch.orientation }}]</small>
                                                <small v-if="stitch.action !== StitchAction.NULL"
                                                    style="opacity:0.7; color:#f39c12">{{ stitch.action }}({{
                                                        stitch.nbTime
                                                    }})</small>
                                                <v-btn class="stitch-move"
                                                    @click="increaseStitchCount(rowIndex, stitchIndex)">▶</v-btn>
                                                <a style="cursor: pointer;"
                                                    @click="removeStitch(rowIndex, stitchIndex)">
                                                    <v-icon icon="mdi-close" size="20"></v-icon>
                                                </a>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-main>

                    <div class="sub-menu-mobile">
                        <a class="ma-auto" @click="insertRowBefore(selectedRow)">
                            <v-icon icon="mdi-arrow-u-left-top" size="30"></v-icon>
                            <p>Avant</p>
                        </a>
                        <a class="ma-auto" @click="insertRowAfter(selectedRow)">
                            <v-icon icon="mdi-arrow-u-right-top" size="30"></v-icon>
                            <p>Après</p>
                        </a>
                        <a class="ma-auto" @click="toggleCircular(selectedRow)">
                            <v-icon icon="mdi-checkbox-blank-circle-outline" size="30"></v-icon>
                            <p>Cercle</p>
                        </a>
                        <a class="ma-auto" @click="duplicateRow(selectedRow)">
                            <v-icon icon="mdi-content-duplicate" size="30"></v-icon>
                            <p>Dupl.</p>
                        </a>
                        <a class="ma-auto" @click="removeRow(selectedRow)">
                            <v-icon icon="mdi-trash-can-outline" size="30"></v-icon>
                            <p>Supp.</p>
                        </a>
                    </div>

                    <div class="custom-slider-panel" :style="{
                        transform: `translateY(${translateY}px)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }">
                        <v-card class="rounded-t-xl h-100 pa-4" elevation="16" flat
                            style="background-color: var(--light-color); box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5) !important;">
                            <div class="drag-zone py-2" @touchstart="onTouchStart" @touchmove="onTouchMove"
                                @touchend="onTouchEnd">
                                <div class="drag-handle mx-auto rounded bg-grey" style="width: 50px; height: 6px;" />

                                <div class="d-flex" style="justify-content: center; margin-top: 50px;">
                                    <a class="mx-8" @click="mobileMode = 'row'"
                                        :class="{ active: mobileMode == 'row' }">Rangs</a>
                                    <a class="mx-8" @click="mobileMode = 'stitch'"
                                        :class="{ active: mobileMode == 'stitch' }">Mailles</a>
                                </div>
                                <hr />

                                <div v-if="mobileMode == 'stitch'">
                                    <v-select v-model="selectedStitchType" :items="stitchTypes" item-title="label"
                                        item-value="value" label="Type de maille" density="compact" variant="solo"
                                        hide-details class="ma-2"
                                        :disabled="selectedStitchAction === StitchAction.TRANSITION" />

                                    <v-select v-model="selectedStitchOritentation" :items="stitchOrientations"
                                        item-title="label" item-value="value" label="Orientation" density="compact"
                                        variant="solo" hide-details class="ma-2" />

                                    <div class="d-flex align-center">
                                        <v-select v-model="selectedStitchAction" :items="stitchActions"
                                            item-title="label" item-value="value" label="Action" density="compact"
                                            variant="solo" hide-details class="ma-2" />
                                        <div v-if="selectedStitchAction !== StitchAction.NULL && selectedStitchAction !== StitchAction.TRANSITION"
                                            class="d-flex align-center ma-2" style="width: 50%;">
                                            <v-icon icon="mdi-close" size="15" class="mr-2" />
                                            <v-text-field v-model.number="stitchInStitchCount" type="number" :min="2"
                                                label="Nb dans 1 maille" density="compact" variant="solo"
                                                hide-details />
                                        </div>
                                    </div>

                                    <v-text-field v-model.number="stitchCount" type="number" :min="1" label="Nb de fois"
                                        density="compact" variant="solo" hide-details class="ma-2" />

                                    <v-btn :disabled="selectedRow >= pattern.rows.length || pattern.rows.length === 0"
                                        class="buttonColor w-100 mt-2" @click="addStitch">
                                        Ajouter maille
                                    </v-btn>
                                </div>

                                <div v-if="mobileMode == 'row'">
                                    <div v-if="pattern.rows.length > 0" class="row-selection">
                                        <button v-for="(row, index) in pattern.rows" :key="index" style="margin: 5px;"
                                            :class="{ active: selectedRow === index }" @click="selectedRow = index">
                                            Rang {{ index + 1 }} {{ row.isCircular ? '🔄' : '' }}
                                        </button>
                                    </div>
                                    <div v-else class="empty-row-text mb-2">Créez un rang d'abord</div>

                                    <v-select v-model="pattern.yarnSize" :items="yarnSizes" label="Taille du fil"
                                        density="compact" variant="solo" hide-details class="ma-2" />

                                    <v-btn class="buttonColor w-100" @click="addRow">
                                        Ajouter un rang
                                    </v-btn>
                                </div>
                            </div>
                        </v-card>
                    </div>
                </v-layout>
            </div>
        </div>
    </div>
</template>

<style scoped>
.maker-page {
    display: flex;
    flex-direction: column;
}

.maker-content {
    display: flex;
    flex: 1;
}

.tools-menu {
    width: 300px !important;
    padding: 20px;
    background-color: var(--dark-color);
    border-right: 1px solid #ccc;
    left: 0;
    position: absolute;
    top: 45px;
    height: auto;
    min-height: 93.5vh;
    overflow-x: visible !important;
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
    padding: 8px 12px;
}

.stitch-tools {
    margin: 20px 0;
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
    color: var(--action-color);
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
    position: absolute;
    padding: 20px;
    overflow-y: auto;
    bottom: 0;
    right: 0;
    left: 30px;
    top: 50px;
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

.preview-section-mobile {
    position: relative;
    /* Au lieu d'absolute pour rester dans le flux */
    top: 0;
    /* On annule le top fixe */
    left: 0;
    right: 0;
    margin: 10px;
    width: calc(100% - 20px);
    /* On force le conteneur à rester carré proprement sur tous les navigateurs */
    aspect-ratio: 1 / 1;
    box-sizing: border-box;
}

.preview-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
}

.stitch-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-height: 300px;
}

.grid-row {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
}

.grid-row-circular {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    pointer-events: none;
}

.stitch-circle {
    min-width: 28px;
    height: 28px;
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

.rows-container-mobile {
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 200px;
    max-height: 180px;
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

.row-selection .active {
    color: var(--action-color);
}

:deep(.v-expansion-panels) {
    width: 100% !important;
    position: relative;
    transition: width 0.3s ease-in-out;
}

:deep(.v-expansion-panels:has(.v-expansion-panel--active)) {
    width: 460px !important;
    z-index: 999;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5) !important;
}

.small-text {
    font-size: small;
}

.panel .title {
    background-color: var(--light-color) !important;
}

.panel {
    background-color: var(--dark-color) !important;
    border-radius: 8px;
    border: 1px solid white;
}






.v-layout {
    display: flex;
    flex-direction: column;
    height: 94vh;
    width: 100vw;
    overflow-y: auto;
    /* Permet le défilement global si l'écran est très petit */
    overflow-x: hidden;
}

.active {
    color: var(--action-color);
}

.sub-menu-mobile {
    position: absolute;
    bottom: 0;
    padding: 10px;
    padding-bottom: 120px;
    display: flex;
    width: 100%;
    background-color: var(--dark-color)
}

.view-toggle {
    margin: auto;
    margin-top: 45px;
}

.list-none {
    list-style-type: none;
}

.custom-slider-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60vh;
    z-index: 999;
    will-change: transform;
}

.drag-zone {
    width: 100%;
    cursor: grab;
    touch-action: none;
}

.drag-zone:active {
    cursor: grabbing;
}
</style>