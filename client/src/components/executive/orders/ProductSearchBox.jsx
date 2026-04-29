import { Search, Plus } from "lucide-react";
import { useMemo, useState } from "react";

export default function ProductSearchBox({ products, selectedItems, onAddProduct }) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return products.slice(0, 8);

    return products
      .filter((item) =>
        [item.product_name, item.brand, item.category, item.product_code]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 12);
  }, [products, search]);

  const alreadyAdded = (id) =>
    selectedItems.some((item) => item.product_id === id);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="relative mb-3">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="max-h-[280px] overflow-y-auto">
        <table className="min-w-full text-left text-xs sm:text-sm">
          <thead className="sticky top-0 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-2 py-2">Product</th>
              <th className="px-2 py-2">Price</th>
              <th className="px-2 py-2 text-right">Add</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="px-2 py-2">
                  <p className="font-semibold text-gray-900">
                    {product.product_name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {product.brand} • {product.unit_label} • Stock {product.stock_qty}
                  </p>
                </td>

                <td className="px-2 py-2 font-medium text-blue-600">
                  ₹{product.selling_price}
                </td>

                <td className="px-2 py-2 text-right">
                  <button
                    type="button"
                    disabled={alreadyAdded(product.id)}
                    onClick={() => onAddProduct(product)}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white disabled:bg-gray-300"
                  >
                    <Plus size={13} />
                    {alreadyAdded(product.id) ? "Added" : "Add"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            No product found
          </p>
        )}
      </div>
    </div>
  );
}