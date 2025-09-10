import React, { useEffect, useState } from "react";
import { apiUrl } from "../../config/api";
import Alert from "../../components/ui/alert/Alert";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  userpic: string;
  bio: string;
  address: string;
  country: string;
  province: string;
  city: string;
  postalcode: string;
  role: string;
  timestamp: string;
}

export default function DataUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  // const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, variant: "success", title: "", message: "" });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filteredUsers = users.filter(
    (user) =>
      user.firstname.toLowerCase().includes(search.toLowerCase()) ||
      user.lastname.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.city.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    // Fetch users on mount
    fetch(apiUrl(`/api/profile/all`))
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setForm(user);
    // Open edit modal
  };

  // const handleAdd = () => {
  //   setEditId(null);
  //   setForm({});
  //   setShowModal(true);
  // };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const res = await fetch(apiUrl(`/api/profile/${deleteId}`), {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal menghapus user");
        setUsers((prev) => prev.filter((u) => u.id !== deleteId));
        setAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "User berhasil dihapus.",
        });
      } catch {
        setAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal menghapus user.",
        });
      } finally {
        setDeleteId(null);
        setShowDeleteModal(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editId) {
      // Update user
      try {
        const res = await fetch(apiUrl(`/api/profile/${editId}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal mengedit user");
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === editId ? updated : u)));
        setAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "User berhasil diedit.",
        });
      } catch {
        setAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal mengedit user.",
        });
      } finally {
        setEditId(null);
        setForm({});
      }
    } else {
      // Add user
      try {
        const res = await fetch(apiUrl(`/api/register`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal menambah user");
        const created = await res.json();
        setUsers((prev) => [...prev, { ...form, ...created } as User]);
        setAlert({
          show: true,
          variant: "success",
          title: "Berhasil",
          message: "User berhasil ditambah.",
        });
      } catch {
        setAlert({
          show: true,
          variant: "error",
          title: "Gagal",
          message: "Gagal menambah user.",
        });
      } finally {
        setForm({});
      }
    }
  };

  return (
    <div>
      <PageMeta
        title="Data User"
        description="Tabel data user dan menu edit/tambah/hapus"
      />
      <PageBreadcrumb pageTitle="Data User" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded w-full max-w-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
            placeholder="Cari..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                  Nama
                </th>
                <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                  Email
                </th>
                <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                  Role
                </th>
                <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                  Kota
                </th>
                <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <td className="px-3 py-2 flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
                      onClick={() =>
                        window.open(`/view/profile/${user.id}`, "_blank")
                      }
                    >
                      <img
                        src={
                          user.userpic
                            ? user.userpic.startsWith("/uploads")
                              ? apiUrl(user.userpic)
                              : user.userpic
                            : "/images/user/avatar-profile.jpg"
                        }
                        alt={`${user.firstname} ${user.lastname}`}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity duration-200"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/images/user/avatar-profile.jpg";
                        }}
                      />
                    </div>
                    <span className="text-gray-800 dark:text-gray-100">
                      {user.firstname} {user.lastname}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                    {user.email}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200 capitalize">
                    {user.role}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                    {user.city}
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 font-semibold shadow"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 font-semibold shadow"
                      onClick={() => handleDelete(user.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal Edit User */}
        {editId && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-2xl relative z-[10000] transition-colors duration-300">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                onClick={() => {
                  setEditId(null);
                  setForm({});
                }}
                aria-label="Tutup"
              >
                &times;
              </button>
              <h4 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
                Edit User
              </h4>
              <form
                className="grid grid-cols-2 gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleSave();
                }}
              >
                <input
                  className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                  name="firstname"
                  placeholder="Nama Depan"
                  value={form.firstname || ""}
                  readOnly
                />
                <input
                  className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                  name="lastname"
                  placeholder="Nama Belakang"
                  value={form.lastname || ""}
                  readOnly
                />
                <input
                  className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                  name="email"
                  placeholder="Email"
                  value={form.email || ""}
                  readOnly
                />
                <input
                  className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                  name="phone"
                  placeholder="Telepon"
                  value={form.phone || ""}
                  readOnly
                />
                <input
                  className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                  name="city"
                  placeholder="Kota"
                  value={form.city || ""}
                  readOnly
                />
                <select
                  className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
                  name="role"
                  value={form.role || "user"}
                  onChange={handleChange}
                >
                  <option value="admin">admin</option>
                  <option value="officer">officer</option>
                  <option value="user">user</option>
                </select>
                <div className="col-span-2 mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-900 transition"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-900 transition"
                    onClick={() => {
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
        {/* Modal Konfirmasi Hapus */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md relative z-[10000]">
              <h4 className="mb-4 font-semibold text-lg text-gray-800 dark:text-white">
                Konfirmasi Hapus
              </h4>
              <p className="mb-6">
                Apakah Anda yakin ingin menghapus user ini?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={confirmDelete}
                >
                  Ya, Hapus
                </button>
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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
        {/* Alert */}
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
      </div>
    </div>
  );
}
