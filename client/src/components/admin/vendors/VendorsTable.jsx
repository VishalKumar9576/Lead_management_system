import EmptyState from "../../common/ui/EmptyState";
import SectionCard from "../../common/ui/SectionCard";

export default function VendorsTable({ vendors }) {
  return (
    <SectionCard
      title="All Vendors"
      subtitle="Live vendor tracking from backend."
    >
      {vendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          message="Vendor data will appear here once executives create vendors."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3">Vendor Code</th>
                <th className="px-3 py-3">Shop Name</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Executive</th>
                <th className="px-3 py-3">Area</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-900">{item.vendor_code}</td>
                  <td className="px-3 py-3">{item.shop_name}</td>
                  <td className="px-3 py-3">{item.owner_name}</td>
                  <td className="px-3 py-3">{item.phone}</td>
                  <td className="px-3 py-3">{item.executive_name}</td>
                  <td className="px-3 py-3">{item.area_name}</td>
                  <td className="px-3 py-3">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}