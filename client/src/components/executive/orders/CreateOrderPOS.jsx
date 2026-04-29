import { useMemo, useState } from "react";
import ProductSearchBox from "./ProductSearchBox";
import SelectedItemsTable from "./SelectedItemsTable";
import OrderTotalsCard from "./OrderTotalsCard";
import Button from "../../common/ui/Button";

export default function CreateOrderPOS({
  vendors,
  products,
  onSubmitOrder,
  loading,
}) {
  const [vendorId, setVendorId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderNote, setOrderNote] = useState("");
  const [items, setItems] = useState([]);

  const addProduct = (product) => {
    setItems((prev) => [
      ...prev,
      {
        ...product,
        product_id: product.id,
        quantity: 1,
      },
    ]);
  };

  const increaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.product_id !== id));
  };

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.quantity * Number(item.selling_price),
      0
    );
  }, [items]);

  const discountAmount = (subtotal * Number(discountPercent || 0)) / 100;
  const finalTotal = subtotal - discountAmount;

  const handleSubmit = async () => {
    if (!vendorId) {
      alert("Please select vendor");
      return;
    }

    if (items.length === 0) {
      alert("Please add products");
      return;
    }

    const payload = {
      vendor_id: Number(vendorId),
      discount_percent: Number(discountPercent),
      order_note: orderNote,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    const success = await onSubmitOrder(payload);

    if (success) {
      setItems([]);
      setVendorId("");
      setDiscountPercent(0);
      setOrderNote("");
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Vendor</span>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.shop_name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Order Note</span>
            <input
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Vendor request..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <ProductSearchBox
          products={products}
          selectedItems={items}
          onAddProduct={addProduct}
        />

        <div className="space-y-4">
          <SelectedItemsTable
            items={items}
            onIncrease={increaseQty}
            onDecrease={decreaseQty}
            onRemove={removeItem}
          />

          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="hidden rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800 md:block">
              Order will be sent to admin for approval. After approval, admin can assign it for delivery.
            </div>

            <OrderTotalsCard
              subtotal={subtotal}
              discountPercent={discountPercent}
              setDiscountPercent={setDiscountPercent}
            />
          </div>

          <div className="hidden justify-end lg:flex">
            <Button onClick={handleSubmit} disabled={loading} className="min-w-40">
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white p-3 shadow-lg lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Final Total</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{finalTotal.toFixed(2)}
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="px-5">
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}