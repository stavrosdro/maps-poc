export function useLeafletMap(
  containerId: string,
  coordinates: [number, number],
  zoomLevel: number
) {
  const dynamicIconUrl = ref("https://api.iconify.design/ic:sharp-place.svg");

  onMounted(() => {
    loadLeafletLibraries().then(() => {
      const L: any = (window as any).L;
      const map = L.map(containerId).setView(coordinates, zoomLevel);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 21,
        maxNativeZoom: 19,
      }).addTo(map);

      const defaultIcon = L.icon({
        iconUrl: dynamicIconUrl.value,
        iconSize: [48, 48],
        className: "my-icon-style",
      });

      L.marker(coordinates, { icon: defaultIcon }).addTo(map);
    });
  });

  return { dynamicIconUrl };
}

function loadLeafletLibraries() {
  return new Promise<void>((resolve) => {
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
      resolve();
    };
  });
}
