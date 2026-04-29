import { useMemo, useState } from "react";
import Button from "../../common/ui/Button";
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

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
};

export default function OrdersTable({
  orders,
  onApprove,
  onReject,
  onAssign,
  loadingId,
}) {
  const [rejectReason, setRejectReason] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const text = `${order.order_number || ""} ${order.shop_name || ""} ${
        order.owner_name || ""
      } ${order.executive_name || ""} ${order.executive_code || ""} ${
        order.area_name || ""
      } ${order.status || ""} ${order.payment_status || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = status ? order.status === status : true;
      const matchesPayment = paymentStatus
        ? order.payment_status === paymentStatus
        : true;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, status, paymentStatus]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending_approval").length,
      approved: orders.filter((o) => o.status === "approved").length,
      assigned: orders.filter((o) => o.status === "assigned").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    };
  }, [orders]);

  const totals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        acc.final += Number(order.final_amount || 0);
        acc.paid += Number(order.paid_amount || 0);
        acc.due += Number(order.due_amount || 0);
        return acc;
      },
      { final: 0, paid: 0, due: 0 }
    );
  }, [filteredOrders]);

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 bg-white p-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <QuickStatus label="All" value={counts.all} />
        <QuickStatus label="Pending" value={counts.pending} warning />
        <QuickStatus label="Approved" value={counts.approved} />
        <QuickStatus label="Assigned" value={counts.assigned} />
        <QuickStatus label="Delivered" value={counts.delivered} success />
        <QuickStatus label="Rejected" value={counts.rejected} danger />
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search order, vendor, executive, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 md:col-span-2"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Order Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryBox label="Filtered Sales" value={formatMoney(totals.final)} />
        <SummaryBox label="Filtered Paid" value={formatMoney(totals.paid)} success />
        <SummaryBox label="Filtered Due" value={formatMoney(totals.due)} danger />
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order List</h2>
            <p className="text-sm text-gray-500">
              {filteredOrders.length} visible out of {orders.length} orders.
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No orders found"
              message="Try changing search or filter values."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Executive</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-gray-900">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-gray-900">
                          {order.shop_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.owner_name || "-"} • {order.area_name || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-gray-900">
                          {order.executive_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.executive_code}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-gray-900">
                          {formatMoney(order.final_amount)}
                        </p>
                        <p className="text-xs text-green-700">
                          Paid: {formatMoney(order.paid_amount)}
                        </p>
                        <p className="text-xs text-red-600">
                          Due: {formatMoney(order.due_amount)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <StatusText status={order.status} />
                      </td>

                      <td className="px-4 py-3 align-top">
                        <StatusText status={order.payment_status} payment />
                      </td>

                      <td className="px-4 py-3 align-top">
                        <OrderActions
                          order={order}
                          rejectReason={rejectReason}
                          setRejectReason={setRejectReason}
                          onApprove={onApprove}
                          onReject={onReject}
                          onAssign={onAssign}
                          loadingId={loadingId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Order</p>
                      <h3 className="font-bold text-gray-900">
                        {order.order_number}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <StatusText status={order.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <Info label="Vendor" value={order.shop_name} />
                    <Info label="Owner" value={order.owner_name} />
                    <Info label="Area" value={order.area_name} />
                    <Info label="Executive" value={order.executive_name} />
                    <Info label="Final" value={formatMoney(order.final_amount)} />
                    <Info label="Paid" value={formatMoney(order.paid_amount)} success />
                    <Info label="Due" value={formatMoney(order.due_amount)} danger />
                    <Info
                      label="Payment"
                      value={formatStatus(order.payment_status)}
                    />
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <OrderActions
                      order={order}
                      rejectReason={rejectReason}
                      setRejectReason={setRejectReason}
                      onApprove={onApprove}
                      onReject={onReject}
                      onAssign={onAssign}
                      loadingId={loadingId}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuickStatus({ label, value, success, danger, warning }) {
  return (
    <div className="border border-gray-200 bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          danger
            ? "text-red-600"
            : success
            ? "text-green-700"
            : warning
            ? "text-orange-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryBox({ label, value, success, danger }) {
  return (
    <div className="border border-gray-200 bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          success ? "text-green-700" : danger ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Info({ label, value, success, danger }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`font-semibold ${
          success ? "text-green-700" : danger ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function StatusText({ status, payment }) {
  const value = formatStatus(status);

  const color =
    status === "rejected" || status === "unpaid"
      ? "text-red-600"
      : status === "pending_approval" || status === "partial"
      ? "text-orange-600"
      : status === "delivered" || status === "paid"
      ? "text-green-700"
      : payment
      ? "text-gray-700"
      : "text-blue-700";

  return <span className={`text-sm font-semibold capitalize ${color}`}>{value}</span>;
}

function OrderActions({
  order,
  rejectReason,
  setRejectReason,
  onApprove,
  onReject,
  onAssign,
  loadingId,
}) {
  if (order.status === "pending_approval") {
    return (
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Reason if rejecting"
          value={rejectReason[order.id] || ""}
          onChange={(e) =>
            setRejectReason((prev) => ({
              ...prev,
              [order.id]: e.target.value,
            }))
          }
          className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onApprove(order.id)}
            disabled={loadingId === order.id}
          >
            {loadingId === order.id ? "Processing..." : "Approve"}
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => onReject(order.id, rejectReason[order.id] || "")}
            disabled={loadingId === order.id}
          >
            Reject
          </Button>
        </div>
      </div>
    );
  }

  if (order.status === "approved") {
    return (
      <Button
        onClick={() => onAssign(order.id)}
        disabled={loadingId === order.id}
      >
        {loadingId === order.id ? "Assigning..." : "Assign Order"}
      </Button>
    );
  }

  if (order.status === "rejected") {
    return (
      <p className="text-sm text-red-600">
        Reason: {order.rejection_reason || "Not provided"}
      </p>
    );
  }

  return <p className="text-sm text-gray-500">No action required</p>;
}