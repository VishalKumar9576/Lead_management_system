import { useMemo, useState } from "react";
import EmptyState from "../../common/ui/EmptyState";

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

const formatStatus = (value) => {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
};

export default function DueOrdersTable({ dueOrders }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const filteredDueOrders = useMemo(() => {
    return dueOrders.filter((item) => {
      const text = `${item.order_number || ""} ${item.shop_name || ""} ${
        item.owner_name || ""
      } ${item.executive_name || ""} ${item.executive_code || ""} ${
        item.area_name || ""
      } ${item.vendor_code || ""} ${item.vendor_phone || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = status ? item.status === status : true;
      const matchesPayment = paymentStatus
        ? item.payment_status === paymentStatus
        : true;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [dueOrders, search, status, paymentStatus]);

  const totals = useMemo(() => {
    return filteredDueOrders.reduce(
      (acc, item) => {
        acc.final += Number(item.final_amount || 0);
        acc.paid += Number(item.paid_amount || 0);
        acc.due += Number(item.due_amount || 0);
        return acc;
      },
      { final: 0, paid: 0, due: 0 }
    );
  }, [filteredDueOrders]);

  const highestDue = useMemo(() => {
    return [...filteredDueOrders].sort(
      (a, b) => Number(b.due_amount || 0) - Number(a.due_amount || 0)
    )[0];
  }, [filteredDueOrders]);

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 bg-white p-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Payments & Due Tracking
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track outstanding vendor dues, executive collections and pending payments.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Visible Due Orders"
          value={filteredDueOrders.length}
          helper={`${dueOrders.length} total due orders`}
        />
        <InfoCard
          label="Filtered Final Amount"
          value={formatMoney(totals.final)}
          helper="Total billing value"
        />
        <InfoCard
          label="Filtered Paid"
          value={formatMoney(totals.paid)}
          helper="Collected amount"
          success
        />
        <InfoCard
          label="Filtered Due"
          value={formatMoney(totals.due)}
          helper={
            highestDue
              ? `Highest: ${highestDue.executive_name} • ${formatMoney(
                  highestDue.due_amount
                )}`
              : "Pending collection"
          }
          danger
        />
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, vendor, executive, area..."
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 md:col-span-2"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Order Status</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Due Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            {filteredDueOrders.length} visible out of {dueOrders.length} due orders.
          </p>
        </div>

        {filteredDueOrders.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No due orders"
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
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Final</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredDueOrders.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-gray-900">
                          {item.order_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(item.created_at)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-gray-900">
                          {item.shop_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.vendor_code || "-"} • {item.vendor_phone || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-gray-900">
                          {item.executive_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.executive_code}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">{item.area_name}</td>

                      <td className="px-4 py-3 align-top font-semibold text-gray-900">
                        {formatMoney(item.final_amount)}
                      </td>

                      <td className="px-4 py-3 align-top font-semibold text-green-700">
                        {formatMoney(item.paid_amount)}
                      </td>

                      <td className="px-4 py-3 align-top font-bold text-red-600">
                        {formatMoney(item.due_amount)}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <StatusText status={item.status} />
                      </td>

                      <td className="px-4 py-3 align-top">
                        <StatusText status={item.payment_status} payment />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {filteredDueOrders.map((item) => (
                <div key={item.id} className="border border-gray-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Order</p>
                      <h3 className="font-bold text-gray-900">
                        {item.order_number}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    <StatusText status={item.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <Info label="Vendor" value={item.shop_name} />
                    <Info label="Vendor Phone" value={item.vendor_phone} />
                    <Info label="Executive" value={item.executive_name} />
                    <Info label="Area" value={item.area_name} />
                    <Info label="Final" value={formatMoney(item.final_amount)} />
                    <Info label="Paid" value={formatMoney(item.paid_amount)} success />
                    <Info label="Due" value={formatMoney(item.due_amount)} danger />
                    <Info
                      label="Payment"
                      value={formatStatus(item.payment_status)}
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

function InfoCard({ label, value, helper, success, danger }) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <h3
        className={`mt-2 text-xl font-bold ${
          success ? "text-green-700" : danger ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </h3>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
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
  const color =
    status === "unpaid"
      ? "text-red-600"
      : status === "partial"
      ? "text-orange-600"
      : status === "paid" || status === "delivered"
      ? "text-green-700"
      : payment
      ? "text-gray-700"
      : "text-blue-700";

  return (
    <span className={`text-sm font-semibold capitalize ${color}`}>
      {formatStatus(status)}
    </span>
  );
}