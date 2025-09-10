import React, { useEffect, useState } from "react";
import Alert from "../../components/ui/alert/Alert";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { apiUrl } from "../../config/api";

interface Road {
  id: string;
  nameroad: string;
  description: string;
}

export default function DataRoad() {
  const [roadSearch, setRoadSearch] = useState("");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const [alert, setAlert] = useState<{
    show: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, variant: "success", title: "", message: "" });
  // Fungsi untuk tombol Tambah Jalan
  const handleAdd = () => {
    setEditId(null);
    setForm({});
    setShowModal(true);
  };
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roads, setRoads] = useState<Road[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Road>>({});
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(roads.length / pageSize);
  const pagedRoads = roads.slice((page - 1) * pageSize, page * pageSize);

  // State untuk gambar jalan dari backend
  interface RoadPicture {
    id: string;
    url: string;
    roadId: string;
  }
  const [roadPictures, setRoadPictures] = useState<RoadPicture[]>([]);

  // Ambil gambar jalan dari backend
  const fetchRoadPictures = async () => {
    const res = await fetch(apiUrl("/api/roadpictures"));
    const data = await res.json();
    setRoadPictures(data);
  };

  // Ambil gambar jalan saat mount dan setiap kali data jalan berubah
  useEffect(() => {
    fetchRoadPictures();
  }, [roads]);

  // Ambil gambar jalan yang sesuai dengan id jalan
  const getPictures = (roadId: string) => {
    return roadPictures.filter((pic) => pic.roadId === roadId);
  };

  // Fetch data from backend
  useEffect(() => {
    fetch(apiUrl("/api/roads"))
      .then((res) => res.json())
      .then((data) => setRoads(data));
  }, []);

  // Delete from backend
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const res = await fetch(apiUrl(`/api/roads/${deleteId}`), {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal menghapus data");
        setRoads((prev) => prev.filter((t) => t.id !== deleteId));
        setAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "Data jalan berhasil dihapus.",
        });
      } catch {
        setAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal menghapus data jalan.",
        });
      } finally {
        setDeleteId(null);
        setShowDeleteModal(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "file") {
      setPictureFiles(e.target.files ? Array.from(e.target.files) : []);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Save to backend (edit/add)
  const handleSave = async () => {
    if (editId) {
      // Update
      const updated = { ...form, id: editId };
      try {
        const res = await fetch(apiUrl(`/api/roads/${editId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal mengedit data");
        setRoads((prev) =>
          prev.map((t) => (t.id === editId ? (updated as Road) : t))
        );
        // Upload gambar jika ada file baru
        if (pictureFiles.length > 0) {
          const formData = new FormData();
          pictureFiles.forEach((file) => formData.append("picture", file));
          await fetch(apiUrl(`/api/roads/${editId}/pictures`), {
            method: "POST",
            body: formData,
          });
          await fetchRoadPictures();
        }
        setAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "Data jalan berhasil diedit.",
        });
      } catch {
        setAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal mengedit data jalan.",
        });
      } finally {
        setEditId(null);
        setForm({});
        setPictureFiles([]);
      }
    } else {
      // Add
      try {
        const res = await fetch(apiUrl("/api/roads"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal menambah data");
        const newRoad = await res.json();
        setRoads((prev) => [...prev, newRoad]);
        // Upload gambar jika ada file
        if (pictureFiles.length > 0 && newRoad.id) {
          const formData = new FormData();
          pictureFiles.forEach((file) => formData.append("picture", file));
          await fetch(apiUrl(`/api/roads/${newRoad.id}/pictures`), {
            method: "POST",
            body: formData,
          });
          await fetchRoadPictures();
        }
        setAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "Data jalan berhasil ditambah.",
        });
      } catch {
        setAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal menambah data jalan.",
        });
      } finally {
        setForm({});
        setPictureFiles([]);
      }
    }
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <div>
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
      {/* Modal Preview Gambar */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]"
          style={{ transition: "background 0.2s" }}
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="Preview Jalan"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl border-4 border-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <PageMeta
        title="Data Road"
        description="Tabel data jalan dan menu edit/tambah/hapus"
      />
      <PageBreadcrumb pageTitle="Data Road" />
      {/* Modal konfirmasi hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
            <h4 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
              Konfirmasi Hapus
            </h4>
            <p className="mb-6 text-gray-700 dark:text-gray-200">
              Apakah Anda yakin ingin menghapus data jalan ini?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded font-semibold shadow bg-red-500 hover:bg-red-600 text-white border border-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-600"
                onClick={async () => {
                  await confirmDelete();
                }}
              >
                Hapus
              </button>
              <button
                className="px-4 py-2 rounded font-semibold shadow bg-gray-400 hover:bg-gray-500 text-white border border-gray-400 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-700"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
          <button
            className="px-4 py-2 rounded font-semibold shadow bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white border border-blue-500 dark:border-blue-600 transition-colors"
            onClick={handleAdd}
          >
            Tambah Jalan
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
              placeholder="Cari jalan..."
              value={roadSearch}
              onChange={(e) => setRoadSearch(e.target.value)}
              style={{ minWidth: 180 }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  id
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  gambar
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  nama jalan
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  deskripsi
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedRoads.map((road) => (
                <tr
                  key={road.id}
                  className="border-b border-gray-100 dark:border-gray-800 lowercase hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <td className="px-3 py-2 lowercase flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
                      onClick={() =>
                        window.open(`/view/road/${road.id}`, "_blank")
                      }
                    >
                      <img
                        src={
                          getPictures(road.id)[0]?.url
                            ? getPictures(road.id)[0].url.startsWith("http")
                              ? getPictures(road.id)[0].url
                              : apiUrl(
                                  `/uploads/road/${getPictures(road.id)[0].url}`
                                )
                            : "/images/road-default.jpg"
                        }
                        alt={`Road ${road.nameroad || road.id}`}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity duration-200"
                        onError={(e) => {
                          e.currentTarget.src = "/images/road-default.jpg";
                        }}
                      />
                    </div>
                    <span className="text-gray-800 dark:text-gray-100">
                      {road.id.length > 8
                        ? `${road.id.slice(0, 3)}...${road.id.slice(-3)}`
                        : road.id}
                    </span>
                  </td>
                  <td className="px-3 py-2 lowercase">
                    {getPictures(road.id).length > 0 ? (
                      getPictures(road.id).map((pic) => (
                        <img
                          key={pic.id}
                          src={
                            pic.url && pic.url.startsWith("http")
                              ? pic.url
                              : apiUrl(`/uploads/road/${pic.url}`)
                          }
                          onError={(e) => {
                            e.currentTarget.src = "/images/road-default.jpg";
                          }}
                          alt={pic.id}
                          className="w-12 h-12 object-cover inline-block mr-1 rounded cursor-pointer"
                          onClick={() =>
                            setPreviewImg(
                              pic.url && pic.url.startsWith("http")
                                ? pic.url
                                : apiUrl(`/uploads/road/${pic.url}`)
                            )
                          }
                        />
                      ))
                    ) : (
                      <span className="text-gray-400">Tidak ada gambar</span>
                    )}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {road.nameroad}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {road.description}
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="px-2 py-1 rounded font-semibold shadow bg-yellow-400 hover:bg-yellow-500 text-white border border-yellow-400 transition-colors dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:border-yellow-500"
                      onClick={() => {
                        setEditId(road.id);
                        setForm(road);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded font-semibold shadow bg-red-500 hover:bg-red-600 text-white border border-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-600"
                      onClick={() => handleDelete(road.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-700 dark:text-gray-200">
              Halaman {page} dari {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
        {/* Modal Form Edit/Tambah */}
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-200 dark:border-gray-700">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                  setForm({});
                }}
                aria-label="Tutup"
              >
                &times;
              </button>
              <h4 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
                {editId ? "Edit Jalan" : "Tambah Jalan"}
              </h4>
              <form
                className="grid grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleSave();
                  setShowModal(false);
                }}
              >
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Nama Jalan
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="nameroad"
                    placeholder="Nama Jalan"
                    value={form.nameroad || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Deskripsi
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="description"
                    placeholder="Deskripsi"
                    value={form.description || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Upload Gambar Jalan (bisa pilih lebih dari satu)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="picture"
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    onChange={handleChange}
                    multiple
                  />
                  {/* Thumbnail gambar jalan yang sudah ada (edit mode) */}
                  {editId && getPictures(editId).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getPictures(editId).map((pic) => (
                        <div key={pic.id} className="relative group">
                          <img
                            src={
                              pic.url && pic.url.startsWith("http")
                                ? pic.url
                                : apiUrl(`/uploads/road/${pic.url}`)
                            }
                            alt={pic.id}
                            className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                            title="Hapus gambar"
                            onClick={async () => {
                              await fetch(
                                apiUrl(`/api/roadpictures/${pic.id}`),
                                {
                                  method: "DELETE",
                                }
                              );
                              fetchRoadPictures();
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2 mt-4 flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded font-semibold shadow bg-green-500 hover:bg-green-600 text-white border border-green-500 transition-colors dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-600"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded font-semibold shadow bg-gray-400 hover:bg-gray-500 text-white border border-gray-400 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-700"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                      setForm({});
                    }}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
