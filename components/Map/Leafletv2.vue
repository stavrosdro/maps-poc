<template>
  <div id="map-leaftet" class="w-full h-96"></div>
</template>

<script setup lang="ts">
export interface Props {
  zoom?: number;
  mapCoordinates?: number[];
  markerCoordinates?: number[];
  iconUrl?: string;
  allowMapDrag?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 15,
  mapCoordinates: () => [37.9840437526508, 23.72185507275161],
  iconUrl: "https://api.iconify.design/solar:map-point-hospital-bold.svg",
  markerCoordinates: () => [37.9840437526508, 23.72185507275161],
  allowMapDrag: false,
});

const emit = defineEmits(["updatePosition"]);

onMounted(() => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

  document.head.appendChild(link);

  const script = document.createElement("script");
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.async = true;
  script.defer = true;

  document.head.appendChild(script);

  script.onload = () => {
    const L: any = (window as any).L;
    const map = L.map("map-leaftet").setView(props.mapCoordinates, props.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 21,
      maxNativeZoom: 19,
    }).addTo(map);

    const defaultIcon = L.icon({
      iconUrl: props.iconUrl,
      iconSize: [52, 52],
      className: "",
    });

    const marker = L.marker(props.markerCoordinates, {
      icon: defaultIcon,
      draggable: props.allowMapDrag,
    }).addTo(map);

    marker.on("dragend", (e: any) => {
      const newPosition = e.target.getLatLng();
      emit("updatePosition", newPosition);
    });

    watch(
      () => props.mapCoordinates,
      (newCoordinates) => {
        if (newCoordinates && map) {
          const currentZoom = map.getZoom(); // Λήψη του τρέχοντος zoom level
          map.setView(newCoordinates, currentZoom); // Χρήση του τρέχοντος zoom level
        }
      }
    );

    watch(
      () => props.markerCoordinates,
      (newCoordinates) => {
        if (newCoordinates && marker) {
          marker.setLatLng(newCoordinates);
        }
      }
    );
  };
});
watchEffect(() => {
  console.log("mapCoordinates:", props.mapCoordinates);
});
</script>

<!-- custom marker με border και τιμές....
 const createCustomIcon = (zoomLevel: number) => {
   let content = `<div class="border border-gray-500 cursor-pointer bg-gray-50 text-gray-900 font-semibold w-fit text-exs rounded-xl px-3 shadow-lg "></div>`;
   if (zoomLevel >= zoom.value) {
     content = `<div class="border border-gray-500 cursor-pointer bg-gray-50 text-gray-900 font-semibold w-fit text-exs rounded-xl px-2 shadow-lg">22$</div>`;
   }
   return L.divIcon({
     className: "",
     html: content,
   });
 };

 const marker = L.marker([37.9444945219753, 23.649450190198728], {
   icon: createCustomIcon(zoom.value),
 }).addTo(map);

 map.on("zoomend", () => {
   const zoomLevel = map.getZoom();
   marker.setIcon(createCustomIcon(zoomLevel));
 }); -->
