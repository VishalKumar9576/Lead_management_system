import {
  ClipboardList,
  Clock3,
  IndianRupee,
  PackageCheck,
  ReceiptIndianRupee,
  TrendingUp,
} from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AdminStatsGrid({ summary }) {
  const collectionPercent =
    Number(summary?.totalSales || 0) > 0
      ? Math.round(
          (Number(summary?.paidAmount || 0) /
            Number(summary?.totalSales || 0)) *
            100
        )
      : 0;

  const stats = [
    {
      label: "Total Sales",
      value: formatMoney(summary?.totalSales),
      helper: "Total billing amount",
      icon: IndianRupee,
    },
    {
      label: "Collected",
      value: formatMoney(summary?.paidAmount),
      helper: `${collectionPercent}% collection`,
      icon: ReceiptIndianRupee,
      success: true,
    },
    {
      label: "Pending Due",
      value: formatMoney(summary?.pendingDue),
      helper: "Amount still pending",
      icon: TrendingUp,
      danger: true,
    },
    {
      label: "Total Orders",
      value: summary?.totalOrders || 0,
      helper: "All order records",
      icon: ClipboardList,
    },
    {
      label: "Pending Approval",
      value: summary?.pendingApproval || 0,
      helper: "Need admin action",
      icon: Clock3,
      warning: true,
    },
    {
      label: "Delivered Orders",
      value: summary?.deliveredOrders || 0,
      helper: "Completed order flow",
      icon: PackageCheck,
      success: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {item.label}
                </p>

                <h2
                  className={`mt-2 text-2xl font-bold ${
                    item.danger
                      ? "text-red-600"
                      : item.warning
                      ? "text-orange-600"
                      : item.success
                      ? "text-green-700"
                      : "text-gray-900"
                  }`}
                >
                  {item.value}
                </h2>

                <p className="mt-1 text-xs text-gray-500">{item.helper}</p>
              </div>

              <div
                className={`border p-2 ${
                  item.danger
                    ? "border-red-100 bg-red-50 text-red-600"
                    : item.warning
                    ? "border-orange-100 bg-orange-50 text-orange-600"
                    : item.success
                    ? "border-green-100 bg-green-50 text-green-700"
                    : "border-blue-100 bg-blue-50 text-blue-600"
                }`}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}