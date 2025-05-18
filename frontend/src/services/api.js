// This file would normally contain the actual API endpoints
// For now, it's a mock service that simulates API interactions

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";

export const startJob = async (usernames) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usernames }),
    });
    if (!response.ok) {
      throw new Error("Failed to start job");
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

export const fetchReels = async ({ page = 0, jobId } = {}) => {
  try {
    const urlParams = new URLSearchParams({
      page: page.toString(),
      includeReels: "true",
    });

    if (jobId) {
      urlParams.append("jobId", jobId);
    }
    const response = await fetch(
      `${API_BASE_URL}/api/reels/?${urlParams.toString()}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
};
