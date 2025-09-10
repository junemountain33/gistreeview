import React from "react";
import { Polyline, Popup } from "react-leaflet";

import type { Road } from "../mapleflet/MapLeaflet";

interface RoadPolylineProps {
  road: Road;
  positions: [number, number][];
  midPos: [number, number];
  isHovered: boolean;
  isOpen: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  onClose: () => void;
}

const RoadPolyline: React.FC<RoadPolylineProps> = ({
  road,
  positions,
  midPos,
  isHovered,
  isOpen,
  onHover,
  onClick,
  onClose,
}) => (
  <Polyline
    key={road.id}
    positions={positions}
    pathOptions={{
      color: isHovered ? "#d80202ff" : "#00264bff",
      weight: 14,
    }}
    eventHandlers={{
      mouseover: () => onHover(road.id),
      mouseout: () => onHover(null),
      click: () => onClick(road.id),
    }}
    interactive={true}
  >
    {isOpen && (
      <Popup position={midPos} eventHandlers={{ remove: onClose }}>
        <div>
          <strong>{road.name || "(Tanpa Nama)"}</strong>
        </div>
      </Popup>
    )}
  </Polyline>
);

export default RoadPolyline;
