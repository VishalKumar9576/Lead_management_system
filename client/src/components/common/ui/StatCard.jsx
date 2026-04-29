import Card from "./Card";

export default function StatCard({ label, value, helper, icon }) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            {value}
          </h3>
          {helper && (
            <p className="mt-2 text-xs text-gray-500 sm:text-sm">{helper}</p>
          )}
        </div>

        {icon ? (
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>
        ) : null}
      </div>
    </Card>
  );
}