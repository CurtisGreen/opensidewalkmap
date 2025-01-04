import { LngLatBounds } from "mapbox-gl";
import { FeatureCollection, MultiLineString } from "geojson";
import { OverpassResponse } from "@/types/OverpassTypes";

export const overpassQuery = async (bounds: LngLatBounds) => {
  const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

  const query = `
    [out:json][bbox:${bbox}];
    (
      way[highway=footway];
      way[highway=steps];
      way[highway=pedestrian];
      way[highway=path][foot=designated];
      way[highway=cycleway][foot=yes];
      way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential)?(_link)?$"]["sidewalk"~"^(both|left|right)?$"];
    )->.x1;
    nwr.x1->.result;
    (.result; - .done;)->.result;
    .result out meta geom qt;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    body: query,
    method: "POST",
  });
  const data = await response.json();

  return convertToGeoJSON(data);
};

const convertToGeoJSON = (data: OverpassResponse): FeatureCollection => {
  const features = data.elements
    .filter(({ type }) => type === "way")
    .map((element) => ({
      type: "Feature",
      properties: element.tags,
      geometry: {
        type: "MultiLineString",
        coordinates: [
          element.geometry.map((latLngObj) => [latLngObj.lon, latLngObj.lat]),
        ],
      } as MultiLineString,
    }));

  return {
    type: "FeatureCollection",
    features,
  } as FeatureCollection;
};
