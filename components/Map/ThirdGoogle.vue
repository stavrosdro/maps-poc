<script setup lang="ts">
const props = defineProps<{
  position: { lat: number; lng: number };
  icon: string;
  customClass: string;
}>();

declare global {
  interface Window {
    google: any;
  }
}

// custom marker

const map = ref<any>(null);
const center = { lat: -34.397, lng: 150.644 };
const marker = ref<any>(null);

// Προσθήκη της συνάρτησης στο αντικείμενο window
(window as any).initMap = initMap;

function initMap() {
  map.value = new window.google.maps.Map(
    document.getElementById("google-map") as HTMLElement,
    {
      center,
      zoom: 20,
    }
  );
  const markerIcon = {
    url: props.icon, // URL του εικονιδίου
    scaledSize: new window.google.maps.Size(30, 30), // Μέγεθος του εικονιδίου
  };

  marker.value = new window.google.maps.Marker({
    position: props.position,
    map: map.value,
    title: "Η τοποθεσία μου",
    draggable: true,
    icon: markerIcon, // Χρησιμοποιήστε το εικονίδιο
  });

  marker.value.addListener("dragend", (event: any) => {
    const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    emit("updatePosition", newPosition);
  });
}

watch(
  () => props.position,
  (newPosition) => {
    if (map.value && marker.value) {
      map.value.setCenter(newPosition);
      marker.value.setPosition(newPosition);
    }
  },
  { immediate: true }
);

onMounted(() => {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
});

const emit = defineEmits<{
  (event: "updatePosition", position: { lat: number; lng: number }): void;
}>();
</script>

<template>
  <div id="google-map" class="h-full w-full"></div>
</template>

<style>
#map {
  height: 400px;
  width: 100%;
}
</style>
