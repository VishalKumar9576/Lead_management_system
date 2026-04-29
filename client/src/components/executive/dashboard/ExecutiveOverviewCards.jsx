import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  IndianRupee,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ExecutiveOverviewCards({ stats }) {
  const cards = [
    {
      label: "Total Vendors",
      value: stats.totalVendors,
      helper: "Onboarded shops",
      icon: Store,
      path: "/executive/vendors",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      helper: "Created by you",
      icon: ClipboardList,
      path: "/executive/orders",
    },
    {
      label: "Pending Approval",
      value: stats.pendingOrders,
      helper: "Waiting for admin",
      icon: Clock3,
      path: "/executive/orders?status=pending_approval",
      warning: true,
    },
    {
      label: "Assigned Orders",
      value: stats.assignedOrders,
      helper: "Ready for delivery",
      icon: Truck,
      path: "/executive/orders?status=assigned",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders,
      helper: "Completed orders",
      icon: CheckCircle2,
      path: "/executive/orders?status=delivered",
      success: true,
    },
    {
      label: "Due Amount",
      value: formatMoney(stats.totalDue),
      helper: "Pending collection",
      icon: Wallet,
      path: "/executive/payments",
      danger: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link key={card.label} to={card.path} className="block">
            <div className="h-full border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>

                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      card.danger
                        ? "text-red-600"
                        : card.warning
                        ? "text-orange-600"
                        : card.success
                        ? "text-green-700"
                        : "text-gray-900"
                    }`}
                  >
                    {card.value}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">{card.helper}</p>
                </div>

                <div
                  className={`border p-2 ${
                    card.danger
                      ? "border-red-100 bg-red-50 text-red-600"
                      : card.warning
                      ? "border-orange-100 bg-orange-50 text-orange-600"
                      : card.success
                      ? "border-green-100 bg-green-50 text-green-700"
                      : "border-blue-100 bg-blue-50 text-blue-600"
                  }`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}