import type { GeoJSONSource } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  GeolocateControl,
  type MapLayerMouseEvent,
  type MapRef,
  Marker,
  NavigationControl,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { BANGLADESH_CENTER, DEFAULT_ZOOM } from "@/lib/geo";
import type { UserLocation } from "@/lib/location";
import type { Offer } from "@/types/offer";
import { INTERACTIVE_LAYER_IDS, OfferBubbles } from "./OfferBubbles";
import { OfferPopup } from "./OfferPopup";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface OfferMapProps {
  offers: Offer[];
  onMapClick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  userLocation?: UserLocation | null;
  selectedOffer?: Offer | null;
  onSelectOffer?: (offer: Offer | null) => void;
  onBookmarkChange?: () => void;
  onGeolocate?: (coords: { latitude: number; longitude: number }) => void;
}

export function OfferMap({
  offers,
  onMapClick,
  pickMode,
  pickedLocation,
  userLocation,
  selectedOffer: controlledSelected,
  onSelectOffer,
  onBookmarkChange,
  onGeolocate,
}: OfferMapProps) {
  const mapRef = useRef<MapRef>(null);
  const center = userLocation ?? BANGLADESH_CENTER;
  const [viewState, setViewState] = useState<ViewState>({
    latitude: center.latitude,
    longitude: center.longitude,
    zoom: userLocation ? 13 : DEFAULT_ZOOM,
  });
  const [internalSelected, setInternalSelected] = useState<Offer | null>(null);

  const selectedOffer = controlledSelected !== undefined ? controlledSelected : internalSelected;
  const setSelectedOffer = onSelectOffer ?? setInternalSelected;

  const offerLookup = useMemo(() => {
    const lookup: Record<string, Offer> = {};
    for (const offer of offers) {
      lookup[offer._id] = offer;
    }
    return lookup;
  }, [offers]);

  // Fly to user location when it changes (auto-detect or manual set)
  const prevLocationKey = useRef(userLocation ? `${userLocation.latitude},${userLocation.longitude}` : null);
  useEffect(() => {
    const key = userLocation ? `${userLocation.latitude},${userLocation.longitude}` : null;
    if (key && key !== prevLocationKey.current && mapRef.current) {
      prevLocationKey.current = key;
      mapRef.current.flyTo({
        center: [userLocation!.longitude, userLocation!.latitude],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [userLocation]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (pickMode && onMapClick) {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
        return;
      }

      const feature = e.features?.[0];

      // Cluster click → zoom in
      if (feature && feature.properties?.cluster_id != null) {
        const source = mapRef.current?.getSource("offers") as GeoJSONSource | undefined;
        if (source) {
          source.getClusterExpansionZoom(feature.properties.cluster_id).then((zoom) => {
            mapRef.current?.easeTo({
              center: [e.lngLat.lng, e.lngLat.lat],
              zoom,
              duration: 500,
            });
          });
        }
        return;
      }

      // Offer point click
      if (feature?.properties?.id) {
        const offer = offerLookup[feature.properties.id as string];
        if (offer) {
          setSelectedOffer(offer);
          return;
        }
      }

      setSelectedOffer(null);
    },
    [pickMode, onMapClick, offerLookup, setSelectedOffer],
  );

  return (
    <div className="absolute inset-0">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onClick={handleClick}
        interactiveLayerIds={pickMode ? undefined : INTERACTIVE_LAYER_IDS}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        cursor={pickMode ? "crosshair" : "grab"}
        maxBounds={[88, 20, 93, 27]}
        minZoom={7}
        maxZoom={18}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl
          position="bottom-right"
          onGeolocate={
            onGeolocate ? (e) => onGeolocate({ latitude: e.coords.latitude, longitude: e.coords.longitude }) : undefined
          }
        />

        <OfferBubbles offers={offers} />

        {/* User location marker */}
        {userLocation && !pickMode && (
          <Marker latitude={userLocation.latitude} longitude={userLocation.longitude} anchor="center">
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-[2.5px] border-white shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-30" />
            </div>
          </Marker>
        )}

        {selectedOffer && !pickMode && (
          <OfferPopup
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onBookmarkChange={onBookmarkChange}
          />
        )}

        {pickMode && pickedLocation && (
          <Marker latitude={pickedLocation.lat} longitude={pickedLocation.lng} anchor="bottom">
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="w-7 h-7 bg-indigo-500 rounded-full border-[3px] border-white shadow-lg shadow-indigo-500/40 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
                </svg>
              </div>
              <div className="w-0.5 h-3 bg-indigo-500/60" />
            </div>
          </Marker>
        )}
      </MapGL>

      {pickMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="glass rounded-2xl px-4 py-2 text-sm font-medium text-white shadow-xl">
            Tap on the map to set location
          </div>
        </div>
      )}
    </div>
  );
}
