<template>
  <div>
    {{ props.form }}
    <div>
      <label for="address">Οδός και αριθμός:</label>
      <input
        type="text"
        id="address"
        v-model="localForm.streetAddress"
        @input="onUpdateCriticalField"
        class="inputStyle"
        @blur="$emit('addressBlur')"
      />
    </div>
    <div>
      <label for="address">state</label>
      <input
        type="text"
        id="state"
        v-model="localForm.state"
        @input="onUpdateCriticalField"
        class="inputStyle"
      />
    </div>
    <div>
      <label for="address">city</label>
      <input
        type="text"
        id="city"
        v-model="localForm.city"
        @input="onUpdateCriticalField"
        class="inputStyle"
      />
    </div>
    <div>
      <label for="address">postcode</label>
      <input
        type="text"
        id="postcode"
        v-model="localForm.postcode"
        @input="onUpdateCriticalField"
        class="inputStyle"
      />
    </div>
    <div>
      <label for="address">floor</label>
      <input
        type="text"
        id="floor"
        v-model="localForm.floor"
        @input="updateForm"
        class="inputStyle"
      />
    </div>
    <!-- Παρόμοιος κώδικας για τα υπόλοιπα πεδία -->
  </div>
</template>

<script setup lang="ts">
import { AddressForm } from '../stores/useMapsStore';

const props = defineProps<{
  form: AddressForm;
  updateFormField: (form: AddressForm) => void
}>();


const localForm = ref<AddressForm>({
  streetAddress: '',
  state: '',
  city: '',
  postcode: '',
  floor: '',
  lang: '',
  long: '',
});

const initialFormPatch = ref(true)

watchEffect(() => {
  if (props.form.streetAddress && initialFormPatch.value) {
    initialFormPatch.value = false;
    localForm.value = {...props.form}
  } else {
    localForm.value.lang = props.form.lang
    localForm.value.long = props.form.long
  }

  // localForm.value.streetAddress = localForm.value.streetAddress || props.form.streetAddress
  // localForm.value.state = props.form.state
  // localForm.value.city = localForm.value.city || props.form.city
  // localForm.value.postcode = localForm.value.postcode || props.form.postcode
  // localForm.value.floor = localForm.value.floor || props.form.floor
})



const onUpdateCriticalField = useDebounce(() => props.updateFormField(localForm.value))

const emit = defineEmits(["form", "submit", "addressBlur"]);

const updateForm = () => {
  // emit("form", localForm.value);
};

const onSubmit = () => {
  // emit("submit");
};
</script>

<style scoped>
.inputStyle {
  @apply bg-gray-50 border border-gray-300 rounded-lg;
}
</style>
