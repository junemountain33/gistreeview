import React, { useState, useEffect, useRef } from "react";
import { apiUrl } from "../../../config/api";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import ButtonMaps from "./ButtonMaps";
import RoadModal from "./RoadModal";
// Hapus dummy data, fetch dari backend
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

interface MapLeafletProps {
  onReport?: () => void;
  onTreeClick?: (tree: TreeData, pictures: TreePicture[]) => void;
  focusCoords?: [number, number] | null;
}

const MapLeaflet: React.FC<MapLeafletProps> = ({
  onTreeClick,
  focusCoords,
}) => {
  // State untuk id jalan yang sedang di-hover
  const [hoveredRoadId, setHoveredRoadId] = useState<string | null>(null);
  // State untuk popup jalan yang terbuka
  const [openRoadPopupId, setOpenRoadPopupId] = useState<string | null>(null);
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
  return (
    <div className="flex flex-row w-full">
      <div className="relative flex-1">
        {/* ModalTree and popup removed */}
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
          <ButtonMaps
            onClick={() => {
              if (position && mapRef.current) {
                mapRef.current.setView(position, 19, { animate: true });
              }
            }}
            disabled={!position}
            title="Pergi ke Lokasi Saya"
          >
            My Location
          </ButtonMaps>
          <ButtonMaps
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
          </ButtonMaps>
        </div>
        <MapContainer
          center={markerPosition as [number, number]}
          zoom={19}
          maxZoom={22}
          style={{ height: "500px", width: "100%" }}
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
                const midIdx = Math.floor(positions.length / 2);
                const midPos: [number, number] =
                  positions.length > 0 ? positions[midIdx] : [0, 0];
                const isHovered = hoveredRoadId === road.id;
                const treeCount = treeData.filter(
                  (tree) => tree.roadId === road.id
                ).length;
                const treesOnRoad = treeData.filter(
                  (tree) => tree.roadId === road.id
                );
                const goodCount = treesOnRoad.filter(
                  (t) => t.status !== "warning" && t.status !== "danger"
                ).length;
                const warningCount = treesOnRoad.filter(
                  (t) => t.status === "warning"
                ).length;
                const dangerCount = treesOnRoad.filter(
                  (t) => t.status === "danger"
                ).length;
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
                      click: () => {
                        console.log(
                          "Polyline clicked",
                          road.id,
                          midPos,
                          road.nameroad
                        );
                        setOpenRoadPopupId(
                          openRoadPopupId === road.id ? null : road.id
                        );
                      },
                    }}
                    interactive={true}
                  >
                    {openRoadPopupId === road.id && (
                      <RoadModal
                        open={true}
                        roadName={road.nameroad}
                        roadId={road.id}
                        treeCount={treeCount}
                        goodCount={goodCount}
                        warningCount={warningCount}
                        dangerCount={dangerCount}
                        onClose={() => setOpenRoadPopupId(null)}
                      />
                    )}
                  </Polyline>
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
                      if (onTreeClick) {
                        const pictures = treePictures.filter(
                          (pic) => pic.treeId === tree.id
                        );
                        onTreeClick(tree, pictures);
                      }
                    },
                  }}
                />
              );
            })}
        </MapContainer>{" "}
      </div>
      {/* Report form handled by parent component */}
    </div>
  );
};

export default MapLeaflet;
