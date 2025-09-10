import React from "react";
import { Popup } from "react-leaflet";

interface AuthMapRoadPopupProps {
  position: [number, number];
  roadName?: string;
  onClose: () => void;
}

const AuthMapRoadPopup: React.FC<AuthMapRoadPopupProps> = ({
  position,
  roadName,
  onClose,
}) => (
  <Popup position={position} eventHandlers={{ remove: onClose }}>
    <div className="dark:bg-gray-800 dark:text-white">
      <strong>{roadName || "(Tanpa Nama)"}</strong>
    </div>
  </Popup>
);

export default AuthMapRoadPopup;
