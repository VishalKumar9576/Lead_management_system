import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import EmptyState from "../../common/ui/EmptyState";
import SectionCard from "../../common/ui/SectionCard";

export default function DuePaymentsTable({ dueOrders }) {
  const [search, setSearch] = useState("");

  const filteredDueOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return dueOrders;

    return dueOrders.filter((item) =>
      [
        item.order_number,
        item.shop_name,
        item.vendor_phone,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [dueOrders, search]);

  const totalDue = filteredDueOrders.reduce(
    (sum, item) => sum + Number(item.due_amount || 0),
    0
  );

  return (
    <SectionCard
      title="My Due Orders"
      headerAction={
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      }
    >
      {filteredDueOrders.length === 0 ? (
        <EmptyState
          title="No due orders"
          message="Outstanding due collections will appear here."
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Due Orders</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {filteredDueOrders.length}
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm text-red-700">Total Due Amount</p>
              <p className="mt-2 text-2xl font-bold text-red-900">
                ₹ {totalDue}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Collection Focus</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">High</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Vendor</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Paid</th>
                  <th className="px-3 py-3">Due</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDueOrders.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-semibold text-gray-900">
                      {item.order_number}
                    </td>
                    <td className="px-3 py-3">{item.shop_name}</td>
                    <td className="px-3 py-3">{item.vendor_phone}</td>
                    <td className="px-3 py-3">₹ {item.total_amount}</td>
                    <td className="px-3 py-3">₹ {item.paid_amount}</td>
                    <td className="px-3 py-3 font-semibold text-red-600">
                      ₹ {item.due_amount}
                    </td>
                    <td className="px-3 py-3 capitalize">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </SectionCard>
  );
}