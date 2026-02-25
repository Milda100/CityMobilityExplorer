import maplibregl from "maplibre-gl";
import { transportConfig } from "../utils/transportIconConfig";

export const MapSources = {
  VEHICLES: "vehicles-source",
  STOPS: "tpc-source",
};

export const MapLayers = {
  VEHICLES: "vehicles-layer",
  STOPS: "tpc-layer",
  CLUSTERS: "tpc-clusters",
  CLUSTER_COUNT: "tpc-cluster-count",
};

type SetupLayersParams = {
  map: maplibregl.Map;
  onSelectedStop: (stop: any) => void;
};

// Safe image loader helper
const loadImageSafe = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn("Image failed to load:", src, e);
      resolve(null);
    };
    img.src = src;
  });

export const setupMapLayers = async ({
  map,
  onSelectedStop,
}: SetupLayersParams) => {
  /* ---- VEHICLES ---- */
  map.addSource(MapSources.VEHICLES, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  for (const [type, config] of Object.entries(transportConfig)) {
    if (!config.mapIcon) continue;

    const vehicleImg = await loadImageSafe(config.mapIcon!);
    if (vehicleImg && !map.hasImage(type)) {
      map.addImage(type, vehicleImg);
      console.log("Loaded vehicle icon:", type);
    }
  }

  map.addLayer({
    id: MapLayers.VEHICLES,
    type: "symbol",
    source: MapSources.VEHICLES,
    layout: {
      "icon-image": ["get", "icon"],
      "icon-size": 0.4,
      "icon-allow-overlap": true,
    },
  });

  /* ---- STOPS ---- */
  map.addSource(MapSources.STOPS, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: true,
    clusterMaxZoom: 12,
    clusterRadius: 50,
  });

  const stopImg = await loadImageSafe("/icons/stop.svg");
  if (stopImg && !map.hasImage("stop")) {
    map.addImage("stop", stopImg, { sdf: false });
    console.log("Loaded stop icon");
  }

  map.addLayer({
    id: MapLayers.STOPS,
    type: "symbol",
    source: MapSources.STOPS,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": "stop",
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        0.15,
        13,
        0.22,
        16,
        0.32,
      ],
      "icon-allow-overlap": true, //not sure
      "icon-anchor": "bottom",
    },
  });

  /*------ Clustering shape Layer ----*/
  map.addLayer({
    id: MapLayers.CLUSTERS,
    type: "circle",
    source: MapSources.STOPS,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#2563eb",
      "circle-radius": [
        "step",
        ["get", "point_count"],
        18,
        50,
        24,
        100,
        30,
        500,
        38,
      ],
      "circle-opacity": 0.85,
    },
  });

  /* ---- Clustering count layer ---- */
  map.addLayer({
    id: MapLayers.CLUSTER_COUNT,
    type: "symbol",
    source: MapSources.STOPS,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 12,
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  /* ---- Hover & click ---- */
  map.on("mouseenter", MapLayers.STOPS, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", MapLayers.STOPS, () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("mouseenter", MapLayers.CLUSTERS, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", MapLayers.CLUSTERS, () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("click", MapLayers.STOPS, (e) => {
    if (!e.features?.length) return;
    console.log("Raw feature props:", e.features[0].properties);

    const feature = e.features[0];
    if (feature.geometry.type !== "Point") return;

    const coords = feature.geometry.coordinates as [number, number];
    const props = feature.properties as any;
    console.log("Stop clicked:", props);

    onSelectedStop({
      coordinates: coords,
      town: props.town,
      name: props.name,
      tpc: props.tpc,
      stopAreaCode: props.stopAreaCode,
      tpWheelChairAccessible: props.tpWheelChairAccessible,
      tpVisualAccessible: props.tpVisualAccessible,
    });
  });

  map.on("click", MapLayers.CLUSTERS, async (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [MapLayers.CLUSTERS],
    });

    if (!features.length) return;

    const clusterId = features[0].properties?.cluster_id as number;

    const source = map.getSource(MapSources.STOPS) as maplibregl.GeoJSONSource;
    if (!source) return;

    const zoom = await source.getClusterExpansionZoom(clusterId);

    map.easeTo({
      center: (features[0].geometry as any).coordinates,
      zoom,
      duration: 400,
    });
  });
};
