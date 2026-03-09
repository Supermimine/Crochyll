<script setup lang="ts">
import { ref, computed } from "vue"
import type { Address } from '@/model/address';
import { countries } from "@/tools/country";

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
  country: "CA",
})

const postalRegexCanada = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/

const postalValid = computed(() => {
  if (addressModel.value.country !== "CA")
    return true

  return postalRegexCanada.test(addressModel.value.postalCode ?? "")

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

        <p class="title">Adresse</p>
        <!-- Country -->
        <v-select v-model="addressModel.country" :items="countries" item-title="name" item-value="code" label="Pays"
          variant="outlined" />

        <!-- Address -->
        <v-text-field v-model="addressModel.address1" label="Adresse" variant="outlined" />

        <v-text-field v-model="addressModel.address2" label="Apartment / Unit" variant="outlined" />

        <!-- City State -->
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="addressModel.city" label="Ville" variant="outlined" />
          </v-col>

          <v-col cols="6">
            <v-text-field v-model="addressModel.state" label="State / Province" variant="outlined" />
          </v-col>
        </v-row>

        <!-- Postal -->
        <v-text-field v-model="addressModel.postalCode" label="Code Postale" variant="outlined"
          :color="postalValid ? '' : 'error'" />

        <button style="width: 100%;" class="mt-4 buttonColor" @click="save" :disabled="!checkForm()">
          Savegarder
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