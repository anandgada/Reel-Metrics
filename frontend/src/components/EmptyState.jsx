import { FiDatabase } from "react-icons/fi";

const EmptyState = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-16 text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="p-4 bg-blue-50 rounded-full mb-4">
          <FiDatabase className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Data to display
        </h3>
      </div>
    </div>
  );
};

export default EmptyState;
