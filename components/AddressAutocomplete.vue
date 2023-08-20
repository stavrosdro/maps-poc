<template>
  <div>
    <input
      type="text"
      v-model="address"
      @input="onInput"
      class="w-full p-2"
      placeholder="Εισάγετε διεύθυνση"
    />
    <div v-if="pending">Φόρτωση...</div>
    <div v-else-if="suggestions.length" class="mt-2">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.value"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Option } from '../stores/useMapsStore';

const { suggestions, pending } = defineProps<{
  suggestions:Option[];
  pending: boolean;
}>();
const address = ref("");

const emit = defineEmits<{
  (event: "input", value: string): void;
  (event: "select", value: Option): void;
}>();
const onInput = () => {
  emit("input", address.value);
};

const selectSuggestion = (option: Option) => {
  emit("select", option);
};
</script>
