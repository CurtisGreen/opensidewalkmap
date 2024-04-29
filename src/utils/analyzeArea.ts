import { area } from "@turf/turf";
import { LngLatBounds } from "mapbox-gl";
import { FeatureCollection } from "geojson";
import { lngLatBoundsToPolygon } from "./latLngBoundsToPolygon";

const m2ToAcres = (m2: number) => m2 * 0.000247105;

export const analyzeArea = ({
  featureCollection,
  bounds,
}: {
  featureCollection: FeatureCollection;
  bounds: LngLatBounds;
}) => {
  // Get total area of geometries
  let totalArea = 0;
  featureCollection.features.forEach((feature) => {
    totalArea += area(feature);
  });
  totalArea = m2ToAcres(totalArea);

  const boundPolygon = lngLatBoundsToPolygon(bounds);
  const boundArea = m2ToAcres(area(boundPolygon));

  return { totalArea, boundArea };
};
