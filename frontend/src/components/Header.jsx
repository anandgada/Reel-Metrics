import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Users Reels Data
            </h1>
            <p className="text-sm text-gray-500">
             Recent 10 reels data
            </p>
          </div>
          {/* <div className="bg-blue-50 px-4 py-2 rounded-md">
            <p className="text-xs text-blue-700 font-medium">Environment: {import.meta.env.VITE_APP_ENV || 'Development'}</p>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
