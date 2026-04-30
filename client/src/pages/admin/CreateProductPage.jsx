import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/ui/PageHeader";
import Button from "../../components/common/ui/Button";
import { createProductApi } from "../../api/productApi";

const initialForm = {
  product_code: "",
  product_name: "",
  brand: "",
  category: "",
  unit_label: "",
  mrp: "",
  selling_price: "",
  stock_qty: "",
  extra_fields: [],
};

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addExtraField = () => {
  setForm((prev) => ({
    ...prev,
    extra_fields: [...prev.extra_fields, { label: "", value: "" }],
  }));
};

const updateExtraField = (index, key, value) => {
  setForm((prev) => ({
    ...prev,
    extra_fields: prev.extra_fields.map((field, i) =>
      i === index ? { ...field, [key]: value } : field
    ),
  }));
};

const removeExtraField = (index) => {
  setForm((prev) => ({
    ...prev,
    extra_fields: prev.extra_fields.filter((_, i) => i !== index),
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericMrp = Number(form.mrp);
const numericSellingPrice = Number(form.selling_price);

if (numericSellingPrice > numericMrp) {
  alert("Selling price cannot be greater than MRP");
  return;
}

    try {
      setLoading(true);

      await createProductApi({
        ...form,
        mrp: Number(form.mrp),
        selling_price: Number(form.selling_price),
        stock_qty: Number(form.stock_qty),
extra_fields: form.extra_fields.filter(
  (field) => field.label.trim() && field.value.trim()
),
      });

      alert("Product created successfully");
      navigate("/admin/products");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Add Product"
        subtitle="Create new product item and opening stock."
        action={
          <Button variant="secondary" onClick={() => navigate("/admin/products")}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Product Code" value={form.product_code} onChange={(v) => updateField("product_code", v)} />
          <Input label="Product Name" value={form.product_name} onChange={(v) => updateField("product_name", v)} />
          <Input label="Brand" value={form.brand} onChange={(v) => updateField("brand", v)} />
          <Input label="Category" value={form.category} onChange={(v) => updateField("category", v)} />
          <Input label="Unit Label" placeholder="1kg / 1 box / 1 pc" value={form.unit_label} onChange={(v) => updateField("unit_label", v)} />
          <Input label="MRP" type="number" value={form.mrp} onChange={(v) => updateField("mrp", v)} />
          <Input label="Selling Price" type="number" value={form.selling_price} onChange={(v) => updateField("selling_price", v)} />
          <Input label="Stock Qty" type="number" value={form.stock_qty} onChange={(v) => updateField("stock_qty", v)} />
        </div>


        {/* main input grid--------------------------------------------------------------- */}



        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
  <div className="mb-3 flex items-center justify-between gap-3">
    {/* <div>
      <h3 className="text-sm font-semibold text-gray-900">More Product Fields</h3>
      <p className="text-xs text-gray-500">
        Add custom details like color, size, expiry, material, pack type, etc.
      </p>
    </div> */}

    <Button type="button" variant="secondary" onClick={addExtraField}>
      <Plus size={15} />
      Add More Field
    </Button>
  </div>

  <div className="space-y-3">
    {form.extra_fields.map((field, index) => (
      <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={field.label}
          onChange={(e) => updateExtraField(index, "label", e.target.value)}
          placeholder="Field label e.g. Color"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        <input
          value={field.value}
          onChange={(e) => updateExtraField(index, "value", e.target.value)}
          placeholder="Value e.g. Red"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={() => removeExtraField(index)}
          className="rounded-lg border border-red-200 px-3 py-2.5 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ))}
  </div>
</div>


{/* ------------------------------------- */}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            <Save size={16} />
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        required
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}