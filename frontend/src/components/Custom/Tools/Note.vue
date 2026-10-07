<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, watch } from 'vue'

const { t } = useI18n()

const props = defineProps<{
    id: number,
    isActive: boolean,
    modelValue?: string 
}>()

const emit = defineEmits(['update:modelValue'])

let isWaiting = false
let savedRange: Range | null = null

const editorRef = ref<HTMLDivElement | null>(null)
const activeFontSize = ref<string>('')
const activeFormats = ref({
    bold: false,
    italic: false,
    left: true,
    center: false,
    right: false
})

const textValue = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value)
})

const initEditorContent = () => {
    if (!editorRef.value) return
    
    document.execCommand('styleWithCSS', false, 'false')
    
    if (!textValue.value || textValue.value === '<br>' || textValue.value === '') {
        editorRef.value.innerHTML = '<p style="text-align: left;"><br></p>'
    } else {
        editorRef.value.innerHTML = textValue.value
    }
    checkActiveStyles()
}

onMounted(() => {
    initEditorContent()
})

watch(() => props.modelValue, (newValue) => {
    if (editorRef.value && editorRef.value.innerHTML !== newValue) {
        if (!newValue || newValue === '') {
            editorRef.value.innerHTML = '<p style="text-align: left;"><br></p>'
        } else {
            editorRef.value.innerHTML = newValue
        }
        checkActiveStyles()
    }
})

const onInput = () => {
    if (editorRef.value) {
        textValue.value = editorRef.value.innerHTML
    }
}

const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange()
    }
}

const checkActiveStyles = () => {
    activeFormats.value.bold = document.queryCommandState('bold')
    activeFormats.value.italic = document.queryCommandState('italic')
    
    const isCenter = document.queryCommandState('justifyCenter') || document.queryCommandValue('justifyCenter') === 'true'
    const isRight = document.queryCommandState('justifyRight') || document.queryCommandValue('justifyRight') === 'true'
    const isLeft = document.queryCommandState('justifyLeft') || document.queryCommandValue('justifyLeft') === 'true' || (!isCenter && !isRight)

    activeFormats.value.left = !!isLeft
    activeFormats.value.center = !!isCenter
    activeFormats.value.right = !!isRight

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef.value) {
        let node: Node | null = selection.getRangeAt(0).startContainer
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentElement
        }
        
        let foundSize = ''
        let currentElement = node as HTMLElement | null
        while (currentElement && currentElement !== editorRef.value) {
            if (currentElement.style && currentElement.style.fontSize) {
                foundSize = currentElement.style.fontSize
                break
            }
            currentElement = currentElement.parentElement
        }
        activeFontSize.value = foundSize
    }
}

const format = (command: 'bold' | 'italic') => {
    if (!props.isActive || isWaiting) return
    if (editorRef.value) editorRef.value.focus()
    document.execCommand(command, false)
    onInput()
    checkActiveStyles()
}

const align = (alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight') => {
    if (!props.isActive || isWaiting) return
    if (editorRef.value) editorRef.value.focus()
    document.execCommand(alignment, false)
    onInput()
    setTimeout(() => {
        checkActiveStyles()
    }, 10)
}

const changeFontSize = (size: string) => {
    if (!props.isActive || isWaiting || !editorRef.value) return
    
    editorRef.value.focus()
    const selection = window.getSelection()
    
    if (!selection) return

    if (savedRange) {
        selection.removeAllRanges()
        selection.addRange(savedRange)
    }

    if (selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    
    let container: HTMLElement | null = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer as HTMLElement

    if (container && container !== editorRef.value && container.tagName === 'SPAN' && container.style.fontSize) {
        container.style.fontSize = size
    } else {
        const span = document.createElement('span')
        span.style.fontSize = size
        span.style.display = 'inline-block'

        if (range.collapsed) {
            span.innerHTML = '&#8203;'
            range.insertNode(span)
            
            const newRange = document.createRange()
            newRange.setStart(span, 1)
            newRange.setEnd(span, 1)
            selection.removeAllRanges()
            selection.addRange(newRange)
        } else {
            try {
                span.appendChild(range.extractContents())
                range.insertNode(span)
            } catch (e) {
                document.execCommand('fontSize', false, '4')
            }
        }
    }
    
    savedRange = null
    activeFontSize.value = size
    onInput()
}
</script>

<template>
    <div 
        class="note-panel d-flex flex-column" 
        @keyup="checkActiveStyles" 
        @mouseup="checkActiveStyles"
    >
        <div class="px-2 text-center mb-2">
            <h3 class="text-title-medium text-truncate w-100 ma-0 disable-text-select">
                {{ t('tools.tool.note') }}
            </h3>
        </div>

        <div class="editor-toolbar d-flex align-center px-2 py-1 border-b" @mousedown.stop>
            <v-btn 
                icon="mdi-format-bold" 
                variant="text" 
                density="comfortable" 
                :color="activeFormats.bold ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="format('bold')"
            />
            <v-btn 
                icon="mdi-format-italic" 
                variant="text" 
                density="comfortable" 
                :color="activeFormats.italic ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="format('italic')"
            />
            
            <v-divider vertical class="mx-1" />

            <v-btn 
                icon="mdi-format-align-left" 
                variant="text" 
                density="comfortable" 
                :color="activeFormats.left ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="align('justifyLeft')"
            />
            <v-btn 
                icon="mdi-format-align-center" 
                variant="text" 
                density="comfortable" 
                :color="activeFormats.center ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="align('justifyCenter')"
            />
            <v-btn 
                icon="mdi-format-align-right" 
                variant="text" 
                density="comfortable" 
                :color="activeFormats.right ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="align('justifyRight')"
            />

            <v-divider vertical class="mx-1" />

            <v-menu @update:model-value="(val) => { if (val) saveSelection() }">
                <template v-slot:activator="{ props: menuProps }">
                    <v-btn 
                        variant="text" 
                        density="comfortable" 
                        prepend-icon="mdi-format-size" 
                        v-bind="menuProps"
                        :disabled="!props.isActive || isWaiting"
                    >
                        {{ t('tools.note.size.title') }}
                    </v-btn>
                </template>
                <v-list density="compact">
                    <v-list-item 
                        :title="t('tools.note.size.small')"
                        :color="activeFontSize === '12px' ? 'red' : undefined"
                        @click="changeFontSize('12px')"
                    ></v-list-item>
                    <v-list-item 
                        :title="t('tools.note.size.medium')"
                        :color="activeFontSize === '22px' ? 'red' : undefined"
                        @click="changeFontSize('22px')"
                    ></v-list-item>
                    <v-list-item 
                        :title="t('tools.note.size.large')"
                        :color="activeFontSize === '36px' ? 'red' : undefined"
                        @click="changeFontSize('36px')"
                    ></v-list-item>
                </v-list>
            </v-menu>
        </div>

        <div 
            ref="editorRef"
            :contenteditable="props.isActive && !isWaiting"
            draggable="false"
            class="note-textarea custom-editor px-3 py-2"
            :class="{ 'editor-disabled': !props.isActive || isWaiting }"
            @input="onInput"
            @focus="checkActiveStyles"
            @click="checkActiveStyles"
            @mousedown.stop
            @pointerdown.stop
        ></div>
    </div>
</template>

<style scoped>
.note-panel {
    height: 100%;
    min-height: 0;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden;
}

.editor-toolbar {
    gap: 4px;
}

.note-textarea {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}

.custom-editor {
    color: rgba(0, 0, 0, 0.87);
    overflow-y: auto;
    outline: none;
    font-family: inherit;
    font-size: 16px;
    line-height: 1.5;
    font-synthesis: weight style !important; 
}

.custom-editor :deep(p) {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 1.5em;
}

.custom-editor :deep(i), 
.custom-editor :deep(em) {
    font-style: italic !important;
}

.custom-editor :deep(b), 
.custom-editor :deep(strong) {
    font-weight: bold !important;
}

.custom-editor :deep(span) {
    font-size: inherit;
}

.editor-disabled {
    color: rgba(0, 0, 0, 0.38) !important;
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
