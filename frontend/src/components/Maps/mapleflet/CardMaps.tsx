import React from "react";

// Tipe data pohon dan gambar
export interface TreeData {
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
}

export interface TreePicture {
  id: string;
  url: string;
  treeId: string;
  uploaded: string;
}

interface CardMapsProps {
  tree: TreeData;
  treePictures: { id: string; url: string; treeId: string; uploaded: string }[];
  setPreviewImg?: (url: string) => void;
  onReport?: () => void;
}

const CardMaps: React.FC<CardMapsProps> = ({
  tree,
  treePictures,
  setPreviewImg,
  onReport,
}) => {
  return (
    <div className="w-full text-gray-900 dark:text-white p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-md text-green-700 dark:text-green-300">
            {tree.species}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200">
            {tree.status}
          </span>
        </div>
      </div>
      <div className="mb-2">
        <table className="table-auto w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <tbody>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Usia
              </td>
              <td className="px-2 py-1">{tree.age} tahun</td>
            </tr>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Diameter Batang
              </td>
              <td className="px-2 py-1">{tree.trunk_diameter} cm</td>
            </tr>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Lebar Cabang
              </td>
              <td className="px-2 py-1">{tree.lbranch_width} cm</td>
            </tr>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Kepemilikan
              </td>
              <td className="px-2 py-1">{tree.ownership}</td>
            </tr>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Jalan
              </td>
              <td className="px-2 py-1">{tree.street_name}</td>
            </tr>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Waktu Update
              </td>
              <td className="px-2 py-1">{tree.timestamp}</td>
            </tr>
            <tr>
              <td className="font-semibold px-2 py-1 bg-gray-50 dark:bg-gray-800">
                Deskripsi
              </td>
              <td className="px-2 py-1">{tree.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Gambar pohon tampil di bawah deskripsi */}
      <div className="my-4">
        <div className="font-semibold mb-1 text-sm text-gray-700 dark:text-gray-300">
          Foto Pohon
        </div>
        <div className="flex flex-wrap gap-2">
          {treePictures.filter((pic) => pic.treeId === tree.id).length > 0 ? (
            treePictures
              .filter((pic) => pic.treeId === tree.id)
              .map((pic) => (
                <img
                  key={pic.id}
                  src={`/assets/data/tree/${pic.url}`}
                  alt={pic.id}
                  className="w-16 h-16 object-cover rounded shadow cursor-pointer"
                  onClick={() =>
                    setPreviewImg &&
                    setPreviewImg(`/assets/data/tree/${pic.url}`)
                  }
                  loading="lazy"
                />
              ))
          ) : (
            <span className="text-xs text-gray-400">Tidak ada gambar</span>
          )}
        </div>
      </div>
      {/* Tombol Lapor di kanan bawah card */}
      <div className="flex justify-end mt-6">
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
          onClick={onReport}
        >
          Report
        </button>
      </div>
    </div>
  );
};

export default CardMaps;
