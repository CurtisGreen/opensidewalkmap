import { LngLatBounds } from "mapbox-gl";
import { FeatureCollection, Position, Feature, Geometry } from "geojson";

export const overpassQuery = async (
  bounds: LngLatBounds,
  restrictParkingTags: { key: string; tag: string }[]
) => {
  const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;

  // const test = `
  //   [out:json];
  //   (
  //     way[highway=footway]({{bbox}});
  //     way[highway=path][foot=designated]({{bbox}});
  //   );
  //   out body;
  //   >;
  //   out skel qt;
  // `;

  const query = `
    [out:json][bbox:${bbox}];
    (
      way[highway=footway];
      way[highway=path][foot=designated];    
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

const convertToGeoJSON = (data: any): FeatureCollection => {
  const geojson: FeatureCollection = {
    type: "FeatureCollection",
    features: data.elements.map((element: any): Feature => {
      let geometry: Geometry;

      if (element.type === "way") {
        // Single polygon
        geometry = {
          type: "MultiLineString",
          coordinates: [
            element.geometry.map(
              (latLngObj: any) => [latLngObj.lon, latLngObj.lat] as Position
            ),
          ],
        };
      } else {
        // Default or other geometry types
        geometry = {
          type: "GeometryCollection",
          geometries: [],
        };
      }

      return {
        type: "Feature",
        geometry: geometry,
        properties: element.tags,
      };
    }),
  };

  return geojson;
};
