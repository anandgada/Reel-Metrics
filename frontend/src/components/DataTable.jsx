import React, { useState } from "react";
import ProgressCircle from "./ProgressCircle";
import ReelsTable from "./ReelsTable";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const DataTable = ({ data = [] }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Id
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reels
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <React.Fragment key={row._id || index}>
                <tr
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    expandedRows[row._id] ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>

                      {row.status === "in_progress" && (
                        <ProgressCircle
                          progress={parseInt(row.progress) || 0}
                          size={24}
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Array.isArray(row.reels) && row.reels.length > 0 ? (
                      <button
                        onClick={() => toggleRowExpansion(row._id)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {row.reels.length} Reels
                        {expandedRows[row._id] ? (
                          <FiChevronUp className="ml-1" />
                        ) : (
                          <FiChevronDown className="ml-1" />
                        )}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">No reels</span>
                    )}
                  </td>
                </tr>
                {expandedRows[row._id] &&
                  Array.isArray(row.reels) &&
                  row.reels.length > 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-3 bg-gray-50">
                        <div className="py-2 animate-[fadeIn_0.3s_ease-in-out]">
                          <ReelsTable reels={row.reels} />
                        </div>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
