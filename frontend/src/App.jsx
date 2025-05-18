import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import "./App.css";
import { fetchReels } from "./services/api";

function App() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (jobId) => {
    // skip loader because jobId has it's own progress.
    if (!jobId) {
      setIsLoading(true);
    }
    const response = await fetchReels({ jobId });
    const _data = response?.data;
    setIsLoading(false);
    return _data;
  }, []);

  useEffect(() => {
    loadData?.().then((_data) => setData(_data));
  }, [loadData]);

  const handleDataUpload = (jobId, usernames) => {
    let completed = false;
    const timeout = setInterval(() => {
      const reload = async () => {
        const resultData = await loadData?.(jobId);
        if (resultData && Array.isArray(resultData) && resultData.length > 0) {
          const allCompleted =
            resultData.length === usernames.length &&
            resultData.every((item) => item?.status === "completed");
          if (allCompleted) {
            completed = true;
            clearTimeout(timeout);
            alert("Job completed, please refresh to see results");
          }
          setData((prev) => {
            const newData = [...resultData, ...prev];
            const _usernames = [];
            const filteredData = newData.filter((item) => {
              if (!_usernames.includes(item.username)) {
                _usernames.push(item.username);
                return true;
              }
              return false;
            });
            return Array.from(filteredData);
          });
          return;
        }
      };
      reload();
    }, 1000);

    // stops polling after 2 minutes of no progress
    setTimeout(() => {
      if (completed) return;
      clearTimeout(timeout);
      toast(
        "Closing job monitoring because of inactivity. Please refresh to continue."
      );
    }, 2 * 60 * 1000);

    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Your Data</h2>
          <FileUpload
            onUpload={handleDataUpload}
            onError={handleError}
            setIsLoading={setIsLoading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : data.length > 0 ? (
          <DataTable data={data} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

export default App;
