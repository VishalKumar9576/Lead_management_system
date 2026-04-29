import SectionCard from "../../common/ui/SectionCard";
import EmptyState from "../../common/ui/EmptyState";

export default function OrderItemsTable({ items }) {
  if (!items.length) {
    return (
      <SectionCard title="Order Items">
        <EmptyState title="No items found" message="No products found in this order." />
      </SectionCard>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.line_total || 0),
    0
  );

  return (
    <SectionCard
      title="Order Items"
      subtitle="Selected products in this vendor order."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-semibold text-gray-900">
                  {item.product_name}
                </td>
                <td className="px-3 py-2">{item.brand}</td>
                <td className="px-3 py-2">{item.unit_label}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">₹{Number(item.unit_price).toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-bold text-gray-900">
                  ₹{Number(item.line_total).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t bg-gray-50">
              <td colSpan="5" className="px-3 py-3 text-right font-semibold">
                Items Total
              </td>
              <td className="px-3 py-3 text-right font-bold">
                ₹{total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </SectionCard>
  );
}