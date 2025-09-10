import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

import type { TreeData, TreePicture } from "./MapLeaflet";

interface TreeMarkerProps {
  tree: TreeData;
  treePictures: TreePicture[];
  onTreeClick?: (tree: TreeData, pictures: TreePicture[]) => void;
}

const TreeMarker: React.FC<TreeMarkerProps> = ({
  tree,
  treePictures,
  onTreeClick,
}) => {
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
      position={
        typeof tree.lat === "number" && typeof tree.lng === "number"
          ? [tree.lat, tree.lng]
          : [tree.latitude ?? 0, tree.longitude ?? 0]
      }
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
};

export default TreeMarker;
