// Shown inside the dashboard frame while a page loads its data
export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-md bg-gray-200/70" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-md bg-gray-200/60" />
        ))}
      </div>
      <div className="h-64 rounded-md bg-gray-200/50" />
    </div>
  );
}
