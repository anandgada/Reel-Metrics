import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { FiUpload, FiFile, FiCheck } from "react-icons/fi";
import { startJob } from "../services/api";

const FileUpload = ({ onError, setIsLoading, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    setIsLoading(true);
    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          validateAndProcessData(results.data);
        },
        error: (error) => {
          onError(`Error parsing CSV: ${error.message}`);
          setIsLoading(false);
        },
      });
    } else if (["xlsx", "xls"].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          validateAndProcessData(jsonData);
        } catch (error) {
          onError(`Error parsing Excel file: ${error.message}`);
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      onError("Unsupported file format. Please upload a CSV or Excel file.");
      setIsLoading(false);
    }
  };

  const validateAndProcessData = async (data) => {
    if (!data || data.length === 0) {
      onError("The file is empty or has no valid data.");
      setIsLoading(false);
      return;
    }

    // Check for username column
    const hasUsernameColumn = Object.keys(data[0]).some(
      (key) => key.toLowerCase() === "username"
    );

    if (!hasUsernameColumn) {
      onError("Missing required column: username");
      setIsLoading(false);
      return;
    }

    // Extract usernames
    const usernames = data
      .map((item) => {
        const usernameKey = Object.keys(item).find(
          (key) => key.toLowerCase() === "username"
        );
        return item[usernameKey];
      })
      .filter((username) => username); // Remove any undefined or empty usernames

    // Send to backend
    try {
      const jobId = await startJob(usernames);

      onUpload?.(jobId, usernames);

      setFileName(fileName);
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error sending usernames to server:", error);
      onError("Failed to send usernames to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } transition-all duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-blue-100">
            <FiUpload className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              Upload username list
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Upload a CSV or Excel file containing usernames
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => fileInputRef.current.click()}
              className="btn btn-primary"
              type="button"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              onChange={handleFileChange}
              type="file"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
          </div>

          <div className="text-xs text-gray-500">
            File must contain a{" "}
            <pre className="inline-block font-bold">username</pre> column
          </div>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 flex items-center">
          <div className="flex items-center">
            <FiFile className="text-gray-500 mr-2" />
            <span className="text-sm font-medium truncate max-w-xs">
              {fileName}
            </span>
          </div>

          {uploadSuccess && (
            <div className="ml-auto flex items-center text-green-600">
              <FiCheck className="mr-1" />
              <span className="text-sm">Successfully uploaded</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
