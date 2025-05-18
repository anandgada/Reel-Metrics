const ProgressCircle = ({ progress, size = 40, strokeWidth = 4 }) => {
  // Calculate properties
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (normalizedProgress / 100) * circumference;

  const center = size / 2;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          className="text-blue-600 transition-all duration-300 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>

      {/* Percentage text */}
      <div
        className="absolute inset-0 flex items-center justify-center text-xs font-medium"
        style={{ fontSize: size < 30 ? `${size / 4}px` : "inherit" }}
      >
        {normalizedProgress}%
      </div>
    </div>
  );
};

export default ProgressCircle;
