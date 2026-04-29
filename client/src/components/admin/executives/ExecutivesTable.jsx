import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import EmptyState from "../../common/ui/EmptyState";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ExecutivesTable({ executives, onView }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("sales_desc");

  const filteredExecutives = useMemo(() => {
    return executives
      .filter((item) => {
        const text = `${item.executive_code || ""} ${item.full_name || ""} ${
          item.phone || ""
        } ${item.email || ""}`.toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());
        const matchesStatus = status ? item.status === status : true;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "due_desc") {
          return Number(b.due_amount || 0) - Number(a.due_amount || 0);
        }

        if (sort === "orders_desc") {
          return Number(b.total_orders || 0) - Number(a.total_orders || 0);
        }

        if (sort === "name_asc") {
          return String(a.full_name || "").localeCompare(
            String(b.full_name || "")
          );
        }

        return Number(b.total_sales || 0) - Number(a.total_sales || 0);
      });
  }, [executives, search, status, sort]);

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code, phone, email..."
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="sales_desc">Top Sales</option>
            <option value="due_desc">Highest Due</option>
            <option value="orders_desc">Most Orders</option>
            <option value="name_asc">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-gray-900">Executive List</h2>
        <p className="mt-1 text-sm text-gray-500">
          {filteredExecutives.length} visible out of {executives.length} executives.
        </p>

        {filteredExecutives.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No executives found"
              message="Create your first executive to start field operations."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Executive</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Areas</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">View</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredExecutives.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-gray-900">{item.full_name}</p>
                        <p className="text-xs text-gray-500">{item.executive_code}</p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-medium">{item.phone}</p>
                        <p className="text-xs text-gray-500">{item.email || "-"}</p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        {item.assigned_areas || 0}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {item.total_orders || 0}
                      </td>

                      <td className="px-4 py-3 align-top font-semibold text-gray-900">
                        {formatMoney(item.total_sales)}
                      </td>

                      <td className="px-4 py-3 align-top font-semibold text-red-600">
                        {formatMoney(item.due_amount)}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {item.target_percent || 0}%
                      </td>

                      <td className="px-4 py-3 align-top">
                        <StatusText status={item.status} />
                      </td>

                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => onView(item.id)}
                          className="inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {filteredExecutives.map((item) => (
                <div key={item.id} className="border border-gray-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {item.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.executive_code}
                      </p>
                    </div>

                    <StatusText status={item.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <Info label="Phone" value={item.phone} />
                    <Info label="Areas" value={item.assigned_areas || 0} />
                    <Info label="Orders" value={item.total_orders || 0} />
                    <Info label="Sales" value={formatMoney(item.total_sales)} />
                    <Info
                      label="Due"
                      value={formatMoney(item.due_amount)}
                      danger
                    />
                    <Info
                      label="Target"
                      value={`${item.target_percent || 0}%`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onView(item.id)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Eye size={16} />
                    View Executive Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, danger }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`font-semibold ${danger ? "text-red-600" : "text-gray-900"}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function StatusText({ status }) {
  const color =
    status === "inactive"
      ? "text-orange-600"
      : status === "active"
      ? "text-green-700"
      : "text-gray-700";

  return (
    <span className={`text-sm font-semibold capitalize ${color}`}>
      {status || "-"}
    </span>
  );
}