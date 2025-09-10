import { useEffect, useState } from "react";
import { apiUrl } from "../../config/api";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

// --- Type Definitions ---
interface Road {
  id: string;
  nameroad?: string;
}
interface Tree {
  id: string;
  species?: string;
  road?: Road;
}
interface User {
  id: string;
  firstname: string;
  lastname: string;
}
interface Report {
  id: string;
  userId: string;
  user?: User;
  treeId?: string;
  tree?: Tree;
  description: string;
  status: string;
  timestamp: string;
  verifiedBy?: User;
  resolvedBy?: User;
  resolvedAt?: string;
}

export default function DataReport() {
  // --- State ---
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<"timestamp" | "resolvedAt">(
    "timestamp"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  // Sort handler
  const handleSort = (field: "timestamp" | "resolvedAt") => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Sort and filter reports
  const sortedReports = [...reports].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    const compareResult =
      new Date(aValue).getTime() - new Date(bValue).getTime();
    return sortOrder === "asc" ? compareResult : -compareResult;
  });

  const filteredReports = sortedReports.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.tree?.id && r.tree.id.toLowerCase().includes(search.toLowerCase())) ||
      (r.tree?.species &&
        r.tree.species.toLowerCase().includes(search.toLowerCase())) ||
      (r.tree?.road?.nameroad &&
        r.tree.road.nameroad.toLowerCase().includes(search.toLowerCase())) ||
      (r.user?.firstname &&
        r.user.firstname.toLowerCase().includes(search.toLowerCase())) ||
      (r.user?.lastname &&
        r.user.lastname.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const pagedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // --- Fetch Data ---
  useEffect(() => {
    fetch(apiUrl(`/api/reports`))
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  return (
    <div>
      {/* Meta & Breadcrumb */}
      <PageMeta
        title="Data Report"
        description="Tabel data report dan detail laporan."
      />
      <PageBreadcrumb pageTitle="Data Report" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-xl dark:text-white/90">
            Tabel Data Report
          </h3>
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-colors"
            placeholder="Cari report..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 180 }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  id
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  tree id
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  road id
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  deskripsi
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  status
                </th>
                <th
                  className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => handleSort("timestamp")}
                >
                  report date{" "}
                  {sortField === "timestamp" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  report by
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  verified by
                </th>
                <th className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                  resolved by
                </th>
                <th
                  className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => handleSort("resolvedAt")}
                >
                  resolved at{" "}
                  {sortField === "resolvedAt" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-100 dark:border-gray-800 lowercase hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {/* ID */}
                  <td className="px-3 py-2 lowercase text-gray-800 dark:text-gray-100">
                    <button
                      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Lihat detail report"
                      onClick={() =>
                        window.open(`/view/report/${report.id}`, "_blank")
                      }
                    >
                      {report.id.length > 8
                        ? `${report.id.slice(0, 3)}...${report.id.slice(-3)}`
                        : report.id}
                    </button>
                  </td>
                  {/* Tree */}
                  <td className="px-3 py-2 lowercase text-gray-800 dark:text-gray-100">
                    {report.tree?.id ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Lihat detail tree"
                        onClick={() =>
                          window.open(`/view/tree/${report.tree?.id}`, "_blank")
                        }
                      >
                        {report.tree.species || report.tree.id}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  {/* Road */}
                  <td className="px-3 py-2 lowercase text-gray-800 dark:text-gray-100">
                    {report.tree?.road?.id ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Lihat detail road"
                        onClick={() =>
                          window.open(
                            `/view/road/${report.tree?.road?.id}`,
                            "_blank"
                          )
                        }
                      >
                        {report.tree.road.nameroad || report.tree.road.id}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  {/* Description */}
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {report.description}
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {report.status}
                  </td>
                  {/* Report Date */}
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {report.timestamp}
                  </td>
                  {/* Report By */}
                  <td className="px-3 py-2 lowercase text-gray-800 dark:text-gray-100">
                    <button
                      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Lihat profile user"
                      onClick={() =>
                        window.open(`/view/profile/${report.userId}`, "_blank")
                      }
                    >
                      {report.user &&
                      report.user.firstname &&
                      report.user.lastname
                        ? `${report.user.firstname} ${report.user.lastname}`
                        : report.userId}
                    </button>
                  </td>
                  {/* Verified By */}
                  <td className="px-3 py-2 lowercase text-gray-800 dark:text-gray-100">
                    {report.verifiedBy?.id ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Lihat profile user"
                        onClick={() =>
                          window.open(
                            `/view/profile/${report.verifiedBy?.id}`,
                            "_blank"
                          )
                        }
                      >
                        {report.verifiedBy.firstname}{" "}
                        {report.verifiedBy.lastname}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  {/* Resolved By */}
                  <td className="px-3 py-2 lowercase text-gray-800 dark:text-gray-100">
                    {report.resolvedBy?.id ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Lihat profile user"
                        onClick={() =>
                          window.open(
                            `/view/profile/${report.resolvedBy?.id}`,
                            "_blank"
                          )
                        }
                      >
                        {report.resolvedBy.firstname}{" "}
                        {report.resolvedBy.lastname}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  {/* Resolved At */}
                  <td className="px-3 py-2 lowercase text-gray-700 dark:text-gray-200">
                    {report.resolvedAt ? report.resolvedAt : "-"}
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
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-700 dark:text-gray-200">
              Halaman {page} dari {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700"
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
