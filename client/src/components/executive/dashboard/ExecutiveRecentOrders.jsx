import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  ReceiptText,
  Store,
} from "lucide-react";
import EmptyState from "../../common/ui/EmptyState";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatStatus = (value) => {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
};

export default function ExecutiveRecentOrders({ orders, dues }) {
  const recentOrders = orders.slice(0, 5);
  const recentDues = dues.slice(0, 5);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <SectionTitle
            icon={ClipboardList}
            title="Recent Orders"
            subtitle="Latest orders created by you."
          />

          <Link
            to="/executive/orders"
            className="hidden items-center gap-1 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState title="No orders yet" message="Create your first order." />
        ) : (
          <div className="mt-4 divide-y divide-gray-100 border border-gray-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/executive/orders/${order.id}/items`}
                className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="border border-blue-100 bg-blue-50 p-2 text-blue-600">
                    <ReceiptText size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {order.order_number}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {order.shop_name || "-"} • {formatStatus(order.status)}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-sm font-bold text-gray-900">
                  {formatMoney(order.final_amount || order.total_amount)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <SectionTitle
            icon={AlertTriangle}
            title="Due Follow-ups"
            subtitle="Vendors with pending due collection."
          />

          <Link
            to="/executive/payments"
            className="hidden items-center gap-1 rounded-full border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 sm:inline-flex"
          >
            View Dues
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentDues.length === 0 ? (
          <EmptyState title="No dues" message="No pending due collection." />
        ) : (
          <div className="mt-4 divide-y divide-red-100 border border-red-100 bg-red-50">
            {recentDues.map((due) => (
              <Link
                key={due.id}
                to="/executive/payments"
                className="flex items-center justify-between gap-3 px-3 py-3 hover:bg-red-100/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="border border-red-100 bg-white p-2 text-red-600">
                    <Store size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {due.shop_name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {due.order_number}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-sm font-bold text-red-700">
                  {formatMoney(due.due_amount)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
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