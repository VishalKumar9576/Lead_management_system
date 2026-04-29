export default function OrderTotalsCard({
  subtotal,
  discountPercent,
  setDiscountPercent,
}) {
  const discountAmount = (subtotal * Number(discountPercent || 0)) / 100;
  const finalTotal = subtotal - discountAmount;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Order Total</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">Discount %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-between text-red-600">
          <span>Discount</span>
          <span>- ₹{discountAmount.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-100 pt-2">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Final</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}