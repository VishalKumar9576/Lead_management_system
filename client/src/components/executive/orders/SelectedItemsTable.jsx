import { ChevronDown, ChevronUp, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SelectedItemsTable({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const [open, setOpen] = useState(true);

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.selling_price),
    0
  );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
        Select products to create order.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Selected Items</h3>
          <p className="text-xs text-gray-500">
            {items.length} products • {totalQty} qty • ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        <span className="rounded-lg border border-gray-200 p-1.5 text-gray-600">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <>
          {/* Mobile card layout */}
          <div className="space-y-2 p-3 md:hidden">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.brand} • {item.unit_label}
                    </p>
                    <p className="mt-1 text-xs font-medium text-blue-600">
                      ₹{item.selling_price} each
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(item.product_id)}
                    className="shrink-0 rounded-lg border border-red-200 bg-white p-1.5 text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => onDecrease(item.product_id)}
                      className="rounded-md p-1 hover:bg-gray-100"
                    >
                      <Minus size={13} />
                    </button>

                    <span className="min-w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>

                    <button
  type="button"
  onClick={() => onIncrease(item.product_id)}
  disabled={item.quantity >= Number(item.stock_qty)}
  className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
>
  <Plus size={13} />
</button>

{item.quantity >= Number(item.stock_qty) && (
  <p className="mt-2 text-xs font-medium text-red-600">
    Only {item.stock_qty} available
  </p>
)}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-bold text-gray-900">
                      ₹{Number(item.quantity * item.selling_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/tablet table layout */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.product_id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-gray-900">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                      {item.brand} • {item.unit_label} • Stock {item.stock_qty}
                      {item.quantity >= Number(item.stock_qty) ? " • Limit reached" : ""}
                      </p>
                    </td>

                    <td className="px-3 py-2">₹{item.selling_price}</td>

                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => onDecrease(item.product_id)}
                          className="rounded-md p-1 hover:bg-gray-100"
                        >
                          <Minus size={13} />
                        </button>

                        <span className="min-w-6 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
  type="button"
  onClick={() => onIncrease(item.product_id)}
  disabled={item.quantity >= Number(item.stock_qty)}
  className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
>
  <Plus size={13} />
</button>
                      </div>
                    </td>

                    <td className="px-3 py-2 font-semibold text-gray-900">
                      ₹{Number(item.quantity * item.selling_price).toFixed(2)}
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onRemove(item.product_id)}
                        className="rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}