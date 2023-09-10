<template>
  <div class="h-screen w-full px-12">
    <div class="w-full h-96 mt-12">
      <div class="mt-10">
        <AddressAutocomplete
          v-if="autoSearch"
          :suggestions="mapsStore.selections"
          :pending="mapsStore.isLoading"
          @input="mapsStore.searchWithQuery"
          @select="mapsStore.selectLocation"
        />
      </div>
      <form @submit.prevent="mapsStore.userFormSubmit">
        <AddressForm
          :form="addressForm"
          :update-form-field="mapsStore.onUpdateAddressForm"
        />
        <button
          type="button"
          @click="mapsStore.userFormSubmit"
          class="bg-rose-400 text-white font-lg text-lg p-2"
        >
          Υποβολή
        </button>
      </form>
      <div>Leaflet maps</div>

      <div>{{ addressForm.lang }} - {{ addressForm.long }}</div>
      <div></div>

      <ClientOnly>
        <MapLeafletv2
          v-if="mapsStore.showMapView"
          :zoom="18"
          iconUrl="https://api.iconify.design/ic:sharp-place.svg"
          @updatePosition="mapsStore.userUpdateLangLong"
          :mapCoordinates="mapsStore.getAddressLangLong"
          :markerCoordinates="mapsStore.getAddressLangLong"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMapsStore } from "./stores/useMapsStore";
import { storeToRefs } from "pinia";

const mapsStore = useMapsStore()
const {autoSearch, addressForm} = storeToRefs(mapsStore)
</script>
