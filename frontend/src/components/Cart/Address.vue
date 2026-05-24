<script setup lang="ts">
import { ref, computed } from "vue"
import type { Address } from '@core/model/address';
import { countries } from "@/tools/country";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

defineExpose({ open })

const addressModel = ref<Address>({
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
})

// Validation pour codes postaux et états/provinces
const stateRequiredCountries = new Set(['CA', 'US', 'AU', 'BR', 'MX', 'IN', 'CN'])

const postalValidationRules: Record<string, { regex: RegExp; required: boolean }> = {
  CA: { regex: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, required: true }, // Canada: A1A 1A1
  US: { regex: /^\d{5}(-\d{4})?$/, required: true }, // USA: 12345 or 12345-6789
  GB: { regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, required: true }, // UK: SW1A 1AA
  FR: { regex: /^\d{5}$/, required: true }, // France: 75001
  DE: { regex: /^\d{5}$/, required: true }, // Allemagne: 10115
  ES: { regex: /^\d{5}$/, required: true }, // Espagne: 28001
  IT: { regex: /^\d{5}$/, required: true }, // Italie: 00100
  AU: { regex: /^\d{4}$/, required: true }, // Australie: 2000
  NZ: { regex: /^\d{4}$/, required: true }, // Nouvelle-Zélande: 1010
  JP: { regex: /^\d{3}-\d{4}$/, required: true }, // Japon: 100-0001
  MX: { regex: /^\d{5}$/, required: true }, // Mexique: 06500
  BR: { regex: /^\d{5}-?\d{3}$/, required: true }, // Brésil: 01310-100
  IN: { regex: /^\d{6}$/, required: true }, // Inde: 110001
  CN: { regex: /^\d{6}$/, required: true }, // Chine: 100000
}

const isStateRequired = computed(() => {
  return stateRequiredCountries.has(addressModel.value.country)
})

const addressValid = computed(() => {
  return (addressModel.value.address1 ?? "").trim().length > 0
})

const cityValid = computed(() => {
  return (addressModel.value.city ?? "").trim().length > 0
})

const stateValid = computed(() => {
  if (!isStateRequired.value)
    return true
  return (addressModel.value.state ?? "").trim().length > 0
})

const postalValid = computed(() => {
  const country = addressModel.value.country
  const postalCode = addressModel.value.postalCode ?? ""

  // Si le pays n'est pas dans notre liste de validations, accepter n'importe quel format
  if (!postalValidationRules[country])
    return true

  const rule = postalValidationRules[country]

  // Si le code postal est vide et non requis, accepter
  if (!postalCode && !rule.required)
    return true

  // Sinon, valider le format
  return rule.regex.test(postalCode)

})

const emit = defineEmits<{
  (e: "save", value: Address): void
}>();

const save = () => {
  emit("save", addressModel.value);

  close();
}

const checkForm = () => {
  if (!addressModel.value.address1)
    return false
  if (!addressModel.value.city)
    return false
  if (!addressModel.value.country)
    return false
  if (!cityValid.value)
    return false
  if (!stateValid.value)
    return false
  if (!postalValid.value)
    return false

  return true;
}

</script>

<template>
  <div v-if="isOpen" class="overlay" @click="close">
    <div class="dialog" @click.stop>
      <div style="width:100%">

        <div class="closeBtn action-text" @click="close">
          <v-icon icon="mdi-close" size="30"></v-icon>
        </div>

        <p class="title">{{ t('address.title') }}</p>
        <!-- Country -->
        <v-autocomplete v-model="addressModel.country" :items="countries" item-title="name" item-value="code"
          :label="t('address.country')" variant="outlined" />

        <div v-if="addressModel.country.trim() != ''">
          <!-- Address -->
          <v-text-field v-model="addressModel.address1" :label="t('address.address') + ' *'" variant="outlined"
            :color="!addressValid ? 'error' : ''" />

          <v-text-field v-model="addressModel.address2" :label="t('address.address2')" variant="outlined" />

          <!-- City State -->
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="addressModel.city" :label="t('address.city') + ' *'" variant="outlined"
                :color="!cityValid ? 'error' : ''" />
            </v-col>

            <v-col cols="6">
              <v-text-field v-model="addressModel.state" :label="t('address.state') + (isStateRequired ? ' *' : '')"
                variant="outlined" :color="!stateValid ? 'error' : ''" />
            </v-col>
          </v-row>

          <!-- Postal -->
          <v-text-field v-model="addressModel.postalCode" :label="t('address.postalCode')" variant="outlined"
            :color="postalValid ? '' : 'error'" />
        </div>
        <button style="width: 100%;" class="mt-4 buttonColor" @click="save" :disabled="!checkForm()">
          {{ t('button.save') }}
        </button>
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
  max-width: 520px;
  width: 90%;
  position: relative;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.35);
}

.title {
  font-size: 28px;
  margin-bottom: 20px;
}

.closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  margin: 13px 26px;
}
</style>