import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { PinMarkMap } from "../../icons";
import { renderToStaticMarkup } from "react-dom/server";

interface Road {
  id: string;
  nameroad?: string;
  geometry: { coordinates: number[][] };
}

interface TreeModalMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRoadSelect?: (roadId: string) => void;
  roads: Road[];
}

// Create custom icon using PinMarkMap
const customIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative">
      <PinMarkMap className="w-8 h-8 text-red-500 -translate-x-1/2 -translate-y-full" />
    </div>
  ),
  className: "custom-marker",
});

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({
  latitude,
  longitude,
  onLocationChange,
}: LocationMarkerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition(L.latLng(latitude, longitude));
    }
  }, [latitude, longitude]);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

export default function TreeModalMap({
  latitude,
  longitude,
  onLocationChange,
  onRoadSelect,
  roads,
}: TreeModalMapProps) {
  const center = { lat: -3.7, lng: 128.17 }; // Default center Ambon
  const zoom = 13;
  const [hoveredRoadId, setHoveredRoadId] = useState<string | null>(null);

  // Move ~1 meter per press. We'll convert meters -> degrees dynamically using current latitude.
  const metersPerLatDegree = 111320; // approximate meters per degree latitude

  const moveByMeters = (northMeters: number, eastMeters: number) => {
    const baseLat = latitude ?? center.lat;
    const baseLng = longitude ?? center.lng;

    const latDeg = northMeters / metersPerLatDegree;
    const latRad = (baseLat * Math.PI) / 180;
    const metersPerLonDegree = metersPerLatDegree * Math.cos(latRad) || 1e-12;
    const lonDeg = eastMeters / metersPerLonDegree;

    const newLat = baseLat + latDeg;
    const newLng = baseLng + lonDeg;
    onLocationChange(newLat, newLng);
  };

  return (
    <div className="relative">
      <MapContainer
        center={[latitude || center.lat, longitude || center.lng]}
        zoom={zoom}
        maxZoom={22}
        scrollWheelZoom
        className="w-full h-[300px] rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {roads &&
          roads.map((road) => {
            if (road.geometry && Array.isArray(road.geometry.coordinates)) {
              const positions: [number, number][] = road.geometry.coordinates
                .filter((coord) => Array.isArray(coord) && coord.length === 2)
                .map((coord) => [coord[1], coord[0]] as [number, number]);

              const isHovered = hoveredRoadId === road.id;

              return (
                <Polyline
                  key={road.id}
                  positions={positions}
                  pathOptions={{
                    color: isHovered ? "#1a00ac96" : "#66dbff4f",
                    weight: 10,
                  }}
                  eventHandlers={{
                    mouseover: () => setHoveredRoadId(road.id),
                    mouseout: () => setHoveredRoadId(null),
                    click: () => {
                      if (onRoadSelect) {
                        onRoadSelect(road.id);
                      }
                    },
                  }}
                  interactive={true}
                />
              );
            }
            return null;
          })}
        <LocationMarker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onLocationChange}
        />
      </MapContainer>

      {/* Directional controls (bottom-left) */}
      <div className="absolute left-3 bottom-3 z-20">
        <div className="flex flex-col items-center bg-white/80 p-2 rounded-md shadow-lg">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center mb-1 bg-white rounded border"
            title="Move up"
            onClick={() => moveByMeters(1, 0)}
          >
            ↑
          </button>

          <div className="flex items-center">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center mr-1 bg-white rounded border"
              title="Move left"
              onClick={() => moveByMeters(0, -1)}
            >
              ←
            </button>

            <div className="w-8 h-8" />

            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center ml-1 bg-white rounded border"
              title="Move right"
              onClick={() => moveByMeters(0, 1)}
            >
              →
            </button>
          </div>

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center mt-1 bg-white rounded border"
            title="Move down"
            onClick={() => moveByMeters(-1, 0)}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}
