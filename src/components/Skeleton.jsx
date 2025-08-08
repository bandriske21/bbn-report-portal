export default function Skeleton({ rows = 3 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200/70 rounded" />
      ))}
    </div>
  );
}

