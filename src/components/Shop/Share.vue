<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isOpen = ref(false)

const open = () => {
    isOpen.value = true;
}

const close = () => {
    isOpen.value = false;
};

const shareLink = () => {
    const pageUrl = window.location.href;
    navigator.clipboard.writeText(pageUrl);
};

const shareFacebook = () => {
    const pageUrl = window.location.href;
    let url = "https://www.facebook.com/sharer.php?u=" + pageUrl;
    shareWindow(url);
};
const shareMessenger = () => {
    const pageUrl = window.location.href;
    let url = "https://www.messenger.com/share?link=" + pageUrl;
    shareWindow(url);
};
const shareLinkedIn = () => {
    const pageUrl = window.location.href;
    const title = encodeURIComponent(document.title);
    let url = "https://www.linkedin.com/shareArticle?url=" + pageUrl + "&title=" + title;
    shareWindow(url);
};
const shareEmail = () => {
    const subject = encodeURIComponent("Crochyll - Partage");
    const body = encodeURIComponent("Je pense que ceci pourrais t'intéresser: " + window.location.href);
    let url = "mailto:?subject=" + subject + "&body=" + body;
    shareWindow(url);
};
const shareWindow = (url: string | URL | undefined) => {
    const left = (screen.width - 570) / 2;
    const top = (screen.height - 570) / 2;
    const params = "menubar=no,toolbar=no,status=no,width=570,height=570,top=" + top + ",left=" + left;
    window.open(url, "NewWindow", params);
};

defineExpose({
    open
})
</script>

<template>
    <div v-if="isOpen" class="overlay" @click="close">
        <div :class="['dialog', { open: isOpen }]">
            <div style="width: 100%;">
                <a class="closeBtn action-text" @click="close">
                    <v-icon icon="mdi-close" size="30" class="ml-1"></v-icon>
                </a>
                <p style="font-size: 30px;">{{ t('share.title') }}</p>

                <button style="width: 100%; margin: 5px;" @click="shareLink">
                    <span>{{ t('share.link') }}</span>
                    <v-icon size="20" class="ml-1" icon="mdi-link-variant"></v-icon>
                </button>

                <div style="display: flex;">
                    <button style="background-color: #1877f2 !important; width: 50%; margin: 5px;"
                        @click="shareFacebook">
                        Facebook
                    </button>
                    <button style="background-color: #0866ff !important; width: 50%; margin: 5px;"
                        @click="shareMessenger">
                        Messenger
                    </button>
                </div>
                <div style="display: flex;">
                    <button style="background-color: #0a66c2 !important; width: 50%; margin: 5px;"
                        @click="shareLinkedIn">
                        LinkedIn
                    </button>
                    <button style="background-color: #6fcf97 !important; width: 50%; margin: 5px;" @click="shareEmail">
                        Email
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 998;
}

.dialog {
    background: var(--main-color);
    padding: 20px;
    border-radius: 5px;
    max-width: 500px;
    width: 90%;
    position: relative;
    text-align: left;

    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);
}

.closeBtn {
    position: absolute;
    top: 0px;
    right: 0px;
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    padding: 0;
    margin: 13px 26px;
}
</style>