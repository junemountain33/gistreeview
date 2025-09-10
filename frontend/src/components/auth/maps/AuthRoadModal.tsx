import React from "react";
import { TreeTreeView } from "../../../icons";

interface AuthRoadModalProps {
  open: boolean;
  roadName?: string;
  roadId?: string;
  treeCount?: number;
  goodCount?: number;
  warningCount?: number;
  dangerCount?: number;
  onClose: () => void;
}

const AuthRoadModal: React.FC<AuthRoadModalProps> = ({
  open,
  roadName,
  roadId,
  treeCount,
  goodCount,
  warningCount,
  dangerCount,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="absolute left-4 bottom-14 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-[300px] relative border border-gray-300 dark:border-gray-600">
        <button
          className="absolute top-2 left-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 mt-2">
          <span className="text-sm">found</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xl">
            {typeof treeCount === "number" ? treeCount : 0}
          </span>
          <TreeTreeView className="w-6 h-6 text-green-700 dark:text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">at</span>
          <span
            className="text-blue-700 dark:text-blue-400 cursor-pointer hover:underline text-sm"
            onClick={() => {
              if (roadId) window.open(`/view/road/${roadId}`, "_blank");
            }}
          >
            {roadName || "(Tanpa Nama)"}
          </span>
        </div>
        {/* Status breakdown badges */}
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
            Good: {typeof goodCount === "number" ? goodCount : 0}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
            Warning: {typeof warningCount === "number" ? warningCount : 0}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm">
            Danger: {typeof dangerCount === "number" ? dangerCount : 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthRoadModal;
