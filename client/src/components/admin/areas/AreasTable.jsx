import { useMemo, useState } from "react";
import EmptyState from "../../common/ui/EmptyState";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AreasTable({ areas }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("sales_desc");

  const filteredAreas = useMemo(() => {
    return areas
      .filter((area) => {
        const text = `${area.area_name || ""} ${area.area_code || ""} ${
          area.city || ""
        } ${area.state || ""} ${area.pincode || ""}`.toLowerCase();

        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        if (sort === "due_desc") {
          return Number(b.due_amount || 0) - Number(a.due_amount || 0);
        }

        if (sort === "orders_desc") {
          return Number(b.total_orders || 0) - Number(a.total_orders || 0);
        }

        if (sort === "executives_desc") {
          return (
            Number(b.assigned_executives || 0) -
            Number(a.assigned_executives || 0)
          );
        }

        if (sort === "name_asc") {
          return String(a.area_name || "").localeCompare(
            String(b.area_name || "")
          );
        }

        return Number(b.total_sales || 0) - Number(a.total_sales || 0);
      });
  }, [areas, search, sort]);

  const totals = useMemo(() => {
    return filteredAreas.reduce(
      (acc, item) => {
        acc.sales += Number(item.total_sales || 0);
        acc.due += Number(item.due_amount || 0);
        acc.orders += Number(item.total_orders || 0);
        acc.vendors += Number(item.total_vendors || 0);
        acc.executives += Number(item.assigned_executives || 0);
        return acc;
      },
      {
        sales: 0,
        due: 0,
        orders: 0,
        vendors: 0,
        executives: 0,
      }
    );
  }, [filteredAreas]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Visible Areas" value={filteredAreas.length} />
        <SummaryCard label="Executives" value={totals.executives} />
        <SummaryCard label="Vendors" value={totals.vendors} />
        <SummaryCard label="Orders" value={totals.orders} />
        <SummaryCard
          label="Pending Due"
          value={formatMoney(totals.due)}
          danger
        />
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search area, code, city, state, pincode..."
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="sales_desc">Top Sales</option>
            <option value="due_desc">Highest Due</option>
            <option value="orders_desc">Most Orders</option>
            <option value="executives_desc">Most Executives</option>
            <option value="name_asc">Area Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-gray-900">Area List</h2>
        <p className="mt-1 text-sm text-gray-500">
          {filteredAreas.length} visible out of {areas.length} areas.
        </p>

        {filteredAreas.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No areas found"
              message="Create an area or change search/sort values."
            />
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Executives</th>
                    <th className="px-4 py-3">Vendors</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Due</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredAreas.map((area) => (
                    <tr key={area.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-gray-900">
                          {area.area_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {area.area_code}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-gray-900">
                          {area.city || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {area.state || "-"} • {area.pincode || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        {area.assigned_executives || 0}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {area.total_vendors || 0}
                      </td>

                      <td className="px-4 py-3 align-top">
                        {area.total_orders || 0}
                      </td>

                      <td className="px-4 py-3 align-top font-semibold text-gray-900">
                        {formatMoney(area.total_sales)}
                      </td>

                      <td className="px-4 py-3 align-top font-semibold text-red-600">
                        {formatMoney(area.due_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {filteredAreas.map((area) => (
                <div key={area.id} className="border border-gray-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {area.area_name}
                      </h3>
                      <p className="text-sm text-gray-500">{area.area_code}</p>
                    </div>

                    <p className="font-bold text-gray-900">
                      {formatMoney(area.total_sales)}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {area.city || "-"} • {area.state || "-"} •{" "}
                    {area.pincode || "-"}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <Info
                      label="Executives"
                      value={area.assigned_executives || 0}
                    />
                    <Info label="Vendors" value={area.total_vendors || 0} />
                    <Info label="Orders" value={area.total_orders || 0} />
                    <Info
                      label="Due"
                      value={formatMoney(area.due_amount)}
                      danger
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

function SummaryCard({ label, value, danger }) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <h3
        className={`mt-2 text-xl font-bold ${
          danger ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </h3>
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
        {value}
      </p>
    </div>
  );
}