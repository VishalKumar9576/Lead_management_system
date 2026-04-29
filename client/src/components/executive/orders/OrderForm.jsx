import { useState } from "react";
import Button from "../../common/ui/Button";
import Input from "../../common/ui/Input";
import SectionCard from "../../common/ui/SectionCard";

const initialForm = {
  vendor_id: "",
  total_amount: "",
  order_note: "",
};

export default function OrderForm({ vendors, onCreate, loading }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onCreate(form);
    if (success) {
      setForm(initialForm);
    }
  };

  return (
    <SectionCard
      title="Create Order"
      subtitle="Create vendor order with amount only. No editing later."
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Select Vendor</span>
          <select
            name="vendor_id"
            value={form.vendor_id}
            onChange={handleChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Choose vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.vendor_code} - {vendor.shop_name}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Total Amount"
          name="total_amount"
          value={form.total_amount}
          onChange={handleChange}
          placeholder="25000"
        />

        <Input
          label="Order Note"
          name="order_note"
          value={form.order_note}
          onChange={handleChange}
          placeholder="Monthly kirana order"
          className="md:col-span-2"
        />

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}