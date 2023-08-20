<template>
  <div id="map" class="h-full w-full rounded-2xl"></div>
</template>

<reference types="@types/googlemaps" />
<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader";

let map: any = ref(null);
const loader = new Loader({
  apiKey: "",
  version: "weekly",
  libraries: ["places"],
});

onMounted(async () => {
  await loader.importLibrary("places");
  map.value = new (window as any).google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    }
  );
});
</script>

<style>
#map {
  height: 100%;
}
</style>
