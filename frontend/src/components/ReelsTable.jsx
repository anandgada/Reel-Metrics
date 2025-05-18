const ReelsTable = ({ reels = [] }) => {
  // If reels data is not consistent, get all possible keys from all reel objects
  const allKeys = [...new Set(reels.flatMap((reel) => Object.keys(reel)))];

  // Select only the first 4 keys to keep the table simple
  const keysToShow = allKeys.slice(0, 4);

  return (
    <div className="rounded-md overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {keysToShow.map((key) => (
              <th
                key={key}
                className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reels.map((reel, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {keysToShow.map((key) => (
                <td
                  key={`${index}-${key}`}
                  className="px-4 py-2 text-sm text-gray-500"
                >
                  {renderReelValue(reel[key], key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to render different types of values appropriately
const renderReelValue = (value, key) => {
  if (key === "reelUrl") {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
    );
  }
  if (value === undefined || value === null) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export default ReelsTable;
