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
      <div v-if="selectedPlaceId" class="bg-rose-100">
        Επιλεγμένο place_id: {{ mapsStore.placeId }}
      </div>
      <form @submit.prevent="onSubmit">
        <AddressForm
          :form="addressForm"
          :update-form-field="mapsStore.onUpdateAddressForm"
          @form="updateForm"
          @submit="onSubmit"
          @addressBlur="onAddressBlur"
        />
        <button
          type="button"
          :disabled="isSubmitDisabled"
          @click="onSubmit"
          :class="[
            isSubmitDisabled
              ? 'bg-gray-400 text-black font-lg text-lg p-2'
              : 'bg-rose-400 text-white font-lg text-lg p-2',
          ]"
        >
          Υποβολή
        </button>
      </form>
      <div>{{ form }}</div>

      <div>Leaflet maps</div>

      <div>{{ form.long }} - {{ form.lang }}</div>
      <div></div>

      <ClientOnly>
        <MapLeafletv2
          v-if="form.long && form.lang"
          :zoom="18"
          iconUrl="https://api.iconify.design/ic:sharp-place.svg"
          @updatePosition="updatePosition"
          :mapCoordinates="mapCoordinates"
          :markerCoordinates="mapCoordinates"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMapsStore } from "./stores/useMapsStore";
import { storeToRefs } from "pinia";

// autocomplete data and functionality
interface Suggestion {
  place_id: string;
  description: string;
}

const mapsStore = useMapsStore()
const {autoSearch, addressForm} = storeToRefs(mapsStore)


const suggestions = ref<Suggestion[]>([]);
const pending = ref(false);

const onInput = async (inputValue: string) => {
  if (inputValue.length < 3) {
    suggestions.value = [];
    return;
  }

  pending.value = true;

  try {
    const response = await fetch(`/api/address/${inputValue}`);
    const data = await response.json();
    suggestions.value = data.predictions;
  } catch (error) {
    console.error("Σφάλμα κατά τη λήψη των προτάσεων:", error);
  } finally {
    pending.value = false;
  }
};

const selectedPlaceId = ref<string | null>(null);

// new onSelect

const onSelect = async (placeId: string) => {
  selectedPlaceId.value = placeId;

  // call for placeId
  form.value.place_id = placeId; // Αποθήκευση του place_id στο form

  try {
    const response = await fetch(`/api/${placeId}`);
    const data = await response.json();

    const addressComponents = data.result.address_components;

    const addressNumberComponent = addressComponents.find((component: any) =>
      component.types.includes("street_number")
    );
    const routeComponent = addressComponents.find((component: any) =>
      component.types.includes("route")
    );
    const localityComponent = addressComponents.find((component: any) =>
      component.types.includes("locality")
    );
    const administrativeAreaComponent = addressComponents.find(
      (component: any) =>
        component.types.includes("administrative_area_level_3")
    );
    const postalCodeComponent = addressComponents.find((component: any) =>
      component.types.includes("postal_code")
    );

    if (addressNumberComponent)
      form.value.addressNumber = addressNumberComponent.long_name;
    if (routeComponent) form.value.address = routeComponent.long_name;
    if (localityComponent) form.value.city = localityComponent.long_name;
    if (administrativeAreaComponent)
      form.value.state = administrativeAreaComponent.long_name;
    if (postalCodeComponent)
      form.value.postcode = postalCodeComponent.long_name;

    form.value.long = data.result.geometry.location.lat.toString();
    form.value.lang = data.result.geometry.location.lng.toString();
  } catch (error) {
    console.error("Σφάλμα κατά τη λήψη των δεδομένων:", error);
  }
};

// form functionality

export type AddressFormType = {
  address: string;
  addressNumber: string;
  state: string;
  city: string;
  postcode: string;
  floor: string;
  place_id: string;
  long: string;
  lang: string;
};

const form = ref<AddressFormType>({
  address: "",
  addressNumber: "",
  state: "",
  city: "",
  postcode: "",
  floor: "",
  place_id: "",
  long: "",
  lang: "",
});

const updateForm = (updatedForm: typeof form.value) => {
  form.value = updatedForm;
};

const mapPosition = ref({
  lat: parseFloat(form.value.long),
  lng: parseFloat(form.value.lang),
});

const onSubmit = () => {
  console.log("Υποβλήθηκε η φόρμα:", form.value);
  mapPosition.value = {
    lat: parseFloat(form.value.long),
    lng: parseFloat(form.value.lang),
  };
};

// leaftlet map

const mapCoordinates = computed(() => {
  if (form.value.long && form.value.lang) {
    return [parseFloat(form.value.long), parseFloat(form.value.lang)];
  }
  return [37.9444945219753, 23.649450190198728]; // default values
});

const updatePosition = (newPosition: { lat: number; lng: number }) => {
  form.value.long = newPosition.lat.toString();
  form.value.lang = newPosition.lng.toString();
};

// submit check
const isSubmitDisabled = computed(() => {
  return !form.value.address;
});

// form call for check

const addressToWatch = computed(() => form.value.address);

watch(addressToWatch, async (newAddress) => {
  if (newAddress.length < 3) {
    return;
  }

  const fullAddress = `${newAddress} ${form.value.addressNumber} ${form.value.city} ${form.value.postcode}`;

  try {
    const response = await fetch(`/api/address/${fullAddress}`);
    const data = await response.json();
    if (data.predictions && data.predictions[0]) {
      selectedPlaceId.value = data.predictions[0].place_id;
      const placeId = data.predictions[0]?.place_id;
      // μπορείτε να κάνετε κάτι άλλο με το place_id εδώ
      if (placeId) {
        {
          try {
            const response = await fetch(`/api/${placeId}`);
            const data = await response.json();
            form.value = {
              ...form.value,

              long: data.result.geometry.location.lat.toString(),
              lang: data.result.geometry.location.lng.toString(),
            };
          } catch (error) {
            console.error("Σφάλμα κατά τη λήψη των προτάσεων:", error);
          }
        } // κλήση της onSelect για να γεμίσει τα υπόλοιπα πεδία
      }
    }
  } catch (error) {
    console.error("Σφάλμα κατά τη λήψη των προτάσεων:", error);
  }
});

// address blur

const onAddressBlur = async () => {
  const fullAddress = `${form.value.address} ${form.value.addressNumber} ${form.value.city} ${form.value.postcode}`;

  try {
    const response = await fetch(`/api/address/${fullAddress}`);
    const data = await response.json();
  } catch (error) {
    console.error("Σφάλμα κατά τη λήψη των προτάσεων:", error);
  }
};
</script>

<style scoped></style>

<!-- const onSelect = async (placeId: string) => {
  selectedPlaceId.value = placeId;

  // call for placeId
  form.value.place_id = placeId; // Αποθήκευση του place_id στο form

  try {
    const response = await fetch(`/api/${placeId}`);
    const data = await response.json();

    const addressComponents = data.result.address_components;

    const addressNumberComponent = addressComponents.find((component: any) =>
      component.types.includes("street_number")
    );
    const routeComponent = addressComponents.find((component: any) =>
      component.types.includes("route")
    );
    const localityComponent = addressComponents.find((component: any) =>
      component.types.includes("locality")
    );
    const administrativeAreaComponent = addressComponents.find(
      (component: any) =>
        component.types.includes("administrative_area_level_3")
    );
    const postalCodeComponent = addressComponents.find((component: any) =>
      component.types.includes("postal_code")
    );

    // Updating form using spread operator
    form.value = {
      ...form.value,
      addressNumber: addressNumberComponent?.long_name ?? "",
      address: routeComponent?.long_name ?? "",
      city: localityComponent?.long_name ?? "",
      state: administrativeAreaComponent?.long_name ?? "",
      postcode: postalCodeComponent?.long_name ?? "",
      long: data.result.geometry.location.lat.toString(),
      lang: data.result.geometry.location.lng.toString(),
    };
  } catch (error) {
    console.error("Σφάλμα κατά τη λήψη των δεδομένων:", error);
  }
}; -->
