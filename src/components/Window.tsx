import { useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { LngLatBounds } from "mapbox-gl";
import { FeatureCollection } from "geojson";

import { analyzeArea } from "@/utils/analyzeArea";
import { overpassQuery } from "@/overpass/overpass";
import InfoModal from "./InfoModal";
import ZoomModal from "./ZoomModal";
import { ViewportProps } from "@/types/ViewportProps";
import LoadingOverlay from "./LoadingOverlay";

interface SearchProps {
  bounds?: LngLatBounds;
  featureCollection: FeatureCollection;
  setFeatureCollection: (fc: FeatureCollection) => void;
  setSavedBounds: (savedBounds: LngLatBounds) => void;
  viewport: ViewportProps;
}
export const Window = ({
  bounds,
  featureCollection,
  setFeatureCollection,
  setSavedBounds,
  viewport,
}: SearchProps) => {
  const [error, setError] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [windowBoundArea, setWindowBoundArea] = useState(0);

  const handleSearch = async () => {
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
      const geoJSON = await overpassQuery(bounds);
      setFeatureCollection(geoJSON);
      setLoading(false);

      const { totalArea: calculatedArea, boundArea } = analyzeArea({
        featureCollection: geoJSON,
        bounds,
      });
      setCalculatedArea(calculatedArea);
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
    <>
      {loading && <LoadingOverlay />}
      <div className="fixed left-0 py-1 px-1 z-10 bottom-0 md:top-0">
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md w-80">
          <h2 className="text-2xl font-semibold mb-4 text-blue-500">
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "0.5rem" }}>OpenSidewalkMap</span>
              <div
                onClick={() => setShowInfoModal(true)}
                className="cursor-pointer"
              >
                <InformationCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </h2>

          {loading ? (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">
              loading...
            </div>
          ) : (
            <>
              <div
                className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                onClick={handleSearch}
              >
                Show Sidewalks
              </div>
            </>
          )}

          {calculatedArea > 0 && (
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-blue-500 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                    <span>Details</span>
                    <ChevronDownIcon
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5 text-blue-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                    <b>At-Grade Parking:</b> {calculatedArea.toFixed(1)} ac
                    <br />
                    <b>Area in Window:</b> {windowBoundArea.toFixed(1)} ac
                    <br />
                    <b>% of window: </b>
                    {((calculatedArea / windowBoundArea) * 100).toFixed(1)} %
                    <br />
                    <br />
                    <Disclosure.Button
                      className="flex justify-between px-4 py-2 text-sm font-medium text-left text-blue-500 bg-gray-100 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
                      onClick={downloadData}
                    >
                      Download GeoJSON
                    </Disclosure.Button>
                    <br />
                    <div className="max-w-sm w-44 text-xs italic">
                      {`Data is pulled from OpenStreetMap. `}
                      <a
                        onClick={() => setShowInfoModal(true)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Details here.
                      </a>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          )}
          {error && (
            <div className="text-red-500">
              Error loading data. Please try again.
            </div>
          )}
        </div>
      </div>

      {showZoomModal && (
        <ZoomModal
          showZoomModal={showZoomModal}
          setShowZoomModal={setShowZoomModal}
        />
      )}
      {showInfoModal && (
        <InfoModal
          showInfoModal={showInfoModal}
          setShowInfoModal={setShowInfoModal}
        />
      )}
    </>
  );
};
