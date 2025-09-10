import React, { useEffect, useState } from "react";
import Alert from "../../components/ui/alert/Alert";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TreeModalMap from "../../components/Maps/TreeModalMap";
import { apiUrl } from "../../config/api";

// Function to calculate string similarity (Levenshtein distance)
function calculateStringSimilarity(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return (
    1 - track[str2.length][str1.length] / Math.max(str1.length, str2.length)
  );
}

// Function to find most similar road
function findMostSimilarRoad(
  input: string,
  roads: RoadOption[]
): RoadOption | null {
  if (!input || !roads.length) return null;

  const similarities = roads.map((road) => ({
    road,
    similarity: calculateStringSimilarity(
      input.toLowerCase(),
      road.nameroad.toLowerCase()
    ),
  }));

  const mostSimilar = similarities.reduce((prev, current) =>
    current.similarity > prev.similarity ? current : prev
  );

  // Only return if similarity is above threshold (70%)
  return mostSimilar.similarity > 0.7 ? mostSimilar.road : null;
}

// Interface/type definitions
interface RoadOption {
  id: string;
  nameroad: string;
}
interface Tree {
  id: string;
  latitude: number;
  longitude: number;
  species: string;
  age: number;
  trunk_diameter: number;
  lbranch_width: number;
  ownership: string;
  road: {
    id: string;
    nameroad: string;
    description?: string;
  } | null;
  roadId?: string | null;
  description: string;
  status: string;
  timestamp: string;
}
interface TreePicture {
  id: string;
  url: string;
  treeId: string;
}

export default function DataTree() {
  // State
  const [roads, setRoads] = useState<RoadOption[]>([]);
  const [roadSearch, setRoadSearch] = useState("");
  const [showRoadDropdown, setShowRoadDropdown] = useState(false);
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const [uiAlert, setUiAlert] = useState<{
    show: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, variant: "success", title: "", message: "" });
  const [trees, setTrees] = useState<Tree[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Tree>>({});
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [treePictures, setTreePictures] = useState<TreePicture[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const pageSize = 10;
  const totalPages = Math.ceil(trees.length / pageSize);
  const pagedTrees = trees.slice((page - 1) * pageSize, page * pageSize);

  // Fetch roads for dropdown
  useEffect(() => {
    fetch(apiUrl("/api/roads"))
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched roads:", data);
        setRoads(data);
      });
  }, []);

  // Fetch tree pictures
  const fetchTreePictures = async () => {
    const res = await fetch(apiUrl("/api/treepictures"));
    const data = await res.json();
    setTreePictures(data);
  };
  useEffect(() => {
    fetchTreePictures();
  }, [trees]);
  const getPictures = (treeId: string) =>
    treePictures.filter((pic) => pic.treeId === treeId);

  // Fetch trees
  useEffect(() => {
    fetch(apiUrl("/api/trees"))
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched trees:", data);
        setTrees(data);
      });
  }, []);

  // Delete
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const res = await fetch(apiUrl(`/api/trees/${deleteId}`), {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal menghapus data");
        setTrees((prev) => prev.filter((t) => t.id !== deleteId));
        setUiAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "Data pohon berhasil dihapus.",
        });
      } catch {
        setUiAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal menghapus data pohon.",
        });
      } finally {
        if (editId === deleteId) setEditId(null);
        setDeleteId(null);
        setShowDeleteModal(false);
      }
    }
  };

  // Form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      setPictureFiles(e.target.files ? Array.from(e.target.files) : []);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Save (edit/add)
  const handleSave = async (): Promise<boolean> => {
    // Determine selected road id, try multiple fallbacks
    const similarRoad = roadSearch.trim()
      ? findMostSimilarRoad(roadSearch, roads)
      : null;
    const resolvedRoadId =
      selectedRoadId || form.road?.id || form.roadId || similarRoad?.id || null;
    if (!resolvedRoadId) {
      setUiAlert({
        show: true,
        variant: "error",
        title: "Error",
        message: "Mohon pilih nama jalan terlebih dahulu",
      });
      return false;
    }
    // If we matched a similar road using roadSearch, make sure form has it
    if (!form.road?.id && similarRoad) {
      setForm({
        ...form,
        roadId: similarRoad.id,
        road: { id: similarRoad.id, nameroad: similarRoad.nameroad },
      });
      setRoadSearch(similarRoad.nameroad);
      setUiAlert({
        show: true,
        variant: "success",
        title: "Info",
        message: `Menggunakan jalan "${similarRoad.nameroad}"`,
      });
    }

    if (editId) {
      // Update
      const updated = {
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        species: form.species || "",
        age: Number(form.age) || 0,
        trunk_diameter: Number(form.trunk_diameter) || 0,
        lbranch_width: Number(form.lbranch_width) || 0,
        ownership: form.ownership || "",
        roadId: resolvedRoadId,
        description: form.description || "",
        status: form.status || "good",
        timestamp: form.timestamp || new Date().toISOString(),
      };
      try {
        console.log(
          "Saving (update) - resolvedRoadId:",
          resolvedRoadId,
          "payload:",
          updated
        );
        const res = await fetch(apiUrl(`/api/trees/${editId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal mengedit data");
        setTrees((prev) =>
          prev.map((t) =>
            t.id === editId ? { ...t, ...updated, road: form.road ?? null } : t
          )
        );
        // Upload gambar jika ada file baru
        if (pictureFiles.length > 0) {
          const formData = new FormData();
          pictureFiles.forEach((file) => formData.append("picture", file));
          await fetch(apiUrl(`/api/trees/${editId}/pictures`), {
            method: "POST",
            body: formData,
          });
        }
        setUiAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "Data pohon berhasil diedit.",
        });
        // success - reset edit state and return true
        setEditId(null);
        setForm({});
        setPictureFiles([]);
        setSelectedRoadId(null);
        return true;
      } catch {
        setUiAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal mengedit data pohon.",
        });
        // failure - keep modal open and allow user to retry
        return false;
      }
    } else {
      // Create
      const newTree = {
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        species: form.species || "",
        age: Number(form.age) || 0,
        trunk_diameter: Number(form.trunk_diameter) || 0,
        lbranch_width: Number(form.lbranch_width) || 0,
        ownership: form.ownership || "",
        roadId: resolvedRoadId || null,
        description: form.description || "",
        status: form.status || "good",
        timestamp: new Date().toISOString(),
      };

      console.log("Form state before saving:", form);
      console.log("Sending data to API:", newTree);
      try {
        console.log(
          "Saving (create) - resolvedRoadId:",
          resolvedRoadId,
          "payload:",
          newTree
        );
        const res = await fetch(apiUrl("/api/trees"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTree),
        });
        if (!res.ok) throw new Error("Gagal menambah data");
        const created = await res.json();
        console.log("Response from API:", created);
        setTrees((prev) => [...prev, created]);
        // Upload gambar jika ada file
        if (pictureFiles.length > 0 && created.id) {
          const formData = new FormData();
          pictureFiles.forEach((file) => formData.append("picture", file));
          await fetch(apiUrl(`/api/trees/${created.id}/pictures`), {
            method: "POST",
            body: formData,
          });
        }
        setUiAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "Data pohon berhasil ditambah.",
        });
        // success - reset form state and return true
        setForm({});
        setPictureFiles([]);
        setSelectedRoadId(null);
        return true;
      } catch {
        setUiAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal menambah data pohon.",
        });
        // failure - keep modal open and let user retry
        return false;
      }
    }
  };

  // Modal handlers
  const handleAdd = () => {
    setEditId(null);
    setForm({});
    setShowModal(true);
  };
  const handleEditModal = (tree: Tree) => {
    setEditId(tree.id);
    setForm(tree);
    setShowModal(true);
  };

  // Auto close alert after 3 seconds
  useEffect(() => {
    if (uiAlert.show) {
      const timer = setTimeout(
        () => setUiAlert((a) => ({ ...a, show: false })),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [uiAlert.show]);

  // Close road dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".road-search-container")) {
        setShowRoadDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {uiAlert.show && (
        <Alert
          variant={uiAlert.variant}
          title={uiAlert.title}
          message={uiAlert.message}
          position="top-center"
          showProgress={true}
          duration={3000}
          isClosable={true}
          onClose={() => setUiAlert((prev) => ({ ...prev, show: false }))}
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
            alt="Preview Pohon"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl border-4 border-white"
            onError={(e) => {
              e.currentTarget.src = "/images/tree-default.jpg";
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <PageMeta
        title="Data Tree"
        description="Tabel data pohon dan menu edit/tambah/hapus"
      />
      <PageBreadcrumb pageTitle="Data Tree" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
          <button
            className="px-4 py-2 rounded font-semibold shadow bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white border border-blue-500 dark:border-blue-600 transition-colors"
            onClick={handleAdd}
          >
            Tambah Pohon
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
              placeholder="Cari pohon..."
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
                  species
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  age
                </th>
                {/* <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">trunk_diameter</th> */}
                {/* <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">lbranch_width</th> */}
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  ownership
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  road
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  description
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  status
                </th>
                {/* <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">timestamp</th> */}
                {/* <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">treepictures</th> */}
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedTrees.map((tree) => (
                <tr
                  key={tree.id}
                  className="border-b border-gray-100 dark:border-gray-800 lowercase hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <td className="px-3 py-2 lowercase flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
                      onClick={() =>
                        window.open(`/view/tree/${tree.id}`, "_blank")
                      }
                    >
                      <img
                        src={
                          getPictures(tree.id)[0]?.url
                            ? `/uploads/tree/${getPictures(tree.id)[0].url}`
                            : "/images/tree-default.jpg"
                        }
                        alt={`Tree ${tree.species || tree.id}`}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity duration-200"
                        onError={(e) => {
                          e.currentTarget.src = "/images/tree-default.jpg";
                        }}
                      />
                    </div>
                    <span className="text-gray-800 dark:text-gray-100">
                      {tree.id.length > 8
                        ? `${tree.id.slice(0, 3)}...${tree.id.slice(-3)}`
                        : tree.id}
                    </span>
                  </td>
                  <td className="px-3 py-2 lowercase">
                    {getPictures(tree.id).length > 0 ? (
                      getPictures(tree.id).map((pic) => (
                        <img
                          key={pic.id}
                          src={
                            pic.url.startsWith("http")
                              ? pic.url
                              : apiUrl(`/uploads/tree/${pic.url}`)
                          }
                          alt={pic.id}
                          className="w-12 h-12 object-cover inline-block mr-1 rounded cursor-pointer"
                          onClick={() =>
                            setPreviewImg(
                              pic.url.startsWith("http")
                                ? pic.url
                                : apiUrl(`/uploads/tree/${pic.url}`)
                            )
                          }
                        />
                      ))
                    ) : (
                      <span className="text-gray-400">Tidak ada gambar</span>
                    )}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {tree.species}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {tree.age}
                  </td>
                  {/* <td className="px-3 py-2 lowercase">{tree.trunk_diameter}</td> */}
                  {/* <td className="px-3 py-2 lowercase">{tree.lbranch_width}</td> */}
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {tree.ownership}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {tree.road?.nameroad || "-"}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {tree.description}
                  </td>
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {tree.status}
                  </td>
                  {/* <td className="px-3 py-2 lowercase">{tree.timestamp}</td> */}
                  {/* <td className="px-3 py-2 lowercase">
                    {getPictures(tree.id).map((pic) => (
                      <img
                        key={pic.id}
                        src={"/assets/data/tree/" + pic.url}
                        alt={pic.id}
                        className="w-12 h-12 object-cover inline-block mr-1 rounded"
                      />
                    ))}
                  </td> */}
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="px-2 py-1 rounded font-semibold shadow bg-yellow-400 hover:bg-yellow-500 text-white border border-yellow-400 transition-colors dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:border-yellow-500"
                      onClick={() => handleEditModal(tree)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 rounded font-semibold shadow bg-red-500 hover:bg-red-600 text-white border border-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-600"
                      onClick={() => handleDelete(tree.id)}
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
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-200 dark:border-gray-700 my-auto">
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
                {editId ? "Edit Pohon" : "Tambah Pohon"}
              </h4>
              <form
                className="grid grid-cols-2 gap-4"
                encType="multipart/form-data"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await handleSave();
                  if (ok) setShowModal(false);
                }}
              >
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Spesies
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="species"
                    placeholder="Spesies"
                    value={form.species || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Umur
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="age"
                    placeholder="Umur"
                    value={form.age || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Diameter
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="trunk_diameter"
                    placeholder="Diameter"
                    value={form.trunk_diameter || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Lebar Cabang
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="lbranch_width"
                    placeholder="Lebar Cabang"
                    value={form.lbranch_width || ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Status
                  </label>
                  <select
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="status"
                    value={form.status || "good"}
                    onChange={handleChange}
                  >
                    <option value="good">good</option>
                    <option value="warning">warning</option>
                    <option value="danger">danger</option>
                  </select>
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
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Latitude
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="latitude"
                    placeholder="Latitude"
                    value={form.latitude || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Longitude
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="longitude"
                    placeholder="Longitude"
                    value={form.longitude || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-span-2 mt-4">
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Pilih Lokasi di Peta (klik untuk menandai lokasi)
                  </label>
                  <TreeModalMap
                    latitude={Number(form.latitude) || -3.7}
                    longitude={Number(form.longitude) || 128.17}
                    roads={roads}
                    onLocationChange={(lat, lng) => {
                      setForm({
                        ...form,
                        latitude: lat,
                        longitude: lng,
                      });
                    }}
                    onRoadSelect={(roadId) => {
                      const selected =
                        roads.find((r) => r.id === roadId) || null;
                      if (selected) {
                        setForm({
                          ...form,
                          roadId: selected.id,
                          road: {
                            id: selected.id,
                            nameroad: selected.nameroad,
                          },
                        });
                        setRoadSearch(selected.nameroad);
                        setSelectedRoadId(selected.id);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Kepemilikan
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    name="ownership"
                    placeholder="Kepemilikan"
                    value={form.ownership || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative road-search-container">
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Nama Jalan
                  </label>
                  <input
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    placeholder="Ketik untuk mencari jalan..."
                    value={roadSearch}
                    onChange={(e) => setRoadSearch(e.target.value)}
                    onFocus={() => setShowRoadDropdown(true)}
                  />
                  {showRoadDropdown && roadSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {roads
                        .sort((a, b) => {
                          const aSimilarity = calculateStringSimilarity(
                            roadSearch.toLowerCase(),
                            a.nameroad.toLowerCase()
                          );
                          const bSimilarity = calculateStringSimilarity(
                            roadSearch.toLowerCase(),
                            b.nameroad.toLowerCase()
                          );
                          return bSimilarity - aSimilarity;
                        })
                        .filter(
                          (road) =>
                            calculateStringSimilarity(
                              roadSearch.toLowerCase(),
                              road.nameroad.toLowerCase()
                            ) > 0.3
                        )
                        .map((road) => (
                          <div
                            key={road.id}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                            onClick={() => {
                              setForm({
                                ...form,
                                roadId: road.id,
                                road: { id: road.id, nameroad: road.nameroad },
                              });
                              setRoadSearch(road.nameroad);
                              setShowRoadDropdown(false);
                            }}
                          >
                            {road.nameroad}
                          </div>
                        ))}
                      {roads.filter((road) =>
                        road.nameroad
                          .toLowerCase()
                          .includes(roadSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm italic">
                          Tidak ada jalan yang sesuai
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">
                    Upload Gambar Pohon (bisa pilih lebih dari satu)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    name="picture"
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                    onChange={handleChange}
                    multiple
                  />
                  {/* Thumbnail gambar pohon yang sudah ada (edit mode) */}
                  {editId && getPictures(editId).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getPictures(editId).map((pic) => (
                        <div key={pic.id} className="relative group">
                          <img
                            src={
                              pic.url && pic.url.startsWith("http")
                                ? pic.url
                                : apiUrl(`/uploads/tree/${pic.url}`)
                            }
                            alt={pic.id}
                            className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-700"
                            onError={(e) => {
                              e.currentTarget.src = "/images/tree-default.jpg";
                            }}
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                            title="Hapus gambar"
                            onClick={async () => {
                              await fetch(
                                apiUrl(`/api/treepictures/${pic.id}`),
                                {
                                  method: "DELETE",
                                }
                              );
                              fetchTreePictures();
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
                      setPictureFiles([]);
                    }}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Konfirmasi Hapus */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
              <h4 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
                Konfirmasi Hapus
              </h4>
              <p className="mb-6 text-gray-700 dark:text-gray-200">
                Apakah Anda yakin ingin menghapus data pohon ini?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 rounded font-semibold shadow bg-red-500 hover:bg-red-600 text-white border border-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-600"
                  onClick={confirmDelete}
                >
                  Ya, Hapus
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
      </div>
    </div>
  );
}
