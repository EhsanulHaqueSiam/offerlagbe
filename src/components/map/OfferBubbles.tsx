import { useMemo } from "react";
import { Layer, type LayerProps, Source } from "react-map-gl/maplibre";
import { getCategoryColor } from "@/lib/categories";
import type { Offer } from "@/types/offer";

interface OfferBubblesProps {
  offers: Offer[];
}

export function OfferBubbles({ offers }: OfferBubblesProps) {
  const geojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: offers.map((offer) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [offer.longitude, offer.latitude],
        },
        properties: {
          id: offer._id,
          title: offer.title,
          category: offer.category,
          discountPercent: offer.discountPercent,
          storeName: offer.storeName,
          color: getCategoryColor(offer.category),
          status: offer.status,
        },
      })),
    };
  }, [offers]);

  // --- Cluster layers ---

  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "offers",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "rgba(99, 102, 241, 0.85)",
        10,
        "rgba(139, 92, 246, 0.85)",
        30,
        "rgba(236, 72, 153, 0.85)",
      ],
      "circle-radius": ["step", ["get", "point_count"], 32, 10, 38, 30, 46],
      "circle-stroke-width": 2.5,
      "circle-stroke-color": "rgba(255, 255, 255, 0.25)",
    },
  };

  // Outer ring pulse effect on clusters
  const clusterRingLayer: LayerProps = {
    id: "cluster-ring",
    type: "circle",
    source: "offers",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "transparent",
      "circle-radius": ["step", ["get", "point_count"], 36, 10, 42, 30, 50],
      "circle-stroke-width": 1.5,
      "circle-stroke-color": [
        "step",
        ["get", "point_count"],
        "rgba(99, 102, 241, 0.3)",
        10,
        "rgba(139, 92, 246, 0.3)",
        30,
        "rgba(236, 72, 153, 0.3)",
      ],
    },
  };

  // Cluster count number
  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "offers",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Noto Sans Bold"],
      "text-size": ["step", ["get", "point_count"], 15, 10, 17, 30, 20],
      "text-offset": [0, -0.4],
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#ffffff",
    },
  };

  // "offers" label under count
  const clusterLabelLayer: LayerProps = {
    id: "cluster-label",
    type: "symbol",
    source: "offers",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "offers",
      "text-font": ["Noto Sans Regular"],
      "text-size": 8,
      "text-offset": [0, 0.55],
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "rgba(255, 255, 255, 0.7)",
    },
  };

  // Best deal badge text inside clusters
  const clusterDealLayer: LayerProps = {
    id: "cluster-deal",
    type: "symbol",
    source: "offers",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["concat", "up to ", ["to-string", ["get", "maxDiscount"]], "%"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 8,
      "text-offset": [0, 1.55],
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "rgba(253, 224, 71, 0.95)",
    },
  };

  // --- Individual offer layers ---

  // Soft glow behind each bubble
  const offerGlowLayer: LayerProps = {
    id: "offer-glow",
    type: "circle",
    source: "offers",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["interpolate", ["linear"], ["get", "discountPercent"], 0, 18, 50, 34, 100, 52],
      "circle-opacity": 0.12,
      "circle-blur": 1,
    },
  };

  // Main circle for each offer
  const offerLayer: LayerProps = {
    id: "offer-points",
    type: "circle",
    source: "offers",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": ["interpolate", ["linear"], ["get", "discountPercent"], 5, 14, 25, 18, 50, 22, 75, 26, 100, 32],
      "circle-opacity": ["case", ["==", ["get", "status"], "flagged"], 0.5, 0.85],
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255, 255, 255, 0.35)",
      "circle-stroke-opacity": 0.9,
    },
  };

  // Discount percentage text inside each bubble
  const offerLabelLayer: LayerProps = {
    id: "offer-label",
    type: "symbol",
    source: "offers",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": ["concat", ["to-string", ["get", "discountPercent"]], "%"],
      "text-font": ["Noto Sans Bold"],
      "text-size": ["interpolate", ["linear"], ["get", "discountPercent"], 5, 10, 25, 11, 50, 13, 75, 15, 100, 18],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "rgba(0, 0, 0, 0.5)",
      "text-halo-width": 0.8,
    },
  };

  return (
    <Source
      id="offers"
      type="geojson"
      data={geojson}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
      clusterProperties={{
        maxDiscount: ["max", ["get", "discountPercent"]],
      }}
    >
      <Layer {...offerGlowLayer} />
      <Layer {...clusterRingLayer} />
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...clusterLabelLayer} />
      <Layer {...clusterDealLayer} />
      <Layer {...offerLayer} />
      <Layer {...offerLabelLayer} />
    </Source>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const INTERACTIVE_LAYER_IDS = ["offer-points", "clusters"];
