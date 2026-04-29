import Card from "./Card";

export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  headerAction = null,
}) {
  return (
    <Card className={className}>
      {(title || subtitle || headerAction) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          {headerAction ? <div>{headerAction}</div> : null}
        </div>
      )}

      {children}
    </Card>
  );
}