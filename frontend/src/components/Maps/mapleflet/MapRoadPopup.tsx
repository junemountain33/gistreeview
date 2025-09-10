import React from "react";
import { Popup } from "react-leaflet";

interface MapRoadPopupProps {
  position: [number, number];
  roadName?: string;
  onClose: () => void;
}

const MapRoadPopup: React.FC<MapRoadPopupProps> = ({
  position,
  roadName,
  onClose,
}) => (
  <Popup position={position} eventHandlers={{ remove: onClose }}>
    <div>
      <strong>{roadName || "(Tanpa Nama)"}</strong>
    </div>
  </Popup>
);

export default MapRoadPopup;
