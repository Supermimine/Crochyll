<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, watch } from 'vue'
import { sanitizeNoteHtml } from '@/tools/sanitizer'

const { t } = useI18n()

const props = defineProps<{
    id: number,
    isActive: boolean,
    modelValue?: string 
}>()

const emit = defineEmits(['update:modelValue'])

const enum Format {
    Bold = 'bold',
    Italic = 'italic'
}
const enum Align {
    Left = 'justifyLeft',
    Center = 'justifyCenter',
    Right = 'justifyRight'
}

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

const setEditorContent = (value?: string) => {
    if (!editorRef.value) return

    const sanitizedValue = sanitizeNoteHtml(value || '')
    editorRef.value.innerHTML = sanitizedValue || '<p style="text-align: left;"><br></p>'

    if (value && sanitizedValue !== value) {
        textValue.value = sanitizedValue
    }
}

const initEditorContent = () => {
    if (!editorRef.value) return
    
    document.execCommand('styleWithCSS', false, 'false')

    setEditorContent(textValue.value)
    checkActiveStyles()
}

onMounted(() => {
    initEditorContent()
})

watch(() => props.modelValue, (newValue) => {
    if (editorRef.value && editorRef.value.innerHTML !== newValue) {
        setEditorContent(newValue)
        checkActiveStyles()
    }
})

const onInput = () => {
    if (editorRef.value) {
        const sanitizedValue = sanitizeNoteHtml(editorRef.value.innerHTML)
        if (editorRef.value.innerHTML !== sanitizedValue) {
            editorRef.value.innerHTML = sanitizedValue
        }
        textValue.value = sanitizedValue
    }
}

const handlePaste = (event: ClipboardEvent) => {
    event.preventDefault()
    if (!props.isActive || isWaiting || !editorRef.value || !event.clipboardData) return

    const selection = window.getSelection()
    if (!selection) return

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange()
    if (!editorRef.value.contains(range.commonAncestorContainer)) {
        range.selectNodeContents(editorRef.value)
        range.collapse(false)
    }
    range.deleteContents()

    const sanitizedHtml = sanitizeNoteHtml(event.clipboardData.getData('text/html'))
    if (sanitizedHtml) {
        const template = document.createElement('template')
        template.innerHTML = sanitizedHtml
        const fragment = template.content
        const lastNode = fragment.lastChild
        range.insertNode(fragment)
        if (lastNode) range.setStartAfter(lastNode)
    } else {
        const textNode = document.createTextNode(event.clipboardData.getData('text/plain'))
        range.insertNode(textNode)
        range.setStartAfter(textNode)
    }

    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    onInput()
    checkActiveStyles()
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

const format = (command: Format) => {
    if (!props.isActive || isWaiting) return
    if (editorRef.value) editorRef.value.focus()
    document.execCommand(command, false)
    onInput()
    checkActiveStyles()
}

const align = (alignment: Align) => {
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

        <div class="editor-toolbar d-flex align-center border-b" @mousedown.stop>
            <v-btn 
                class="toolbar-icon-btn"
                icon="mdi-format-bold"
                variant="text" 
                density="compact" 
                :color="activeFormats.bold ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="format(Format.Bold)"
            />
            <v-btn 
                class="toolbar-icon-btn"
                icon="mdi-format-italic" 
                variant="text" 
                density="compact" 
                :color="activeFormats.italic ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="format(Format.Italic)"
            />
            
            <v-divider vertical class="mx-1" />

            <v-btn 
                class="toolbar-icon-btn"
                icon="mdi-format-align-left" 
                variant="text" 
                density="compact" 
                :color="activeFormats.left ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="align(Align.Left)"
            />
            <v-btn 
                class="toolbar-icon-btn"
                icon="mdi-format-align-center" 
                variant="text" 
                density="compact" 
                :color="activeFormats.center ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="align(Align.Center)"
            />
            <v-btn 
                class="toolbar-icon-btn"
                icon="mdi-format-align-right" 
                variant="text" 
                density="compact" 
                :color="activeFormats.right ? 'red' : undefined"
                :disabled="!props.isActive || isWaiting"
                @click="align(Align.Right)"
            />

            <v-divider vertical class="mx-1" />

            <v-menu @update:model-value="(val) => { if (val) saveSelection() }">
                <template v-slot:activator="{ props: menuProps }">
                    <v-btn 
                        variant="text" 
                        density="compact" 
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
                        :color="activeFontSize === '16px' ? 'red' : undefined"
                        @click="changeFontSize('16px')"
                    ></v-list-item>
                    <v-list-item 
                        :title="t('tools.note.size.large')"
                        :color="activeFontSize === '24px' ? 'red' : undefined"
                        @click="changeFontSize('24px')"
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
            @paste="handlePaste"
            @drop.prevent
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

.editor-toolbar :deep(.toolbar-icon-btn) {
    width: 32px;
    min-width: 32px;
    padding: 0;
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
