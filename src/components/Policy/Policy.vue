<script setup type="ts">
import BasicMenu from '../Menu/BasicMenu.vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <BasicMenu />

    <div>
        <h1>{{ t('policy.title') }}</h1>
        <p>{{ t('policy.lastUpdate') }} 08-03-2026</p>

        <div style="text-align: left;">
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
            <p>
                {{ t('policy.text19') }}
                info.crochyll@gmail.com
            </p>
            <br />
        </div>
    </div>
</template>

<style scoped>
.spaceLeft {
    margin-left: 20px;
}
</style>