import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import mapboxgl, { LngLatBounds } from "mapbox-gl";
import Map, { Source, Layer, GeolocateControl, MapboxMap } from "react-map-gl";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { FeatureCollection } from "geojson";

import { lngLatBoundsToPolygon } from "@/utils/latLngBoundsToPolygon";
import { ViewportProps } from "@/types/ViewportProps";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapProps {
  sidewalkFeatureCollection: FeatureCollection;
  savedBounds: LngLatBounds | undefined;
  setBounds: (bounds: LngLatBounds) => void;
  viewport: ViewportProps;
  setViewport: (viewport: ViewportProps) => void;
}
export const MainMap = ({
  sidewalkFeatureCollection,
  savedBounds,
  setBounds,
  viewport,
  setViewport,
}: MapProps) => {
  const geocoderContainerRef = useRef<any>(null);
  const geolocateControlRef = useRef<any>(null);
  const router = useRouter();
  const [mapInstance, setMapInstance] = useState<MapboxMap>();
  const paths = ["footway", "bridleway", "steps", "corridor", "path", "via_ferrata", "cycleway"];

  useEffect(() => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      proximity: {
        longitude: center.lng,
        latitude: center.lat,
      },
    });
    geocoder.addTo(geocoderContainerRef.current);

    geocoder.on("result", (e) => {
      mapInstance.flyTo({
        center: e.result.center,
        zoom: 14,
      });
    });
  }, [mapInstance]);

  const updateURL = (latitude: number, longitude: number, zoom: number) => {
    router.replace(
      `/${latitude.toFixed(7)}/${longitude.toFixed(7)}/${zoom.toFixed(2)}`
    );
  };

  const saveLocation = (latitude: number, longitude: number, zoom: number) => {
    localStorage.setItem("latitude", latitude.toFixed(7));
    localStorage.setItem("longitude", longitude.toFixed(7));
    localStorage.setItem("zoom", zoom.toFixed(2));
  };

  return (
    <div className="map-container">
      <Map
        initialViewState={viewport}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        onMoveEnd={async (e) => {
          setBounds(e.target.getBounds());
          const latitude = e.target.getCenter().lat;
          const longitude = e.target.getCenter().lng;
          const zoom = e.target.getZoom();
          setViewport({ latitude, longitude, zoom });
          updateURL(latitude, longitude, zoom);
          saveLocation(latitude, longitude, zoom);
        }}
        onRender={(e) => setBounds(e.target.getBounds())}
        onLoad={(e) => setMapInstance(e.target)}
      >
        <div className="z-1 absolute bottom-4 left-4">
          <GeolocateControl
            ref={geolocateControlRef}
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            onGeolocate={(pos: GeolocationPosition) => {
              setViewport({
                ...viewport,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            }}
          />
        </div>
        <div ref={geocoderContainerRef} className="z-1 fixed top-2 right-12" />
        <Source type="geojson" data={sidewalkFeatureCollection}>
          <Layer
            id="Paths"
            type="line"
            filter={[
              "match",
                ["get", "highway"],
                paths,
                true,
                false
              ]} // Filter for true paths
            paint={{
              "line-color": "red",
              "line-opacity": 0.8,
              "line-width": 3,
            }}
          />
          <Layer
            id="Roads"
            type="line"
            filter={
            ["match",
                ["get", "highway"],
                paths,
                false,
                true
            ]} // Filter for non-paths (roads)
            paint={{
              "line-color": "red",
              "line-opacity": 0.8,
              "line-width": 2,
              "line-dasharray": [1, 1 ],
            }}
          />
        </Source>
        {savedBounds && (
          <Source
            id="bounds-polygon"
            type="geojson"
            data={lngLatBoundsToPolygon(savedBounds)}
          >
            <Layer
              id="bounds-polygon-layer"
              type="line"
              paint={{
                "line-color": "blue",
                "line-width": 2,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};
