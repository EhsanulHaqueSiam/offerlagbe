import { useMemo } from "react";
import { Source, Layer, type LayerProps } from "react-map-gl/maplibre";
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

  const clusterLayer: LayerProps = {
    id: "clusters",
    type: "circle",
    source: "offers",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "rgba(99, 102, 241, 0.7)",
        10,
        "rgba(139, 92, 246, 0.7)",
        30,
        "rgba(236, 72, 153, 0.7)",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 10, 28, 30, 36],
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255, 255, 255, 0.2)",
    },
  };

  const clusterCountLayer: LayerProps = {
    id: "cluster-count",
    type: "symbol",
    source: "offers",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Noto Sans Regular"],
      "text-size": 13,
    },
    paint: {
      "text-color": "#ffffff",
    },
  };

  const offerGlowLayer: LayerProps = {
    id: "offer-glow",
    type: "circle",
    source: "offers",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "discountPercent"],
        0,
        12,
        50,
        28,
        100,
        44,
      ],
      "circle-opacity": 0.15,
      "circle-blur": 1,
    },
  };

  const offerLayer: LayerProps = {
    id: "offer-points",
    type: "circle",
    source: "offers",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "discountPercent"],
        0,
        6,
        25,
        10,
        50,
        16,
        75,
        22,
        100,
        30,
      ],
      "circle-opacity": [
        "case",
        ["==", ["get", "status"], "flagged"],
        0.4,
        0.75,
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255, 255, 255, 0.3)",
      "circle-stroke-opacity": 0.8,
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
    >
      <Layer {...offerGlowLayer} />
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...offerLayer} />
    </Source>
  );
}

export const INTERACTIVE_LAYER_IDS = ["offer-points", "clusters"];
