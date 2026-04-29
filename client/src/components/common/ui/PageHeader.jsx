export default function PageHeader({ title, subtitle, action = null }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}