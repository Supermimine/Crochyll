<script setup lang="ts">
import { sleep, language } from "@/tools/appTools";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

const isSpeachMode = ref<boolean>(false)
const counter = ref(0);
let isWaiting = false

const micStream = ref<MediaStream | null>(null)
const permissionState = ref<string>('Inconnu')

const recognition = ref<any>(null)
const isProcessingEvent = ref<boolean>(false)
const addwordToDetect = t('tools.counter.add')
const reducewordToDetect = t('tools.counter.reduce')

const changeCounter = (value: number) => {
    if (counter.value + value < 0) return;
    counter.value += value;
};

const resetCounter = () => {
    counter.value = 0;
}

const startMicrophoneStream = async (): Promise<void> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

        micStream.value = stream
        permissionState.value = 'granted'
        startSpeechDetection()
    } catch (err) {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
            permissionState.value = 'denied'
            isSpeachMode.value = false
            showManualInstructions()
        }
    }
}

const stopMicrophoneStream = (): void => {
    if (micStream.value) {
        micStream.value.getTracks().forEach(track => track.stop())
        micStream.value = null
    }
    stopSpeechDetection()
}

const showManualInstructions = (): void => {
    alert(
        "L'accès au microphone est bloqué dans votre navigateur.\n\n" +
        "Pour l'activer :\n" +
        "1. Cliquez sur le cadenas ou l'icône de réglages à gauche de l'URL.\n" +
        "2. Autorisez le 'Microphone'.\n" +
        "3. Actualisez la page."
    );
}

const toggleSpeachMode = async () => {
    isSpeachMode.value = !isSpeachMode.value

    if (isSpeachMode.value) {

        if (micStream.value) {
            console.log("Le microphone est déjà actif.")
            startSpeechDetection()
            return
        }

        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
            permissionState.value = permissionStatus.state

            if (permissionStatus.state === 'denied') {
                isSpeachMode.value = false
                showManualInstructions()
                return
            }

            await startMicrophoneStream()

        } catch (error) {
            await startMicrophoneStream()
        }
    } else {
        stopMicrophoneStream()
    }
}

const startSpeechDetection = (): void => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
        console.error("La reconnaissance vocale n'est pas supportée.")
        return
    }

    const rec = new SpeechRecognitionAPI()
    rec.lang = language() == 'fr' ? 'fr-FR' : 'en-US'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = function (event: any) {
        if (isProcessingEvent.value) return

        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i]
            interimTranscript += result[0].transcript
        }

        const cleanText = interimTranscript.toLowerCase().trim()

        if (cleanText.includes(addwordToDetect)) {
            const regex = new RegExp(`\\b${addwordToDetect}\\b\\s+(\\w+)`, 'i');

            const match = cleanText.match(regex);

            if (match) {
                const remainingText = match[1].trim();
                let numericValue: number | null = null;

                const firstNumberMatch = remainingText.match(/^\d+/);
                if (firstNumberMatch) {
                    numericValue = Number(firstNumberMatch[0]);
                } else {
                    numericValue = textToNumbersBilingual(match[1])
                }

                if (numericValue != null) {
                    isProcessingEvent.value = true

                    changeCounter(numericValue);
                    rec.stop()
                }
            }
        }

        if (cleanText.includes(reducewordToDetect)) {
            const regex = new RegExp(`\\b${reducewordToDetect}\\b\\s+(\\w+)`, 'i');

            const match = cleanText.match(regex);

            if (match) {
                const remainingText = match[1].trim();
                let numericValue: number | null = null;

                const firstNumberMatch = remainingText.match(/^\d+/);
                if (firstNumberMatch) {
                    numericValue = Number(firstNumberMatch[0]);
                } else {
                    numericValue = textToNumbersBilingual(match[1])
                }

                if (numericValue != null) {
                    isProcessingEvent.value = true

                    changeCounter(-numericValue);
                    rec.stop()
                }
            }
        }
    }

    rec.onerror = (event: any) => {
        if (event.error === 'no-speech') {
            return
        }
    }

    rec.onend = () => {
        isProcessingEvent.value = false

        if (isSpeachMode.value && recognition.value) {
            recognition.value.start()
        }
    }

    recognition.value = rec
    recognition.value.start()
}

const stopSpeechDetection = (): void => {
    if (recognition.value) {
        recognition.value.stop()
        recognition.value = null
    }
}

const textToNumbersBilingual = (text: string): number | null => {
    const clean = text.toLowerCase().trim().replace(/-/g, ' ');

    const units: Record<string, number> = {
        'zéro': 0, 'zero': 0, 'un': 1, 'une': 1, 'one': 1, 'deux': 2, 'two': 2,
        'trois': 3, 'three': 3, 'quatre': 4, 'four': 4, 'cinq': 5, 'five': 5,
        'six': 6, 'sept': 7, 'seven': 7, 'huit': 8, 'eight': 8, 'neuf': 9, 'nine': 9,
        'dix': 10, 'ten': 10, 'onze': 11, 'eleven': 11, 'douze': 12, 'twelve': 12,
        'treize': 13, 'thirteen': 13, 'quatorze': 14, 'fourteen': 14, 'quinze': 15,
        'fifteen': 15, 'seize': 16, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19
    };

    const tens: Record<string, number> = {
        'vingt': 20, 'twenty': 20, 'trente': 30, 'thirty': 30, 'quarante': 40, 'forty': 40,
        'cinquante': 50, 'fifty': 50, 'soixante': 60, 'sixty': 60, 'seventy': 70, 'septante': 70,
        'octante': 80, 'eighty': 80, 'quatre vingt': 80, 'quatre vingts': 80, 'ninety': 90, 'nonante': 90
    };

    const multipliers: Record<string, number> = {
        'cent': 100, 'cents': 100, 'hundred': 100,
        'mille': 1000, 'thousand': 1000,
        'million': 1000000, 'millions': 1000000
    };

    const words = clean.split(/\s+/);
    let total = 0;
    let currentGroup = 0;
    let isNumberFound = false;

    for (const word of words) {
        if (word === 'et' || word === 'and') continue;

        if (units[word] !== undefined) {
            currentGroup += units[word];
            isNumberFound = true;
        } else if (tens[word] !== undefined) {
            currentGroup += tens[word];
            isNumberFound = true;
        } else if (multipliers[word] !== undefined) {
            const mult = multipliers[word];
            isNumberFound = true;

            if (mult === 100) {
                currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 100;
            } else {
                total += (currentGroup === 0 ? 1 : currentGroup) * mult;
                currentGroup = 0;
            }
        } else {
            break;
        }
    }

    return isNumberFound ? total + currentGroup : null;
};

const handleKeyDown = async (event: KeyboardEvent) => {
    if (event.code === 'Space' && props.isActive && !isWaiting) {
        event.preventDefault();

        isWaiting = true;

        changeCounter(1);
        await sleep(200);

        isWaiting = false;
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
    <div>
        <div class="px-2 text-center">
            <h3 class="text-title-medium text-truncate w-100 ma-0 disable-text-select">
                {{ t('reader.counter.title') }}
            </h3>

            <p class="text-title-large font-weight-black pa-2 line-height-none">
                {{ counter }}
            </p>

            <div class="d-flex justify-center w-100">
                <v-btn class="buttonColor mx-1" variant="tonal" size="small" icon @click="toggleSpeachMode">
                    <v-icon :icon="isSpeachMode ? 'mdi-microphone-off' : 'mdi-microphone'" size="20"></v-icon>
                </v-btn>

                <v-btn class="buttonColor mx-1" variant="tonal" size="small" icon :disabled="counter === 0"
                    @click="resetCounter">
                    <v-icon icon="mdi-refresh" size="20"></v-icon>
                </v-btn>
            </div>
        </div>

        <div class="d-flex w-100 mt-2" style="position: absolute; bottom: 0;">
            <v-btn tile height="44" class="buttonColorInverted" style="width: 50%; border-radius: 0 0 0 12px;"
                :disabled="counter === 0" @click="changeCounter(-1)">
                <v-icon icon="mdi-minus" size="20"></v-icon>
            </v-btn>

            <v-btn tile height="44" class="buttonColorInverted" style="width: 50%; border-radius: 0 0 12px 0;"
                @click="changeCounter(1)">
                <v-icon icon="mdi-plus" size="20"></v-icon>
            </v-btn>
        </div>
    </div>
</template>


<style scoped>

</style>
