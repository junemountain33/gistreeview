import React from "react";
import { TreeData, TreePicture } from "../../types/tree";
import { apiUrl } from "../../config/api";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import MapLeaflet from "../../components/Maps/mapleflet/MapLeaflet";
import Alert from "../../components/ui/alert/Alert";

// Tipe data untuk laporan pohon
interface ReportForm {
  description: string;
}

function ModalPreview({ img, onClose }: { img: string; onClose: () => void }) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999]"
      onClick={onClose}
    >
      <img
        src={img}
        alt="Preview Pohon"
        className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl border-4 border-white"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

const UserDashboard: React.FC = () => {
  const [showReportForm, setShowReportForm] = React.useState(false);
  const [showCard, setShowCard] = React.useState(false);
  const [selectedTree, setSelectedTree] = React.useState<TreeData | null>(null);
  const [previewImg, setPreviewImg] = React.useState<string | null>(null);
  const [treePictures, setTreePictures] = React.useState<TreePicture[]>([]);
  // State untuk modal laporan pohon
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [reportForm, setReportForm] = React.useState<ReportForm>({
    description: "",
  });
  const [alert, setAlert] = React.useState<{
    show: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, variant: "success", title: "", message: "" });
  const [reportPictureFiles, setReportPictureFiles] = React.useState<File[]>(
    []
  );

  React.useEffect(() => {
    fetch(apiUrl(`/api/treepictures`))
      .then((res) => res.json())
      .then((data) => setTreePictures(data));
  }, []);

  return (
    <div>
      <PageMeta
        title="Report Trees | GISTREEVIEW"
        description="Halaman report."
      />
      <PageBreadcrumb pageTitle="Report Trees" />
      {previewImg && (
        <ModalPreview img={previewImg} onClose={() => setPreviewImg(null)} />
      )}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-2 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8 mx-auto bg-gradient-to-br from-white-100 via-indigo-300 to-blue-500 dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-700 border border-indigo-200 dark:border-indigo-700 rounded-xl p-6 text-gray-800 dark:text-gray-200 shadow">
          <h3 className="font-bold text-md mb-4 text-blue-700 dark:text-blue-200">
            Langkah-langkah Melapor Pohon
          </h3>
          <div className="flex flex-col lg:flex-row gap-4 text-sm">
            <ol className="flex-1 list-decimal pl-5 space-y-1">
              <li>
                Pastikan laporan yang Anda buat benar dan sesuai kondisi di
                lapangan.
              </li>
              <li>
                Klik pada ikon pohon di peta untuk memilih pohon yang ingin
                dilaporkan.
              </li>
              <li>
                Klik tombol <b>Lapor</b> pada detail pohon.
              </li>
            </ol>
            <ol className="flex-1 list-decimal pl-5 space-y-1" start={4}>
              <li>Isi deskripsi laporan secara jelas dan lengkap.</li>
              <li>
                Sertakan bukti foto (bisa lebih dari satu) untuk memperkuat
                laporan Anda.
              </li>
              <li>
                Klik <b>Kirim Laporan</b> untuk mengirimkan laporan Anda.
              </li>
            </ol>
          </div>
          <div className="mt-4 text-xs italic text-blue-800 dark:text-blue-200">
            Laporan Anda akan diverifikasi oleh admin. Setelah diverifikasi,
            laporan akan segera ditindaklanjuti oleh officer.
          </div>
        </div>
        <div className="flex w-full h-full">
          <div
            className="rounded-2xl overflow-hidden transition-all duration-500 border shadow-lg"
            style={{
              minWidth: 0,
              width: showReportForm ? "calc(100% - 400px)" : "100%",
              flexGrow: 1,
            }}
          >
            <MapLeaflet
              onTreeClick={(tree: TreeData) => {
                // Convert timestamp to number if it's a string
                const transformedTree = {
                  ...tree,
                  timestamp:
                    typeof tree.timestamp === "string"
                      ? Number(tree.timestamp)
                      : tree.timestamp,
                };
                setSelectedTree(transformedTree);
                setShowCard(true);
                setShowReportForm(false);
              }}
            />
          </div>
          <div
            className={`transition-all duration-500 ml-4 flex flex-col${
              showCard
                ? "w-[450px] opacity-100 rounded-2xl overflow-hidden border shadow-lg"
                : "w-0 opacity-0"
            }`}
            style={{
              overflow: "hidden",
              width: showCard ? "450px" : "0px",
              opacity: showCard ? 1 : 0,
              transition: "width 0.5s, opacity 0.5s",
            }}
          >
            <div
              className={`transition-all duration-500 origin-left flex flex-col ${
                showCard ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
              style={{
                transform: showCard ? "scaleX(1)" : "scaleX(0)",
                opacity: showCard ? 1 : 0,
                height: showCard ? "auto" : 0,
                transition: "transform 0.5s, opacity 0.5s, height 0.5s",
              }}
            >
              {/* Info pohon tampil di sini jika marker diklik */}
              {selectedTree ? (
                <div className="p-4 relative bg-white/80 dark:bg-gray-900/70 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  {/* Status badge kanan atas */}
                  <span
                    className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-lg
                      ${
                        selectedTree.status === "good"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : selectedTree.status === "warning"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : selectedTree.status === "danger"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-gray-100 text-gray-500 border-gray-300"
                      }
                    `}
                  >
                    {selectedTree.status.charAt(0).toUpperCase() +
                      selectedTree.status.slice(1)}
                  </span>
                  <div className="mb-3 font-bold text-lg text-indigo-700 dark:text-indigo-200 text-center">
                    Informasi Pohon
                  </div>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-2 font-semibold w-32">
                          Spesies:
                        </td>
                        <td className="py-1">{selectedTree.species}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">ID:</td>
                        <td className="py-1">{selectedTree.id}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">Latitude:</td>
                        <td className="py-1">{selectedTree.latitude}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">Longitude:</td>
                        <td className="py-1">{selectedTree.longitude}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">Umur:</td>
                        <td className="py-1">{selectedTree.age} tahun</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">
                          Diameter Batang:
                        </td>
                        <td className="py-1">
                          {selectedTree.trunk_diameter} cm
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">
                          Lebar Cabang:
                        </td>
                        <td className="py-1">{selectedTree.lbranch_width} m</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">
                          Kepemilikan:
                        </td>
                        <td className="py-1">{selectedTree.ownership}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">Nama Jalan:</td>
                        <td className="py-1">{selectedTree.street_name}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">Deskripsi:</td>
                        <td className="py-1">{selectedTree.description}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-2 font-semibold">
                          Waktu Input:
                        </td>
                        <td className="py-1">
                          {new Date(
                            Number(selectedTree.timestamp)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mb-2 text-sm text-gray-700 dark:text-gray-200 font-semibold">
                    Gambar Pohon:
                  </div>
                  <div className="flex flex-nowrap gap-2 mb-2 overflow-x-auto">
                    {Array.isArray(treePictures) &&
                    treePictures.filter((pic) => pic.treeId === selectedTree.id)
                      .length > 0 ? (
                      treePictures
                        .filter((pic) => pic.treeId === selectedTree.id)
                        .map((pic) => (
                          <img
                            key={pic.id}
                            src={apiUrl(`/uploads/tree/${pic.url}`)}
                            alt={pic.id}
                            className="w-20 h-20 object-cover rounded shadow border cursor-pointer"
                            onError={(e) => {
                              e.currentTarget.src = "/images/tree-default.jpg";
                            }}
                            loading="lazy"
                            onClick={() =>
                              setPreviewImg(apiUrl(`/uploads/tree/${pic.url}`))
                            }
                          />
                        ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        Tidak ada gambar
                      </span>
                    )}
                  </div>
                  <button
                    className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition font-semibold"
                    onClick={() => {
                      setShowReportModal(true);
                      setReportForm({ description: "" });
                    }}
                  >
                    Laporkan Pohon Ini
                  </button>
                </div>
              ) : (
                <div className="p-4 text-gray-400 text-center">
                  Klik marker pohon pada peta untuk melihat detail.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Langkah-langkah pelaporan (di atas map) */}

        {/* Modal Laporan Pohon di root, seperti DataTree */}
        {showReportModal && selectedTree && (
          <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/20">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-lg relative z-[200001]">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowReportModal(false)}
                aria-label="Tutup"
              >
                &times;
              </button>
              <h4 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
                Laporan Pohon
              </h4>
              <form
                className="grid grid-cols-1 gap-4"
                encType="multipart/form-data"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const user = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    );
                    const userId = user?.id;
                    if (!userId) {
                      throw new Error("User not logged in");
                    }
                    // 1. Kirim data laporan
                    const res = await fetch(apiUrl(`/api/reports`), {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        treeId: selectedTree.id,
                        description: reportForm.description,
                        userId: userId,
                      }),
                    });
                    if (!res.ok) throw new Error("Gagal mengirim laporan");
                    const report = await res.json();
                    // 2. Upload gambar jika ada
                    if (reportPictureFiles.length > 0 && report.id) {
                      const formData = new FormData();
                      reportPictureFiles.forEach((file) =>
                        formData.append("picture", file)
                      );
                      await fetch(
                        apiUrl(`/api/reports/${report.id}/pictures`),
                        {
                          method: "POST",
                          body: formData,
                        }
                      );
                    }
                    setAlert({
                      show: true,
                      variant: "success",
                      title: "Berhasil",
                      message: "Laporan berhasil dikirim.",
                    });
                    setShowReportModal(false);
                    setReportPictureFiles([]);
                  } catch {
                    setAlert({
                      show: true,
                      variant: "error",
                      title: "Gagal",
                      message: "Gagal mengirim laporan.",
                    });
                  }
                }}
              >
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    ID Pohon
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    value={selectedTree.id}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Spesies
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    value={selectedTree.species}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Deskripsi Laporan
                  </label>
                  <textarea
                    className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    name="description"
                    placeholder="Tuliskan laporan Anda..."
                    value={reportForm.description}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Upload Gambar Laporan (bisa pilih lebih dari satu)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="reportpictures"
                    className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    multiple
                    onChange={(e) =>
                      setReportPictureFiles(
                        e.target.files ? Array.from(e.target.files) : []
                      )
                    }
                  />
                  {/* Preview thumbnail gambar yang dipilih */}
                  {reportPictureFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reportPictureFiles.map((file, idx) => (
                        <img
                          key={idx}
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded font-semibold shadow bg-green-500 hover:bg-green-600 text-white border border-green-500 transition-colors dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-600"
                  >
                    Kirim Laporan
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded font-semibold shadow bg-gray-400 hover:bg-gray-500 text-white border border-gray-400 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-700"
                    onClick={() => setShowReportModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Alert notifikasi */}
        {alert.show && (
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            position="top-center"
            showProgress={true}
            duration={3000}
            isClosable={true}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
