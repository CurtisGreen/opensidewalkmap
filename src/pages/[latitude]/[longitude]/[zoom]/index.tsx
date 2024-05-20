import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { LngLatBounds } from "mapbox-gl";
import { FeatureCollection } from "geojson";
import { MapRef } from "react-map-gl";

import { Window } from "@/components/Window";
import { validateViewport } from "@/utils/validateViewport";
import { defaultViewport } from "@/config/defaults";
import { MainMap } from "@/components/MainMap";

export const MainPage = () => {
  const [bounds, setBounds] = useState<LngLatBounds>();
  const [savedBounds, setSavedBounds] = useState<LngLatBounds>();
  const [featureCollection, setFeatureCollection] = useState({
    type: "FeatureCollection",
    features: [],
  } as FeatureCollection);
  const [viewport, setViewport] = useState(defaultViewport);
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();

  // Init map location from URL
  useEffect(() => {
    const { latitude, longitude, zoom } = router.query;

    const isValidViewport = validateViewport(latitude, longitude, zoom);
    if (!isValidViewport || !mapRef.current) return;

    const lat = Number(latitude);
    const lon = Number(longitude);
    const z = Number(zoom);

    const map = mapRef.current.getMap();
    const mapCenter = map.getCenter();
    const latChanged = lat.toFixed(2) != mapCenter.lat.toFixed(2);
    const lonChanged = lon.toFixed(2) != mapCenter.lng.toFixed(2);
    const zoomChanged = z.toFixed(2) != map.getZoom().toFixed(2);

    // Prevent
    if (latChanged || lonChanged || zoomChanged) {
      map.jumpTo({
        center: [lon, lat],
        zoom: z,
      });
    }
  }, [router.query]);

  return (
    <div className="map-page">
      <Window
        bounds={bounds}
        setSavedBounds={setSavedBounds}
        featureCollection={featureCollection}
        setFeatureCollection={setFeatureCollection}
        viewport={viewport}
      />
      <MainMap
        sidewalkFeatureCollection={featureCollection}
        savedBounds={savedBounds}
        setBounds={setBounds}
        viewport={viewport}
        setViewport={setViewport}
        mapRef={mapRef}
      />
    </div>
  );
};

export default MainPage;
