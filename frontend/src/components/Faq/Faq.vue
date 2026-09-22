<script setup lang="ts">
import BasicMenu from "../Menu/BasicMenu.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <BasicMenu />

    <div>
        <h1>{{ t('faq.title') }}</h1>
        <p>{{ t('faq.description') }}</p>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question1')" :text="t('faq.reponse1')">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question2')" :text="t('faq.reponse2')">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question3')" :text="t('faq.reponse3')">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question4')" :text="t('faq.reponse4')">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question5')" :text="t('faq.reponse5') + 'info.crochyll@gmail.com.'">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question6')" :text="t('faq.reponse6')">
            </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels>
            <v-expansion-panel :title="t('faq.question7')" :text="t('faq.reponse7')">
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<style scoped>
.v-expansion-panels {
    margin: 30px 50px;
    width: auto;
}

.v-expansion-panel {
    background-color: var(--main-color);
}
</style>