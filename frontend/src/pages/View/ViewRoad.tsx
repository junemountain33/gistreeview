import React from "react";
import { useParams } from "react-router-dom";
import NotFound from "../OtherPage/NotFound";
import PageMeta from "../../components/common/PageMeta";
import { apiUrl } from "../../config/api";
import Pagination from "../../components/ui/Pagination";
import TextArea from "../../components/form/input/TextArea";

type Road = {
  id: string;
  nameroad: string;
  description: string;
  city: string;
  province: string;
  country: string;
  status: string;
  timestamp: string;
};
type Tree = {
  id: string;
  roadId: string;
};
type RoadPicture = { id: string; roadId: string; url: string };

export default function ViewRoad() {
  const { id } = useParams();
  const [road, setRoad] = React.useState<Road | null>(null);
  const [trees, setTrees] = React.useState<Tree[]>([]);
  const [pictures, setPictures] = React.useState<RoadPicture[]>([]);
  const [mainImgIdx, setMainImgIdx] = React.useState(0);
  const [thumbPage, setThumbPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!id || id.toLowerCase() === "viewroad") return;
    setLoading(true);
    Promise.all([
      fetch(apiUrl(`/api/roads`)).then((res) => res.json()),
      fetch(apiUrl(`/api/roadpictures`)).then((res) => res.json()),
      fetch(apiUrl(`/api/trees`)).then((res) => res.json()),
    ])
      .then(([roads, allPictures, allTrees]) => {
        const foundRoad = roads.find((r: Road) => r.id === id);
        if (!foundRoad) {
          setError("Road not found");
          setLoading(false);
          return;
        }
        setRoad(foundRoad);
        setPictures(allPictures.filter((p: RoadPicture) => p.roadId === id));
        setTrees(allTrees.filter((t: Tree) => t.roadId === id));
        setMainImgIdx(0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load road data.");
        setLoading(false);
      });
  }, [id]);

  if (!id || id.toLowerCase() === "viewroad") return <NotFound />;
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <NotFound />;
  if (!road) return null;

  return (
    <>
      <PageMeta
        title={`View Road | ${road.nameroad}`}
        description={`Halaman view road ${road.nameroad}`}
      />
      <div className="w-full max-w-5xl mx-auto my-8 relative">
        <div className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-md pb-6 lg:pb-8">
          <div className="p-8 lg:p-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/2 w-full flex flex-col items-center gap-4">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                {pictures.length > 0 ? (
                  <img
                    src={apiUrl(`/uploads/road/${pictures[mainImgIdx].url}`)}
                    alt="road"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/images/road-default.jpg";
                    }}
                  />
                ) : (
                  <img
                    src="/images/road-default.jpg"
                    alt="road"
                    className="object-cover w-full h-full dark:opacity-80 dark:mix-blend-multiply"
                  />
                )}
              </div>
              {pictures.length > 1 && (
                <div className="flex flex-col items-center w-full">
                  <div className="flex gap-2 flex-wrap justify-center mt-2">
                    {(() => {
                      const pageSize = 6;
                      const startIdx = (thumbPage - 1) * pageSize;
                      const endIdx = startIdx + pageSize;
                      return pictures
                        .slice(startIdx, endIdx)
                        .map((pic, idx) => {
                          const globalIdx = startIdx + idx;
                          return (
                            <img
                              key={pic.id}
                              src={apiUrl(`/uploads/road/${pic.url}`)}
                              alt="road"
                              className={`w-16 h-16 object-cover rounded-lg border cursor-pointer transition-all duration-150 ${
                                mainImgIdx === globalIdx
                                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600"
                                  : "border-gray-200 dark:border-gray-700"
                              } bg-white dark:bg-gray-900`}
                              onClick={() => setMainImgIdx(globalIdx)}
                            />
                          );
                        });
                    })()}
                  </div>
                  {pictures.length > 6 && (
                    <div className="mt-2">
                      <Pagination
                        page={thumbPage}
                        totalPages={Math.ceil(pictures.length / 6)}
                        onPageChange={setThumbPage}
                      />
                      {/* Pagination can be added here if needed */}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="md:w-1/2 w-full flex flex-col gap-4">
              <h2 className="font-bold text-2xl mb-2 text-gray-800 dark:text-white ">
                Road Detail
              </h2>
              <div className="grid grid-cols-1 gap-2 py-5">
                <table className="w-full mb-4">
                  <tbody>
                    <tr>
                      <td className="text-xs text-gray-500 min-w-[90px] py-1 pr-2 text-right align-top">
                        Road ID :
                      </td>
                      <td className="py-1">
                        <button
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          title="Lihat detail road"
                          onClick={() =>
                            window.open(`/view/road/${road.id}`, "_blank")
                          }
                        >
                          {road.id}
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-xs text-gray-500 min-w-[90px] py-1 pr-2 text-right align-top">
                        Name Road :
                      </td>
                      <td className="py-1 text-sm font-medium text-gray-800 dark:text-white/90">
                        {road.nameroad}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-xs text-gray-500 min-w-[90px] py-1 pr-2 text-right align-top">
                        Total Trees :
                      </td>
                      <td className="py-1 text-sm font-bold text-gray-800 dark:text-white/90">
                        {trees.length}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-xs text-gray-500 min-w-[90px] py-1 pr-2 text-right align-top">
                        Description :
                      </td>
                      <td className="py-1">
                        <TextArea
                          value={road.description}
                          disabled
                          className="w-full text-gray-800 dark:text-white/90"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
