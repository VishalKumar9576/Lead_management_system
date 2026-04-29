import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Truck, Eye } from "lucide-react";
import Button from "../../common/ui/Button";
import EmptyState from "../../common/ui/EmptyState";
import SectionCard from "../../common/ui/SectionCard";

export default function OrdersTable({ orders, onDeliver, loadingId }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;

    return orders.filter((order) =>
      [
        order.order_number,
        order.shop_name,
        order.status,
        order.payment_status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, search]);

  const getAmount = (order) =>
    order.final_amount || order.total_amount || order.total_amount || 0;

  return (
    <SectionCard
      headerAction={
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order/vendor/status..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      }
    >
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          message="Create your first order from Create Order page."
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <div>
                  <p className="text-xs text-gray-500">Order</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.order_number}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Vendor</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.shop_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Final Amount</p>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{Number(getAmount(order)).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Due</p>
                  <p className="text-sm font-bold text-red-600">
                    ₹{Number(order.due_amount || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Order Status</p>
                  <p className="text-sm font-semibold capitalize text-blue-700">
                    {String(order.status || "-").replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="text-sm font-semibold capitalize text-gray-900">
                    {order.payment_status || "unpaid"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 sm:grid-cols-4">
                <p>
                  Subtotal:{" "}
                  <span className="font-semibold text-gray-900">
                    ₹{Number(order.subtotal_amount || getAmount(order)).toFixed(2)}
                  </span>
                </p>
                <p>
                  Discount:{" "}
                  <span className="font-semibold text-gray-900">
                    {order.discount_percent || 0}%
                  </span>
                </p>
                <p>
                  Paid:{" "}
                  <span className="font-semibold text-green-700">
                    ₹{Number(order.paid_amount || 0).toFixed(2)}
                  </span>
                </p>
                <p>
                  Created:{" "}
                  <span className="font-semibold text-gray-900">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="px-3 py-2"
                  onClick={() => navigate(`/executive/orders/${order.id}/items`)}
                >
                  <Eye size={15} />
                  View Items
                </Button>

                {order.status === "assigned" && (
                  <Button
                    onClick={() => onDeliver(order.id)}
                    disabled={loadingId === order.id}
                    className="px-3 py-2"
                  >
                    <Truck size={15} />
                    {loadingId === order.id ? "Updating..." : "Mark Delivered"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}