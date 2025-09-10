import React from "react";

interface FormReportTreeProps {
  onClose: () => void;
}

const FormReportTree: React.FC<FormReportTreeProps> = ({ onClose }) => {
  const [treeId, setTreeId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [photos, setPhotos] = React.useState<File[]>([]);

  // verifiedById, resolvedById, resolvedAt default null

  return (
    <div className="w-full max-w-md mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded-2xl  shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Formulir Laporan Pohon
      </h3>
      <form>
        {/* ...existing code... */}
        {/* User ID dihapus */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Tree ID
          </label>
          <input
            type="text"
            value={treeId}
            onChange={(e) => setTreeId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Deskripsi Laporan
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            rows={3}
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Foto Pohon (bisa lebih dari satu)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setPhotos(Array.from(e.target.files));
              }
            }}
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((file, idx) => (
                <div
                  key={idx}
                  className="w-16 h-16 rounded overflow-hidden border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Status dihapus */}
        {/* Timestamp dihapus */}
        {/* verifiedById, resolvedById, resolvedAt default null, tidak perlu input */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors duration-200"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormReportTree;
