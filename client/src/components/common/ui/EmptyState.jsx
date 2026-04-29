export default function EmptyState({ title = "No data found", message = "Nothing to show right now." }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}