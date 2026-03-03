import { useState, useCallback } from "react";
import MapGL, {
  type MapLayerMouseEvent,
  type ViewStateChangeEvent,
  NavigationControl,
  Marker,
} from "react-map-gl/maplibre";
import {
  getUserLocation,
  setUserLocation,
  clearUserLocation,
  requestGPSLocation,
  type UserLocation,
} from "@/lib/location";
import { BANGLADESH_CENTER, DEFAULT_ZOOM } from "@/lib/geo";
import { toast } from "@/lib/toast";

interface LocationSettingsProps {
  onClose: () => void;
  onLocationChange: (loc: UserLocation | null) => void;
}

export function LocationSettings({
  onClose,
  onLocationChange,
}: LocationSettingsProps) {
  const existing = getUserLocation();
  const [picked, setPicked] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    existing ? { latitude: existing.latitude, longitude: existing.longitude } : null,
  );
  const [label, setLabel] = useState(existing?.label ?? "");
  const [detectingGps, setDetectingGps] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: existing?.latitude ?? BANGLADESH_CENTER.latitude,
    longitude: existing?.longitude ?? BANGLADESH_CENTER.longitude,
    zoom: existing ? 14 : DEFAULT_ZOOM,
  });

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    setPicked({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
  }, []);

  const handleDetectGps = async () => {
    if (!navigator.geolocation) {
      toast("Geolocation not supported by your browser", "error");
      return;
    }
    setDetectingGps(true);
    const result = await requestGPSLocation();
    setDetectingGps(false);
    if (result) {
      setPicked(result);
      setViewState((v) => ({ ...v, ...result, zoom: 15 }));
      toast("Location detected", "success");
    } else {
      toast("Could not detect location. Try tapping the map to set it manually.", "error");
    }
  };

  const handleSave = () => {
    if (!picked) return;
    const loc: UserLocation = {
      ...picked,
      label: label.trim() || "My Location",
    };
    setUserLocation(loc);
    onLocationChange(loc);
    toast("Location saved!", "success");
    onClose();
  };

  const handleClear = () => {
    clearUserLocation();
    onLocationChange(null);
    toast("Location cleared", "info");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg mx-auto glass-strong rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up md:animate-scale-in max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/30">
          <h2 className="text-base font-semibold text-white">
            Set Your Location
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-sm text-slate-400">
            Set your location to see distances to offers. Click on the map or use GPS detection.
          </p>

          {/* GPS Button */}
          <button
            onClick={handleDetectGps}
            disabled={detectingGps}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-sm font-medium text-indigo-300 transition-colors disabled:opacity-50"
          >
            {detectingGps ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Detecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My GPS Location
              </>
            )}
          </button>

          {/* Map */}
          <div className="relative h-48 md:h-56 rounded-xl overflow-hidden border border-slate-700/30">
            <MapGL
              {...viewState}
              onMove={(e: ViewStateChangeEvent) => setViewState(e.viewState)}
              onClick={handleMapClick}
              mapStyle="https://tiles.openfreemap.org/styles/positron"
              style={{ width: "100%", height: "100%" }}
              cursor="crosshair"
              maxBounds={[88, 20, 93, 27]}
            >
              <NavigationControl position="bottom-right" showCompass={false} />
              {picked && (
                <Marker latitude={picked.latitude} longitude={picked.longitude} anchor="center">
                  <div className="w-5 h-5 bg-indigo-500 rounded-full border-[3px] border-white shadow-lg shadow-indigo-500/40" />
                </Marker>
              )}
            </MapGL>
            <div className="absolute top-2 left-2 glass rounded-lg px-2.5 py-1 text-[11px] text-slate-300">
              Click to set location
            </div>
          </div>

          {/* Label input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Location Name (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Home, Office, Gulshan"
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {picked && (
            <p className="text-xs text-slate-500">
              {picked.latitude.toFixed(5)}, {picked.longitude.toFixed(5)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-700/30 flex gap-3">
          {existing && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              Clear
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!picked}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
}
