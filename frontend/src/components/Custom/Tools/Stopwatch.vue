<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

interface Lap {
    id: number
    time: string
}

const startTime = ref<number>(0)
const elapsedTime = ref<number>(0)
const isRunning = ref<boolean>(false)
const laps = ref<Lap[]>([])

let timerInterval: ReturnType<typeof setInterval> | null = null

const formattedTime = computed<string>(() => {
    const ms = elapsedTime.value
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)

    const hrsStr = String(hours).padStart(2, '0')
    const minsStr = String(minutes).padStart(2, '0')
    const secsStr = String(seconds).padStart(2, '0')

    return `${hrsStr}:${minsStr}:${secsStr}`
})

const startStop = (): void => {
    if (!isRunning.value) {
        startTime.value = Date.now() - elapsedTime.value
        timerInterval = setInterval(() => {
            elapsedTime.value = Date.now() - startTime.value
        }, 1000)
        isRunning.value = true
    } else {
        if (timerInterval) clearInterval(timerInterval)
        elapsedTime.value = Date.now() - startTime.value
        isRunning.value = false
    }
}

const recordLap = (): void => {
    if (!isRunning.value) return
    laps.value.unshift({
        id: Date.now(),
        time: formattedTime.value,
    })
}

const resetTimer = (): void => {
    if (timerInterval) clearInterval(timerInterval)
    startTime.value = 0
    elapsedTime.value = 0
    isRunning.value = false
    laps.value = []
}

const removeStopwatch = (): void => {
    emit('remove', props.id)
}

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})

</script>

<template>
    <div class="box" style="position: relative;">
        <a style="right: 10px; top: 5px; position: absolute; cursor: pointer; z-index: 10;"
            @click.stop="removeStopwatch()">
            <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
        </a>

        <div class="pa-4 text-center width-100">
            <div class="text-subtitle-1 font-weight-bold mb-2">Chronomètre</div>

            <div class="text-h3 font-weight-bold my-4 font-monospace">
                {{ formattedTime }}
            </div>

            <v-row density="compact" justify="center" align="center" class="mb-2 mt-2">
                <v-col cols="auto" class="px-2">
                    <v-btn class="buttonColor" variant="tonal" size="medium" icon @click="startStop">
                        <v-icon :icon="isRunning ? 'mdi-pause' : 'mdi-play'" size="20"></v-icon>
                    </v-btn>
                </v-col>

                <v-col cols="auto" class="px-2">
                    <v-btn class="buttonColor" variant="tonal" size="medium" icon :disabled="!isRunning"
                        @click="recordLap">
                        <v-icon icon="mdi-flag" size="20"></v-icon>
                    </v-btn>
                </v-col>

                <v-col cols="auto" class="px-2">
                    <v-btn class="buttonColor" variant="tonal" size="medium" icon
                        :disabled="!isRunning && elapsedTime === 0" @click="resetTimer">
                        <v-icon icon="mdi-refresh" size="20"></v-icon>
                    </v-btn>
                </v-col>
            </v-row>


            <v-expand-transition>
                <v-card v-if="laps.length > 0" class="mt-3" variant="outlined" max-height="120">
                    <v-list class="overflow-y-auto pa-0" max-height="118" density="compact">
                        <v-list-item v-for="(lap, index) in laps" :key="lap.id" class="text-left font-monospace py-0">
                            <template #prepend>
                                <span class="text-caption text-medium-emphasis mr-2">
                                    T{{ laps.length - index }}
                                </span>
                            </template>
                            <v-list-item-title class="text-right text-body-2">
                                {{ lap.time }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-expand-transition>
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
