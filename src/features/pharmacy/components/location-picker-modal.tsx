"use client";

import { useEffect, useRef, useState } from "react";

type Coordinates = { latitude: string; longitude: string };

type LocationPickerModalProps = {
  open: boolean;
  initialCoordinates: Coordinates | null;
  onClose: () => void;
  onSubmit: (coordinates: Coordinates) => void;
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
let googleMapsLoader: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps can only load in a browser."));
  if (window.google?.maps) return Promise.resolve();
  if (googleMapsLoader) return googleMapsLoader;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error("Google Maps API key is not configured."));

  googleMapsLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Google Maps could not be loaded.")));
      return;
    }

    const script = document.createElement("script");
    script.dataset.googleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps could not be loaded. Check the API key and enabled APIs."));
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

function parseCoordinates(coordinates: Coordinates | null) {
  if (!coordinates) return null;
  const lat = Number(coordinates.latitude);
  const lng = Number(coordinates.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export function LocationPickerModal({ open, initialCoordinates, onClose, onSubmit }: LocationPickerModalProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchElement = useRef<HTMLInputElement>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setCoordinates(initialCoordinates);
  }, [open, initialCoordinates]);

  function updateCoordinates(lat: number, lng: number) {
    setCoordinates({ latitude: lat.toFixed(7), longitude: lng.toFixed(7) });
  }

  function moveMarker(position: { lat: number; lng: number }) {
    markerRef.current?.setPosition(position);
    mapRef.current?.panTo(position);
    updateCoordinates(position.lat, position.lng);
  }

  useEffect(() => {
    if (!open || !mapElement.current) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapElement.current || !window.google?.maps) return;
        const selected = parseCoordinates(initialCoordinates);
        const center = selected ?? DEFAULT_CENTER;
        const googleApi = window.google;
        const map = new googleApi.maps.Map(mapElement.current, {
          center,
          zoom: selected ? 16 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        const marker = new googleApi.maps.Marker({
          map,
          position: center,
          draggable: true,
          title: "Pharmacy location",
        });
        mapRef.current = map;
        markerRef.current = marker;
        map.addListener("click", (event: { latLng?: { lat: () => number; lng: () => number } }) => {
          if (!event.latLng) return;
          moveMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });
        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (position) moveMarker({ lat: position.lat(), lng: position.lng() });
        });

        if (searchElement.current && googleApi.maps.places?.Autocomplete) {
          const autocomplete = new googleApi.maps.places.Autocomplete(searchElement.current, { fields: ["geometry", "formatted_address"] });
          autocomplete.bindTo("bounds", map);
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const location = place.geometry?.location;
            if (!location) return;
            moveMarker({ lat: location.lat(), lng: location.lng() });
            map.setZoom(17);
          });
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Google Maps could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, initialCoordinates]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location services are not available in this browser.");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        moveMarker({ lat: position.coords.latitude, lng: position.coords.longitude });
        mapRef.current?.setZoom(17);
        setLoading(false);
      },
      (locationError) => {
        setLoading(false);
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? "Location permission denied. Allow it in browser settings and try again."
          : "Current location could not be found. Try again or click the map manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="location-picker-title" className="location-picker-backdrop fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="location-picker-panel w-full max-w-[720px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0758a6] px-5 py-3 text-white">
          <h2 id="location-picker-title" className="text-base font-semibold">Drag the 📍 to choose the precise location</h2>
          <button type="button" aria-label="Close location picker" onClick={onClose} className="px-2 text-2xl leading-none hover:text-cyan-200">×</button>
        </div>
        <div className="relative bg-[#c5eee9] p-3">
          <input ref={searchElement} aria-label="Search street, area, or landmark" placeholder="Search street, area, landmark" className="absolute left-1/2 top-5 z-10 h-11 w-[min(82%,400px)] -translate-x-1/2 rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-800 shadow-lg outline-none focus:ring-2 focus:ring-[#079ff0]" />
          <div ref={mapElement} className="h-[min(58vh,430px)] min-h-[300px] w-full rounded-md bg-[#c5eee9]" />
          {loading && <div className="absolute inset-0 grid place-items-center bg-white/35 text-sm font-semibold text-[#0758a6]">Loading map…</div>}
          {error && <div role="alert" className="absolute bottom-5 left-1/2 w-[min(90%,520px)] -translate-x-1/2 rounded-md bg-orange-500 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">{error}</div>}
          <button type="button" onClick={useCurrentLocation} className="absolute bottom-5 right-5 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#0758a6] shadow-lg hover:bg-slate-50">⌖ Current location</button>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600" aria-live="polite">
            {coordinates ? <><span className="font-semibold text-slate-800">Selected:</span> {coordinates.latitude}, {coordinates.longitude}</> : "Click the map or use current location."}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={!coordinates || loading} onClick={() => coordinates && onSubmit(coordinates)} className="rounded bg-[#079ff0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0788cf] disabled:cursor-not-allowed disabled:opacity-50">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window { google?: any; }
}
