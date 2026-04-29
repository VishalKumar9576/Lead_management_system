import { useMemo, useState } from "react";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../common/ui/EmptyState";
import SectionCard from "../../common/ui/SectionCard";

export default function VendorsTable({ vendors, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return vendors;

    return vendors.filter((item) =>
      [item.vendor_code, item.shop_name, item.owner_name, item.phone, item.area_name, item.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [vendors, search]);

  return (
    <SectionCard
      title="Total Vendors"
      headerAction={
        <div className="relative w-full sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendor, shop, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      }
    >
      {filteredVendors.length === 0 ? (
        <EmptyState title="No vendors available" message="Create your first vendor to start order flow." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Shop</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Area</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-semibold text-gray-900">{item.vendor_code}</td>
                  <td className="px-3 py-3">{item.shop_name}</td>
                  <td className="px-3 py-3">{item.owner_name}</td>
                  <td className="px-3 py-3">{item.phone}</td>
                  <td className="px-3 py-3">{item.area_name}</td>
                  <td className="px-3 py-3 capitalize">{item.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/executive/vendors/${item.id}`)} className="rounded-lg border p-2 hover:bg-gray-50">
                        <Eye size={16} />
                      </button>
                      <button
  onClick={() => navigate(`/executive/vendors/${item.id}/edit`)}
  className="rounded-lg border p-2 hover:bg-blue-50"
>
  <Pencil size={16} />
</button>
                      <button onClick={() => onDelete(item.id)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}