<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n'
import { safeStorageGet, safeStorageSetJSON } from '@/tools/appTools';

const { t } = useI18n()

import type { Project } from '@core/model/myProject/project';
import type { Yarn } from '@core/model/myProject/yarn';

import { StateProject, TypeMaking } from '@core';

const lstProjects = ref<Project[]>([]);
const lstYarn = ref<Yarn[]>([]);

const typeList = ref<{ name: string; code: number }[]>(
    Object.keys(TypeMaking)
        .filter(k => isNaN(Number(k)))
        .map((k) => {
            const code = (TypeMaking as any)[k] as number;
            return { name: `${k}`, code };
        })
);
const stateList = ref<{ name: string; code: number }[]>(
    Object.keys(StateProject)
        .filter(k => isNaN(Number(k)))
        .map((k) => {
            const code = (StateProject as any)[k] as number;
            return { name: `${k}`, code };
        })
);
const projectModel = ref<Project>({
    name: '',
    description: '',
    type: TypeMaking.Crochet,
    hookSize: 0,
    state: StateProject.InProgress,
    notes: [],
    yarns: [],
    image: undefined,
    noPlace: undefined
});
const noteModel = ref<string>("");
const currentProject = ref<Project>();

const showDialog = ref<boolean>(false);
const openItems = ref<Record<number, boolean>>({});
const showDialogNote = ref<boolean>(false);

const selectedFile = ref<File | null>(null)
const menuOpen = ref<boolean>(false);

onMounted(async () => {
    const storageValue = safeStorageGet("myProfil:project")
    lstProjects.value = storageValue ? JSON.parse(storageValue) : []
});

const openDialog = () => {
    showDialog.value = true;
    projectModel.value = {
        name: '',
        description: '',
        type: TypeMaking.Crochet,
        hookSize: 4,
        state: StateProject.InProgress,
        notes: [],
        yarns: [],
        image: undefined,
        noPlace: undefined
    }

    getYarns()
}

const checkForm = () => {
    if (projectModel.value.name == '')
        return false

    return true;
}

const save = (project: Project) => {
    const storageValue = safeStorageGet("myProfil:project");
    lstProjects.value = storageValue ? JSON.parse(storageValue) : [];

    const existingIndex = lstProjects.value.findIndex(
        (entry: Project) =>
            entry.name === project.name
    );

    if (existingIndex !== -1) {
        lstProjects.value[existingIndex] = { ...project };
    } else {
        lstProjects.value.push({ ...project });
    }

    safeStorageSetJSON('myProfil:project', lstProjects.value);
    showDialog.value = false;
};

const editProject = (project: Project) => {
    showDialog.value = true;
    projectModel.value = JSON.parse(JSON.stringify(project));

    getYarns()
}

const deleteProject = (project: Project) => {
    const isConfirmed: boolean = window.confirm(t('myProfil.delete'));

    if (isConfirmed) {
        const storageValue = safeStorageGet("myProfil:project");
        const storedYarn = storageValue ? JSON.parse(storageValue) as Project[] : [];

        const indexToRemove = storedYarn.findIndex(
            (entry: Project) =>
                entry.name === project.name
        );

        if (indexToRemove !== -1) {
            storedYarn.splice(indexToRemove, 1);
            lstProjects.value = storedYarn;
            safeStorageSetJSON('myProfil:project', storedYarn);
        }
    }
}

const showInfo = () => {
    alert(t('myProject.infoNoPlace'));
}

const toggleOpen = (index: number) => {
    openItems.value[index] = !openItems.value[index];
};

const getYarns = (): void => {
    const storageValue = safeStorageGet("myProfil:reserve")
    lstYarn.value = storageValue ? JSON.parse(storageValue) : []

    lstYarn.value = lstYarn.value.map(item => ({
        ...item,
        useQuantity: 0
    }));
}

const getRemainingQuantity = (yarn: Yarn, currentUseQuantity: number): number => {
    const allProjectYarns = lstProjects.value.flatMap(project => project.yarns);

    const totalUsed = allProjectYarns
        .filter((y: Yarn) => y.name === yarn.name && y.size === yarn.size && y.color === yarn.color)
        .reduce((sum: number, y: Yarn) => sum + y.useQuantity, 0);

    return yarn.quantity - (totalUsed + currentUseQuantity);
};

const handleIncrement = (yarn: Yarn): void => {
    if (!yarn.useQuantity) {
        yarn.useQuantity = 1;
    } else if (getRemainingQuantity(yarn, yarn.useQuantity) > 0) {
        yarn.useQuantity++;
    }
};

const handleDecrement = (yarn: Yarn): void => {
    if (yarn.useQuantity && yarn.useQuantity > 0) {
        yarn.useQuantity--;
    }
};

const handleMenuClose = (isOpen: boolean): void => {
    if (!isOpen) {
        const selectedYarns = lstYarn.value.filter((yarn: Yarn) => yarn.useQuantity && yarn.useQuantity > 0);
        projectModel.value.yarns = selectedYarns.map((yarn: Yarn) => yarn);
    } else {
        lstYarn.value.forEach((availableYarn: Yarn) => {
            const projectYarn = projectModel.value.yarns.find((y: Yarn) =>
                y.name === availableYarn.name &&
                y.color === availableYarn.color &&
                y.size === availableYarn.size
            );

            availableYarn.useQuantity = projectYarn ? projectYarn.useQuantity : 0;
        });
    }
};

const onDragStart = (event: DragEvent, index: number): void => {
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', index.toString());
    }
};

const onDrop = (event: DragEvent, targetIndex: number): void => {
    if (!event.dataTransfer) return;

    const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const [movedProject] = projectModel.value.yarns.splice(sourceIndex, 1);
    projectModel.value.yarns.splice(targetIndex, 0, movedProject);
};

const showNote = (project: Project) => {
    showDialogNote.value = true
    noteModel.value = ""
    currentProject.value = project
}
const addNote = () => {
    if (currentProject.value == null)
        return;

    currentProject.value.notes.push(noteModel.value)
    showDialogNote.value = false

    save(currentProject.value)
}
const deleteNote = (note: string, project: Project) => {
    const isConfirmed: boolean = window.confirm(t('myProfil.delete'));

    if (isConfirmed) {
        const storedNotes = project.notes

        const indexToRemove = storedNotes.findIndex(
            (entry: string) =>
                entry === note
        );

        if (indexToRemove !== -1) {
            storedNotes.splice(indexToRemove, 1);
            project.notes = storedNotes;
        }
    }

    save(project)
}

const onFileSelected = (files: File | File[] | null) => {
    if (!files) return

    const file = Array.isArray(files) ? files[0] : files
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
        if (e.target?.result) {
            projectModel.value.image = e.target.result as string
        }
    }

    reader.readAsDataURL(file)
    selectedFile.value = null
}

const removeImage = () => {
    projectModel.value.image = null
}
</script>

<template>
    <h3 class="ma-auto">{{ t('myProject.title') }}</h3>
    <p class="ma-auto" v-if="lstProjects.length === 0">{{ t('myProject.empty') }}</p>

    <div v-else v-for="(project, index) in lstProjects" :key="index" class="box">
        <div class="card-top">
            <div class="card-header">
                <img :src="project.image || '/img/no-picture.png'" :alt="`${project.name}.png`" class="imgBox">

                <div class="card-title">
                    <span v-if="project.noPlace" class="place">#{{ project.noPlace }}</span>

                    <h3>{{ project.name }}</h3>
                    <p class="subtitle">{{ t('enum.typeMaking.' + project.type) }} {{ project.hookSize }}mm</p>
                </div>
            </div>

            <div class="card-actions">
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click="editProject(project)" />
                <v-btn icon="mdi-delete-outline" variant="text" size="small" @click="deleteProject(project)" />
            </div>
        </div>

        <span style="text-align: left; width: 100%; display: block;">
            {{ t('enum.stateProject.' + project.state) }}
        </span>

        <div class="details-toggle">
            <a href="" @click.prevent="toggleOpen(index)">
                <v-icon :icon="openItems[index]
                    ? 'mdi-chevron-double-up'
                    : 'mdi-chevron-double-down'" />
            </a>
        </div>

        <v-expand-transition>
            <div v-show="openItems[index]" class="details">
                <div v-if="project.description" class="detail-row">
                    <span>{{ t('myProject.projectModel.description') }}</span>
                    <strong>{{ project.description }}</strong>
                </div>

                <div v-if="project.yarns.length > 0" class="detail-row">
                    <span style="margin-bottom: auto;">{{ t('myProject.projectModel.yarns') }}</span>
                    <div style="display: grid;">
                        <strong v-for="yarn in project.yarns">{{ yarn.name }} - {{ yarn.color }} (x{{ yarn.useQuantity
                        }})</strong>
                    </div>
                </div>

                <div class="detail-row">
                    <span style="margin-bottom: auto;">{{ t('myProject.projectModel.notes') }}</span>
                    <div style="display: grid;">
                        <div v-for="note in project.notes" style="display: flex; margin-bottom: 5px;"
                            class="note-actions">
                            <v-btn icon="mdi-delete-outline" variant="text" size="small" style="margin-right: 10px;"
                                @click="deleteNote(note, project)"></v-btn>
                            <strong style="margin: auto;">{{ note }}</strong>
                        </div>
                        <v-btn @click="showNote(project)" style="max-width: 70px; margin-left: auto;">{{ t('button.add')
                        }}</v-btn>
                    </div>
                </div>
            </div>
        </v-expand-transition>
    </div>

    <v-btn class="buttonColor addItem" icon="mdi-plus" size="large" @click="openDialog()"></v-btn>

    <div v-if="showDialog" class="overlay">
        <div class="dialog" @click.stop>
            <div class="closeBtn action-text" @click="showDialog = false;">
                <v-icon icon="mdi-close" size="30"></v-icon>
            </div>

            <div style="width:100%">
                <h3 class="title">{{ t('myProject.projectModel.title') }}</h3>

                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="projectModel.name" :label="t('myProject.projectModel.name') + ' *'"
                            variant="outlined" density="compact" hide-details="auto" />
                    </v-col>

                    <v-col cols="12">
                        <v-textarea v-model="projectModel.description"
                            :label="t('myProject.projectModel.description') + ' *'" variant="outlined" density="compact"
                            hide-details="auto" />
                    </v-col>

                    <v-row>
                        <v-col cols="12">
                            <v-file-input v-if="!projectModel.image" v-model="selectedFile"
                                :label="t('myProject.projectModel.image')" accept="image/*" prepend-icon=""
                                variant="outlined" density="compact" hide-details="auto"
                                class="centered-label-input custom-file-color" @update:model-value="onFileSelected"
                                style="cursor: pointer !important;"></v-file-input>

                            <v-card v-else height="160" width="100%" class="position-relative">
                                <v-img :src="projectModel.image" height="160" cover class="bg-grey-lighten-2 rounded">
                                    <v-btn icon="mdi-close" size="small" color="error"
                                        class="position-absolute top-0 right-0 ma-2" style="z-index: 1;"
                                        @click="removeImage"></v-btn>
                                </v-img>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-col cols="12">
                        <v-autocomplete v-model="projectModel.type" :items="typeList" item-title="name"
                            item-value="code" :label="t('myProject.projectModel.type') + ' *'" variant="outlined"
                            density="compact" hide-details="auto" />
                    </v-col>

                    <v-col cols="12">
                        <v-text-field v-model="projectModel.hookSize"
                            :label="t('myProject.projectModel.hookSize') + ' *'" variant="outlined" density="compact"
                            hide-details="auto" suffix="mm" />
                    </v-col>

                    <v-col cols="12">
                        <v-autocomplete v-model="projectModel.state" :items="stateList" item-title="name"
                            item-value="code" :label="t('myProject.projectModel.state') + ' *'" variant="outlined"
                            density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="11">
                        <v-text-field v-model="projectModel.noPlace" :label="t('myProject.projectModel.noPlace')"
                            variant="outlined" density="compact" hide-details="auto" />

                    </v-col>
                    <v-col cols="1"
                        style="display: flex; justify-content: center; align-items: center; cursor: pointer;">
                        <v-icon icon="mdi-information-outline" size="20" @click="showInfo"></v-icon>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <div style="display: flex; justify-content: space-between;">
                            <v-label style="display: block;">{{ t('myProject.projectModel.yarn') }}</v-label>

                            <v-menu v-model="menuOpen" :close-on-content-click="false"
                                @update:model-value="handleMenuClose">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props">
                                        {{ t('myProject.projectModel.paring') }}
                                    </v-btn>
                                </template>

                                <v-list width="400" class="pa-2">
                                    <v-list-item v-for="(yarn, index) in lstYarn"
                                        :key="`${yarn.color}-${yarn.name}-${yarn.size}-${index}`"
                                        class="mb-2 border-sm rounded-lg" @click.stop>
                                        <div>
                                            <div class="font-weight-bold text-subtitle-1">
                                                {{ yarn.name }}
                                            </div>
                                            <div class="text-caption text-medium-emphasis">
                                                {{ yarn.color }}
                                            </div>
                                            <div class="text-caption mt-1">
                                                Sélectionné : <strong>{{ yarn.useQuantity || 0 }}</strong>
                                                <span class="text-grey mx-1">|</span>
                                                Dispo : <strong>{{ getRemainingQuantity(yarn, yarn.useQuantity || 0)
                                                    }}</strong>
                                            </div>
                                        </div>

                                        <template #append>
                                            <div class="d-flex align-center gap-1">
                                                <v-btn icon="mdi-minus" density="comfortable"
                                                    :disabled="!yarn.useQuantity || yarn.useQuantity <= 0"
                                                    @click.stop="handleDecrement(yarn)"></v-btn>

                                                <v-btn icon="mdi-plus" density="comfortable"
                                                    :disabled="getRemainingQuantity(yarn, yarn.useQuantity || 0) <= 0"
                                                    @click.stop="handleIncrement(yarn)"></v-btn>
                                            </div>
                                        </template>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-btn style="width: 100%;" class="buttonColor"
                                            @click="menuOpen = false; handleMenuClose(false)">Confirmer</v-btn>
                                    </v-list-item>

                                    <v-list-item v-if="lstYarn.length === 0">
                                        <v-list-item-title class="text-grey text-center py-4">
                                            {{ t('myProject.projectModel.empty') }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>

                        <v-list v-if="projectModel.yarns.length > 0" style="margin-top: 25px;">
                            <v-list-item v-for="(item, index) in projectModel.yarns" :key="index" draggable="true"
                                @dragstart="onDragStart($event, index)" @dragover.prevent @drop="onDrop($event, index)">
                                <template #prepend>
                                    <v-icon style="cursor: move;">mdi-drag-vertical</v-icon>
                                </template>
                                <v-list-item-title>{{ item.name }} - {{ item.color }} ({{ item.useQuantity
                                    }})</v-list-item-title>

                                <template #append>
                                    <v-btn icon="mdi-delete" variant="text"
                                        @click.stop="projectModel.yarns.splice(index, 1)"></v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-col>
                </v-row>

                <v-btn style="width: 100%;" class="mt-4 buttonColor" @click="save(projectModel)"
                    :disabled="!checkForm()">
                    {{ t('button.save') }}
                </v-btn>
            </div>
        </div>
    </div>

    <div v-if="showDialogNote" class="overlay">
        <div class="dialog" @click.stop>
            <div class="closeBtn action-text" @click="showDialogNote = false;">
                <v-icon icon="mdi-close" size="30"></v-icon>
            </div>

            <div style="width:100%">
                <h3 class="title">{{ t('myProject.projectModel.note') }}</h3>

                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="noteModel" variant="outlined" density="compact" hide-details="auto" />
                    </v-col>
                </v-row>

                <v-btn style="width: 100%;" class="mt-4 buttonColor" @click="addNote()"
                    :disabled="noteModel == null || noteModel == ''">
                    {{ t('button.save') }}
                </v-btn>
            </div>
        </div>
    </div>
</template>

<style scoped>
.addItem {
    position: fixed;
    right: 20px;
    bottom: 20px;

    width: 68px;
    height: 68px;

    border-radius: 50%;
    background-color: var(--action-color);

    display: flex;
    justify-content: center;
    align-items: center;

    box-shadow: 0 4px 12px rgba(0, 0, 0, .2);
    cursor: pointer;
}

.overlay {
    position: fixed;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    background: rgba(0, 0, 0, .4);
    z-index: 998;
}

.dialog {
    position: relative;

    width: min(520px, 90%);
    max-height: 80vh;

    padding: 24px;

    overflow-y: auto;

    background: var(--main-color);
    border-radius: 14px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, .25);
}

.closeBtn {
    position: absolute;
    top: 18px;
    right: 18px;

    cursor: pointer;
}

.box {
    position: relative;

    width: 100%;
    min-width: 380px;

    margin: 16px 0;
    padding: 18px;

    background: var(--middle-color);
    border-radius: 14px;

    transition: .2s ease;
}

.box:hover {
    transform: translateY(-2px);
}

.imgBox {
    width: 72px;
    height: 72px;

    flex-shrink: 0;

    border-radius: 10px;
    background: var(--dark-color);

    object-fit: cover;
}

.card-title {
    position: relative;
    flex: 1;
}

.place {
    position: absolute;
    top: 0;
    right: 0;

    opacity: .6;
    font-size: .85rem;
    font-style: italic;
}

.card-title h3 {
    margin: 0;
    padding-right: 60px;

    font-size: 1.35rem;
    font-weight: 700;
}

.subtitle {
    margin-top: 4px;

    opacity: .75;
    font-size: .95rem;
}

.quantity {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: 14px;
}

.status {
    font-weight: 600;
}

.details-toggle {
    display: flex;
    justify-content: center;
}

.details {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-top: 8px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 2px 0;
}

.detail-row span {
    opacity: .65;
}

.detail-row strong {
    text-align: right;
}

.card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.card-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex: 1;
    min-width: 0;
}

.card-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    margin-top: auto;
    margin-bottom: auto;
}

.card-actions .v-btn {
    opacity: 0;
    transition: .2s;
}

.note-actions .v-btn {
    opacity: 0;
    transition: .2s;
}

.box:hover .card-actions .v-btn {
    opacity: 1;
}

.note-actions:hover .v-btn {
    opacity: 1;
}

:deep(.centered-label-input) {
    height: 160px;
}

:deep(.centered-label-input .v-label) {
    width: 100%;
    justify-content: center;
}

:deep(.centered-label-input .v-field__field) {
    justify-content: center;
    text-align: center;
}

@media (max-width: 480px) {

    .box {
        min-width: auto;
        padding: 16px;
    }

    .imgBox {
        width: 60px;
        height: 60px;
    }

    .card-title h3 {
        font-size: 1.15rem;
    }

    .quantity,
    .detail-row {
        font-size: .95rem;
    }

}
</style>