export default function SkeletonWrapper({ loading, children, radiusClass = "rounded-xl" }) {
    return (
      <div className={`relative overflow-hidden ${radiusClass}`}>
        <div className={loading ? "opacity-0" : "opacity-100"}>{children}</div>

        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse">
          </div>
        )}
      </div>
    );
}