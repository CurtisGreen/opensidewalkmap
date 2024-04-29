import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { LngLatBounds } from "mapbox-gl";
import { overpassQuery } from "@/overpass/overpass";
import { FeatureCollection } from "geojson";
import { Window } from "@/components/Window";
import { analyzeArea } from "@/utils/analyzeArea";
import { validateViewport } from "@/utils/validateViewport";
import { defaultViewport } from "@/config/defaults";
import { MainMap } from "@/components/MainMap";

export const MainPage = () => {
  const [bounds, setBounds] = useState<LngLatBounds>();
  const [savedBounds, setSavedBounds] = useState<LngLatBounds>();
  const [loading, setLoading] = useState(false);
  const [featureCollection, setFeatureCollection] = useState({
    type: "FeatureCollection",
    features: [],
  } as FeatureCollection);
  const [totalArea, setTotalArea] = useState(0);
  const [windowBoundArea, setWindowBoundArea] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewport, setViewport] = useState(defaultViewport);
  const [error, setError] = useState(false);

  const mapRef = useRef<any>(null);

  const router = useRouter();
  const { latitude, longitude, zoom } = router.query;

  useEffect(() => {
    const isValidViewport = validateViewport(latitude, longitude, zoom);

    if (isValidViewport && mapRef.current) {
      const map = mapRef.current.getMap();
      map.jumpTo({
        center: [Number(longitude), Number(latitude)],
        zoom: Number(zoom),
      });
      setViewport({
        latitude: Number(latitude),
        longitude: Number(longitude),
        zoom: Number(zoom),
      });
    }
  }, [latitude, longitude, zoom]);

  const handleParkingSearch = async (
    restrictTags: { key: string; tag: string }[]
  ) => {
    if (viewport.zoom < 13) {
      setShowZoomModal(true);
      return;
    }

    if (!bounds) {
      return;
    }

    setLoading(true);
    setSavedBounds(bounds);

    try {
      const geoJSON = await overpassQuery(bounds, restrictTags);
      setFeatureCollection(geoJSON);
      setLoading(false);

      const { totalArea: calculatedArea, boundArea } = analyzeArea({
        featureCollection: geoJSON,
        bounds,
      });
      setTotalArea(calculatedArea);
      setWindowBoundArea(boundArea);
      setError(false);
    } catch (e) {
      setLoading(false);
      setError(true);
    }
  };

  const downloadData = () => {
    const geometry = JSON.stringify(featureCollection);
    const geometryBlob = new Blob([geometry], {
      type: "application/json",
    });
    const geometryUrl = URL.createObjectURL(geometryBlob);
    const link = document.createElement("a");
    link.href = geometryUrl;
    link.download = "sidewalkData.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="map-page">
      <Window
        handleParkingSearch={handleParkingSearch}
        loading={loading}
        parkingArea={totalArea}
        windowBoundArea={windowBoundArea}
        setShowInfoModal={setShowInfoModal}
        error={error}
        downloadData={downloadData}
      />
      <MainMap
        showZoomModal={showZoomModal}
        setShowZoomModal={setShowZoomModal}
        showInfoModal={showInfoModal}
        setShowInfoModal={setShowInfoModal}
        loading={loading}
        parkingLots={featureCollection}
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
