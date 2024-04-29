export type OverpassResponse = {
  elements: WayElement[];
  generator: string;
  osm3s: {
    copyright: string;
    timestamp_osm_base: string;
  };
  version: string;
};

type WayElement = {
  bounds: {
    maxlat: number;
    maxlon: number;
    minlat: number;
    minlon: number;
  };
  changset: number;
  geometry: {
    lat: number;
    lon: number;
  }[];
  id: number;
  nodes: number[];
  tags: { [key: string]: string };
  timestamp: string;
  type: "way";
  uid: number;
  user: string;
  version: number;
};
