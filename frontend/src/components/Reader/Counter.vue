<script setup lang="ts">
import { sleep } from "@/tools/appTools";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
    id: number,
    isActive: boolean
}>()

let isWaiting = false;

const counter = ref(0);
const changeCounter = (value: number) => {
    if (counter.value + value < 0) return;
    counter.value += value;
};

const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

const removeCounter = () => {
    emit('remove', props.id)
}

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
    <div class="box" :class="{ active: isActive }">
        <a style="right: 10px; top: 5px; position: absolute; cursor: pointer" @click.stop="removeCounter()">
            <v-icon icon="mdi-close" size="20" class="ml-1"></v-icon>
        </a>

        <h4 style="margin: 15px 0;">{{ t('reader.counter.title') }}</h4>
        <hr />
        <p style="font-size: 1.8em; margin: 20px 0;">{{ counter }}</p>
        <hr />
        <div style="font-size: 1.5em; display: flex; justify-content: space-around; ">
            <div style="border-right: 1.5px solid rgba(255,255,255,0.3); width: 50%;">
                <v-btn style="width: 100%; border-radius: 0 0 0 5px; padding: 0;" class="buttonColorInverted"
                    @click="changeCounter(-1)" :disabled="counter == 0">
                    <v-icon icon="mdi-minus" size="20" class="ma-auto"></v-icon>
                </v-btn>
            </div>

            <div style="border-left: 1.5px solid rgba(255,255,255,0.3); width: 50%;">
                <v-btn style="width: 100%; border-radius: 0 0 5px 0; padding: 0;" class="buttonColorInverted"
                    @click="changeCounter(1)">
                    <v-icon icon="mdi-plus" size="20" class="ma-auto"></v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<style scoped>
.box {
    background-color: var(--dark-color);
    border-radius: 5px;
    border: 2px solid transparent;
    margin: 0 0 15px 10px;
    cursor: pointer;
    position: relative;
}

.box.active {
    border-color: var(--action-color);
}

@media (max-width: 1250px) {
    .box {
        margin: 20px 0 5px 5px;
    }
}
</style>
