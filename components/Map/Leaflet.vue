L;M
<template>
  <div style="" class="w-full h-96">
    <LMap ref="map" :zoom="zoom" :max-zoom="Maxzoom" :center="center">
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        layer-type="base"
        name="OpenStreetMap"
      >
      </LTileLayer>
      <LMarker :lat-lng="center">
        <LIcon
          class-name=""
          icon-url="https://api.iconify.design/ic:round-place.svg"
          :icon-size="iconSize"
        >
        </LIcon>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup>
const iconSize = ref([24, 24]);
const zoom = ref(13);
const Maxzoom = ref(20);
const center = ref([37.9445322106899, 23.649474085963305]);
</script>

<style>
body {
  margin: 0;
}
</style>

<!-- ooui:folder-placeholder-ltr -->

<!-- <div
            class="relative inset-0 mx-auto text-red-500 border border-red-500 w-fit bg-gray-50 hover:text-gray-500 active:-translate-y-10 duration-300"
          >
            ssssssss
          </div> -->
<!--  -->
