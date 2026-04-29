import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  IndianRupee,
  MapPinned,
  PackageCheck,
  ReceiptText,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
};

export default function AdminQuickReports({
  summary,
  dailyTrend = [],
  dueAlerts = [],
}) {
  const highestDueExecutive = [...dueAlerts].sort(
    (a, b) => Number(b.total_due || 0) - Number(a.total_due || 0)
  )[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="border border-gray-200 bg-white p-4">
          <SectionTitle
            icon={AlertTriangle}
            title="Admin Attention"
            subtitle="Important items that need quick review."
          />

          <div className="mt-4 divide-y divide-gray-100 border border-gray-100">
            <InfoRow
              icon={ClockIcon}
              label="Orders Waiting Approval"
              value={summary?.pendingApproval || 0}
              tone="warning"
            />

            <InfoRow
              icon={IndianRupee}
              label="Pending Due Amount"
              value={formatMoney(summary?.pendingDue)}
              tone="danger"
            />

            <InfoRow
              icon={UserRound}
              label="Highest Due Executive"
              value={highestDueExecutive?.executive_name || "No due data"}
              helper={
                highestDueExecutive
                  ? formatMoney(highestDueExecutive.total_due)
                  : ""
              }
              tone="danger"
            />
          </div>
        </section>

        <section className="border border-gray-200 bg-white p-4">
          <SectionTitle
            icon={ArrowRight}
            title="Quick Navigation"
            subtitle="Open important admin pages quickly."
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <QuickLink to="/admin/areas" icon={MapPinned} label="Areas" />
            <QuickLink
              to="/admin/executives"
              icon={UsersRound}
              label="Executives"
            />
            <QuickLink
              to="/admin/orders"
              icon={ClipboardCheck}
              label="Orders"
            />
            <QuickLink
              to="/admin/payments"
              icon={CreditCard}
              label="Payments"
            />
          </div>
        </section>
      </div>

      <section className="border border-gray-200 bg-white p-4">
        <SectionTitle
          icon={BarChart3}
          title="Daily Sales Trend"
          subtitle="Recent daily sales movement across executives."
        />

        {dailyTrend.length === 0 ? (
          <EmptyText message="No daily sales trend found." />
        ) : (
          <div className="mt-4 space-y-3">
            {dailyTrend.slice(0, 5).map((row, index) => {
              const max = Math.max(
                ...dailyTrend.map((item) => Number(item.total_sales || 0))
              );

              const width =
                max > 0
                  ? Math.max((Number(row.total_sales || 0) / max) * 100, 6)
                  : 0;

              return (
                <div
                  key={row.report_date || index}
                  className="border border-gray-100 bg-white p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="border border-blue-100 bg-blue-50 p-2 text-blue-600">
                        <CalendarDays size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatDate(row.report_date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Orders: {row.orders || 0} • Executives:{" "}
                          {row.executives || 0} • Vendors: {row.vendors || 0}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-gray-900">
                      {formatMoney(row.total_sales)}
                    </p>
                  </div>

                  <div className="mt-3 h-2 bg-gray-100">
                    <div
                      className="h-2 bg-blue-600"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border border-gray-200 bg-white p-4">
        <SectionTitle
          icon={TrendingUp}
          title="Due Recovery Alerts"
          subtitle="Executives with highest pending dues."
        />

        {dueAlerts.length === 0 ? (
          <EmptyText message="No due recovery alerts found." />
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Executive</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Due Orders</th>
                    <th className="px-4 py-3">Total Due</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {dueAlerts.slice(0, 8).map((row, index) => (
                    <tr key={row.executive_id || index}>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {row.executive_name || "-"}
                      </td>
                      <td className="px-4 py-3">{row.executive_code || "-"}</td>
                      <td className="px-4 py-3">{row.due_orders || 0}</td>
                      <td className="px-4 py-3 font-bold text-red-600">
                        {formatMoney(row.total_due)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/reports?type=vendor-due&executive_id=${row.executive_id}`}
                          className="inline-flex items-center gap-1 border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View Due
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {dueAlerts.slice(0, 8).map((row, index) => (
                <div
                  key={row.executive_id || index}
                  className="border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {row.executive_name || "-"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {row.executive_code || "-"}
                      </p>
                    </div>

                    <p className="font-bold text-red-600">
                      {formatMoney(row.total_due)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-sm">
                    <span className="text-gray-500">
                      Due Orders: {row.due_orders || 0}
                    </span>

                    <Link
                      to={`/admin/reports?type=vendor-due&executive_id=${row.executive_id}`}
                      className="font-semibold text-blue-600"
                    >
                      View Due
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ClockIcon(props) {
  return <ReceiptText {...props} />;
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="border border-blue-100 bg-blue-50 p-2 text-blue-600">
        <Icon size={18} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, helper, tone }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-3 text-sm">
      <div className="flex items-center gap-3">
        <div
          className={`border p-2 ${
            tone === "danger"
              ? "border-red-100 bg-red-50 text-red-600"
              : tone === "warning"
              ? "border-orange-100 bg-orange-50 text-orange-600"
              : "border-blue-100 bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={16} />
        </div>

        <div>
          <p className="font-medium text-gray-700">{label}</p>
          {helper && <p className="text-xs text-gray-500">{helper}</p>}
        </div>
      </div>

      <p
        className={`font-bold ${
          tone === "danger"
            ? "text-red-600"
            : tone === "warning"
            ? "text-orange-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        {label}
      </span>

      <ArrowRight size={15} className="transition group-hover:translate-x-1" />
    </Link>
  );
}

function EmptyText({ message }) {
  return (
    <div className="mt-4 border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}