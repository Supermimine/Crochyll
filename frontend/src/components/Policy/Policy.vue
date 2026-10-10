<script setup lang="ts">
import { ref } from 'vue';
import BasicMenu from '../Menu/BasicMenu.vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const enum tabs {
    privacy = 'privacy',
    intellectualProperty = 'intellectualProperty'
}

const activeTab = ref < tabs > (tabs.privacy);
</script>

<template>
    <BasicMenu />

    <div>
        <h1 class="mb-3">{{ t('policy.title') }}</h1>
        <p>{{ t('policy.lastUpdate') }} 10-10-2026</p>
        <br />

        <v-tabs v-model="activeTab" align-tabs="center" density="compact" class="policy-tabs" fixed-tabs>
            <v-tab :value="tabs.privacy">{{ t('policy.privacyTitle') }}</v-tab>
            <v-tab :value="tabs.intellectualProperty">{{ t('policy.intellectualPropertyTitle') }}</v-tab>
        </v-tabs>

        <div v-if="activeTab === tabs.privacy" style="text-align: left;">
            <h3>{{ t('policy.summary') }}</h3>
            <p>
                {{ t('policy.text1') }}
            </p>
            <br />
            <p>
                {{ t('policy.text2') }}
            </p>
            <br />

            <h3>{{ t('policy.interpretation') }}</h3>
            <p>
                {{ t('policy.text3') }}
            </p>
            <br />

            <h3>{{ t('policy.definitions') }}</h3>
            <ul class="spaceLeft">
                <li>
                    <b>{{ t('policy.you') }}</b> - d{{ t('policy.text4') }}
                </li>
                <li>
                    <b>{{ t('policy.company') }}</b> {{ t('policy.text5') }}
                </li>
                <li>
                    <b>{{ t('policy.personalData') }}</b> {{ t('policy.text6') }}
                </li>
                <li>
                    <b>{{ t('policy.service') }}</b> {{ t('policy.text7') }}
                </li>
                <li>
                    <b>{{ t('policy.webSite') }}</b> {{ t('policy.text8') }}
                </li>
                <li>
                    <b>{{ t('policy.device') }}</b> {{ t('policy.text9') }}
                </li>
            </ul>
            <br />

            <h3>{{ t('policy.personalData') }}</h3>
            <p>
                {{ t('policy.text10') }}
            </p>
            <ul class="spaceLeft">
                <li>
                    <b>{{ t('policy.email') }}</b>
                </li>
                <li>
                    <b>{{ t('policy.postalCode') }}</b>
                </li>
            </ul>
            <br />

            <h3>{{ t('policy.use') }}</h3>
            <p>{{ t('policy.text11') }}</p>
            <ul class="spaceLeft">
                <li>
                    <b>{{ t('policy.contact') }}</b> {{ t('policy.text12') }}
                </li>

                <li>
                    <b>{{ t('policy.manage') }}</b> {{ t('policy.text13') }}
                </li>
            </ul>
            <br />

            <h3>{{ t('policy.conservation') }}</h3>
            <p>
                {{ t('policy.text14') }}
            </p>
            <br />

            <h3>{{ t('policy.children') }}</h3>
            <p>
                {{ t('policy.text15') }}
            </p>
            <br />

            <h3>{{ t('policy.update') }}</h3>
            <p>
                {{ t('policy.text16') }}
            </p>
            <br />
            <p>
                {{ t('policy.text17') }}
            </p>
            <br />
            <p>
                {{ t('policy.text18') }}
            </p>
            <br />

            <h3>{{ t('policy.contactUs') }}</h3>
            <p class="pb-16">
                {{ t('policy.text19') }}
                info.crochyll@gmail.com
            </p>
            <br />
        </div>

        <div v-else style="text-align: left;">
            <h3>{{ t('policy.ipScopeTitle') }}</h3>
            <p>{{ t('policy.intellectualPropertyText1') }}</p>
            <br />

            <h3>{{ t('policy.ipProductTitle') }}</h3>
            <p>{{ t('policy.ipProductText') }}</p>
            <br />

            <h3>{{ t('policy.ipVisualTitle') }}</h3>
            <p>{{ t('policy.ipVisualText') }}</p>
            <br />

            <h3>{{ t('policy.ipCodeTitle') }}</h3>
            <p>{{ t('policy.ipCodeText') }}</p>
            <br />

            <h3>{{ t('policy.ipUseTitle') }}</h3>
            <p>{{ t('policy.intellectualPropertyText2') }}</p>
            <br />

            <h3>{{ t('policy.ipPurchaseTitle') }}</h3>
            <p>{{ t('policy.intellectualPropertyText3') }}</p>
            <br />
            <p>{{ t('policy.ipPurchaseText') }}</p>
            <br />

            <h3>{{ t('policy.ipThirdPartyTitle') }}</h3>
            <p class="pb-16">
                {{ t('policy.intellectualPropertyText4') }}
                <a href="mailto:info.crochyll@gmail.com">info.crochyll@gmail.com</a>.
            </p>
            <br />
        </div>
    </div>
</template>

<style scoped>
.spaceLeft {
    margin-left: 20px;
}

.policy-tabs {
    margin-bottom: 20px;
    background-color: var(--main-color);
    color: var(--text-color);
}

.policy-tabs :deep(.v-tab) {
    background-color: var(--main-color) !important;
    color: var(--text-color);
}

.policy-tabs :deep(.v-tab--selected) {
    color: var(--action-color);
}

.policy-tabs :deep(.v-tab__slider) {
    background-color: var(--action-color);
}
</style>