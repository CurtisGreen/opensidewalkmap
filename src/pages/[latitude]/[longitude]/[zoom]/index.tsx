import React, { Component, useEffect, useState } from "react";
import { LngLatBounds } from "mapbox-gl";
import { FeatureCollection } from "geojson";

import { Window } from "@/components/Window";
import { defaultViewport } from "@/config/defaults";
import { MainMap } from "@/components/MainMap";
import { validateViewport } from "@/utils/validateViewport";
import { useRouter } from "next/router";

/**
 * MainPage renders the map from the URL parameters
 * 
 * Child Components:
 * - {@link Window}
 * - {@link MainMap}
 * 
 * @returns The MainPage component
 * @group Pages
 */
export const MainPage = () => {
  const [bounds, setBounds] = useState<LngLatBounds>();
  const [savedBounds, setSavedBounds] = useState<LngLatBounds>();
  const [featureCollection, setFeatureCollection] = useState({
    type: "FeatureCollection",
    features: [],
  } as FeatureCollection);
  const [viewport, setViewport] = useState(defaultViewport);
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const { latitude, longitude, zoom } = router.query;

  // Init map location from URL
  useEffect(() => {
    if (initialized) return;

    const isValidViewport = validateViewport(latitude, longitude, zoom);
    if (!isValidViewport) return;

    setViewport({
      latitude: Number(latitude),
      longitude: Number(longitude),
      zoom: Number(zoom),
    });
    setInitialized(true);
  }, [initialized, latitude, longitude, setViewport, zoom]);

  return (
    <div className="map-page">
      <Window
        bounds={bounds}
        setSavedBounds={setSavedBounds}
        featureCollection={featureCollection}
        setFeatureCollection={setFeatureCollection}
        viewport={viewport}
      />
      {initialized && (
        <MainMap
          sidewalkFeatureCollection={featureCollection}
          savedBounds={savedBounds}
          setBounds={setBounds}
          viewport={viewport}
          setViewport={setViewport}
        />
      )}
    </div>
  );
};

export default MainPage;
