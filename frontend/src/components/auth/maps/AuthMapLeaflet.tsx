import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import AuthButtonMaps from "./AuthButtonMaps";
import { apiUrl } from "../../../config/api";

// Tipe data pohon dan gambar
interface TreeData {
  id: string;
  latitude: number;
  longitude: number;
  species: string;
  age: number;
  trunk_diameter: number;
  lbranch_width: number;
  ownership: string;
  street_name: string;
  description: string;
  status: string;
  timestamp: string;
  roadId?: string;
}

interface TreePicture {
  id: string;
  url: string;
  treeId: string;
  uploaded: string;
}

const AMBON_CENTER = [-3.6978, 128.1814];

interface AuthMapLeafletProps {
  onReport?: () => void;
  onTreeClick?: (tree: TreeData, pictures: TreePicture[]) => void;
  focusCoords?: [number, number] | null;
}

const AuthMapLeaflet: React.FC<AuthMapLeafletProps> = ({
  onTreeClick,
  focusCoords,
}) => {
  // State untuk id jalan yang sedang di-hover
  const [hoveredRoadId, setHoveredRoadId] = useState<string | null>(null);
  // State untuk pohon yang dipilih
  const [selectedTree, setSelectedTree] = useState<{
    tree: TreeData;
    pictures: TreePicture[];
  } | null>(null);
  // State untuk jalan yang dipilih
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  // State untuk animasi
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  // Jika focusCoords berubah, arahkan map ke koordinat tersebut
  useEffect(() => {
    if (focusCoords && mapRef.current) {
      mapRef.current.setView(focusCoords, 19, { animate: true });
    }
  }, [focusCoords]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setPosition(null);
        }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // State pohon, gambar, dan jalan dari backend
  const [treeData, setTreeData] = useState<TreeData[]>([]);
  const [treePictures, setTreePictures] = useState<TreePicture[]>([]);
  interface Road {
    id: string;
    nameroad?: string;
    geometry: { coordinates: number[][] };
  }
  const [roadData, setRoadData] = useState<Road[]>([]);

  // Counts for selected road (computed in render)
  const treesOnSelectedRoad = selectedRoad
    ? treeData.filter((tree) => tree.roadId === selectedRoad.id)
    : [];
  const totalTreesOnSelectedRoad = treesOnSelectedRoad.length;
  const goodTreesOnSelectedRoad = treesOnSelectedRoad.filter(
    (t) => t.status !== "warning" && t.status !== "danger"
  ).length;
  const warningTreesOnSelectedRoad = treesOnSelectedRoad.filter(
    (t) => t.status === "warning"
  ).length;
  const dangerTreesOnSelectedRoad = treesOnSelectedRoad.filter(
    (t) => t.status === "danger"
  ).length;

  useEffect(() => {
    fetch(apiUrl("/api/trees"))
      .then((res) => res.json())
      .then((data) => setTreeData(data));
    fetch(apiUrl("/api/treepictures"))
      .then((res) => res.json())
      .then((data) => setTreePictures(data));
    fetch(apiUrl("/api/roads"))
      .then((res) => res.json())
      .then((data) => setRoadData(data));
  }, []);

  const markerPosition = position || AMBON_CENTER;

  // Helper to derive a displayable location for a tree
  const getTreeLocation = (tree: TreeData) => {
    // Prefer explicit street_name provided by the tree record
    if (tree.street_name && tree.street_name.trim() !== "")
      return tree.street_name;

    // If tree has a road relation, try to find the road and use its name
    if (tree.roadId) {
      const rid = tree.roadId;
      const road = roadData.find((r) => r.id === rid);
      if (road) return road.nameroad || "(Tanpa Nama)";
    }

    // Fallback to lat/lng if available
    if (
      typeof tree.latitude === "number" &&
      typeof tree.longitude === "number"
    ) {
      return `${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}`;
    }

    return "No location available";
  };

  // Handle tree click
  const handleTreeClick = (tree: TreeData, pictures: TreePicture[]) => {
    setSelectedTree({ tree, pictures });
    setSelectedRoad(null);
    setIsMapCollapsed(true);
    if (onTreeClick) {
      onTreeClick(tree, pictures);
    }
  };

  // Handle road click
  const handleRoadClick = (road: Road) => {
    setSelectedRoad(road);
    setSelectedTree(null);
    setIsMapCollapsed(true);
  };

  // Handle close detail
  const handleCloseDetail = () => {
    setSelectedTree(null);
    setSelectedRoad(null);
    setIsMapCollapsed(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white/5 backdrop-blur-sm">
      <div
        className={`relative transition-all duration-500 ease-in-out ${
          isMapCollapsed ? "h-[68%]" : "h-full"
        }`}
      >
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <AuthButtonMaps
            onClick={() => {
              if (position && mapRef.current) {
                mapRef.current.setView(position, 19, { animate: true });
              }
            }}
            disabled={!position}
            title="Pergi ke Lokasi Saya"
          >
            My Location
          </AuthButtonMaps>
          <AuthButtonMaps
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(AMBON_CENTER as [number, number], 15, {
                  animate: true,
                });
              }
            }}
            title="Pergi ke Kota Ambon"
          >
            Kota Ambon
          </AuthButtonMaps>
        </div>
        <MapContainer
          center={markerPosition as [number, number]}
          zoom={19}
          maxZoom={22}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}
          />
          <Marker
            position={markerPosition as [number, number]}
            eventHandlers={{}}
          />
          {/* Polyline jalan dari database */}
          {roadData &&
            Array.isArray(roadData) &&
            roadData.map((road) => {
              if (
                road.geometry &&
                Array.isArray(road.geometry.coordinates) &&
                road.geometry.coordinates.length > 0
              ) {
                const positions: [number, number][] = road.geometry.coordinates
                  .filter(
                    (coord: number[]) =>
                      Array.isArray(coord) &&
                      coord.length === 2 &&
                      typeof coord[0] === "number" &&
                      typeof coord[1] === "number"
                  )
                  .map(
                    (coord: number[]) =>
                      [coord[1], coord[0]] as [number, number]
                  );
                const isHovered = hoveredRoadId === road.id;
                return (
                  <Polyline
                    key={road.id}
                    positions={positions}
                    pathOptions={{
                      color: isHovered ? "#3200a78e" : "#6c3bf15e",
                      weight: 14,
                    }}
                    eventHandlers={{
                      mouseover: () => setHoveredRoadId(road.id),
                      mouseout: () => setHoveredRoadId(null),
                      click: () => handleRoadClick(road),
                    }}
                    interactive={true}
                  ></Polyline>
                );
              }
              return null;
            })}
          {/* Marker pohon dari database */}
          {treeData &&
            Array.isArray(treeData) &&
            treeData.map((tree) => {
              let color = "#2ecc40";
              if (tree.status === "warning") color = "#f1c40f";
              if (tree.status === "danger") color = "#e74c3c";
              const svg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 512 512'>
        <g><path fill='${color}' d='M465.771,234.587c0-26.914-10.749-51.289-28.142-69.166c0.629-4.688,1.075-9.437,1.075-14.301c0-54.151-40.625-98.726-93.05-105.14C319.308,17.754,281.874,0,240.206,0C160.476,0,95.853,64.624,95.853,144.361c0,0.422,0.062,0.821,0.062,1.236c-29.975,20.27-49.686,54.58-49.686,93.494c0,53.346,37.08,97.937,86.842,109.667c10.089,24.69,34.318,42.106,62.636,42.106c10.557,0,20.508-2.486,29.407-6.798V512h77.528v-83.988l30.236-51.657c30.95-2.256,57.097-21.766,68.743-49.033C439.087,313.128,465.771,277.022,465.771,234.587z M260.615,342.229c0.66,0.928,1.343,1.826,2.041,2.724l-3.43,1.396C259.725,344.984,260.208,343.625,260.615,342.229z M284.874,405.402v-40.579c7.181,4.366,15.076,7.642,23.492,9.622L284.874,405.402z'/></g>
      </svg>
    `);
              const treeIcon = L.icon({
                iconUrl: `data:image/svg+xml;charset=UTF-8,${svg}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                className: "tree-marker-icon",
              });
              return (
                <Marker
                  key={tree.id}
                  position={[tree.latitude, tree.longitude]}
                  icon={treeIcon}
                  eventHandlers={{
                    click: () => {
                      const pictures = treePictures.filter(
                        (pic) => pic.treeId === tree.id
                      );
                      handleTreeClick(tree, pictures);
                    },
                  }}
                />
              );
            })}
        </MapContainer>
      </div>

      {/* Detail Panel */}
      <div
        className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-500 ease-in-out overflow-hidden ${
          isMapCollapsed ? "h-[32%]" : "h-0"
        }`}
      >
        {(selectedTree || selectedRoad) && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    selectedTree
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-blue-100 dark:bg-blue-900"
                  }`}
                >
                  {selectedTree ? (
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                      <path
                        fillRule="evenodd"
                        d="M10 4a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V5a1 1 0 011-1z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 4h6v2H9V4zm4 14h-2v-2h2v2zm2-4h-6v2h6v-2zm0-4h-6v2h6v-2zm0-4h-6v2h6V6zM4 4h2v16H4V4zm14 0h2v16h-2V4z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedTree ? "Tree Details" : "Road Details"}
                </h3>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 px-4">
              {selectedTree ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Species
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white">
                      {selectedTree.tree.species}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Age
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white">
                      {selectedTree.tree.age} years
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedTree.tree.status === "danger"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : selectedTree.tree.status === "warning"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {selectedTree.tree.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Location
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white">
                      {getTreeLocation(selectedTree.tree)}
                    </div>
                  </div>
                  {selectedTree.pictures.length > 0 && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Photos
                      </label>
                      <div className="flex gap-2 overflow-x-auto">
                        {selectedTree.pictures.map((pic) => {
                          console.log("Picture URL:", pic.url); // For debugging
                          const imageUrl = apiUrl(`/uploads/tree/${pic.url}`);
                          return (
                            <img
                              key={pic.id}
                              src={imageUrl}
                              alt="Tree"
                              className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/tree-default.jpg";
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                selectedRoad && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                        Road Name
                      </label>
                      <div className="mt-1 text-gray-900 dark:text-white text-lg font-semibold">
                        {selectedRoad.nameroad || "(Tanpa Nama)"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                        Tree Count
                      </label>
                      <div className="mt-1 text-gray-900 dark:text-white">
                        {totalTreesOnSelectedRoad} trees
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                            Good: {goodTreesOnSelectedRoad}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                            Warning: {warningTreesOnSelectedRoad}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                            Danger: {dangerTreesOnSelectedRoad}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Tree Photos
                      </label>
                      <div className="flex gap-2 overflow-x-auto">
                        {treeData
                          .filter((tree) => tree.roadId === selectedRoad.id)
                          .map((tree) => {
                            const treePics = treePictures.filter(
                              (pic) => pic.treeId === tree.id
                            );
                            return treePics.map((pic) => {
                              console.log("Road Tree Picture URL:", pic.url); // For debugging
                              const imageUrl = apiUrl(`/uploads/tree/${pic.url}`);
                              return (
                                <img
                                  key={pic.id}
                                  src={imageUrl}
                                  alt={`Tree ${tree.species}`}
                                  className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                              );
                            });
                          })}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthMapLeaflet;
