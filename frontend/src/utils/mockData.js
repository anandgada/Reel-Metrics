// This file contains mock data for testing the application

export const generateMockData = () => {
  return [
    {
      id: 1,
      username: "johndoe",
      status: "completed",
      reels: [
        { id: 101, title: "Summer Beach", views: 1250, likes: 87 },
        { id: 102, title: "Mountain Hiking", views: 890, likes: 43 }
      ]
    },
    {
      id: 2,
      username: "janedoe",
      status: "in_progress",
      progress: 65,
      reels: [
        { id: 201, title: "City Lights", views: 3200, likes: 145 },
        { id: 202, title: "Morning Coffee", views: 1800, likes: 92 },
        { id: 203, title: "Sunset View", views: 2450, likes: 118 }
      ]
    },
    {
      id: 3,
      username: "bobsmith",
      status: "pending",
      reels: []
    },
    {
      id: 4,
      username: "alicegreen",
      status: "in_progress",
      progress: 30,
      reels: [
        { id: 401, title: "Cooking Recipe", views: 750, likes: 28 }
      ]
    },
    {
      id: 5,
      username: "mikebrown",
      status: "failed",
      reels: [
        { id: 501, title: "Tech Review", views: 1500, likes: 65 },
        { id: 502, title: "Gaming Montage", views: 980, likes: 47 }
      ]
    }
  ];
};

// You can use this function for testing the application
// without having to upload a file
export const loadMockData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockData());
    }, 1000); // Simulate network delay
  });
};