import { useState } from "react";
import Button from "../../common/ui/Button";
import Input from "../../common/ui/Input";
import SectionCard from "../../common/ui/SectionCard";

const initialForm = {
  vendor_code: "",
  area_id: "",
  owner_name: "",
  shop_name: "",
  email: "",
  phone: "",
  alternate_phone: "",
  gst_number: "",
  shop_address: "",
  landmark: "",
  pincode: "",
  onboarding_date: "",
  notes: "",
  shop_image: null,
};

export default function VendorForm({ areas, onCreate, loading }) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "shop_image") {
      setForm((prev) => ({ ...prev, shop_image: files?.[0] || null }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        formData.append(key, value);
      }
    });

    const success = await onCreate(formData);
    if (success) {
      setForm(initialForm);
    }
  };

  return (
    <SectionCard
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Input label="Vendor Code" name="vendor_code" value={form.vendor_code} onChange={handleChange} placeholder="VEND003" />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Area</span>
          <select
            name="area_id"
            value={form.area_id}
            onChange={handleChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.area_code} - {area.area_name}
              </option>
            ))}
          </select>
        </label>
        <Input label="Owner Name" name="owner_name" value={form.owner_name} onChange={handleChange} placeholder="vishal kumar" />
        <Input label="Shop Name" name="shop_name" value={form.shop_name} onChange={handleChange} placeholder="Sharma Kirana Store" />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9090909090" />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} placeholder="shop@example.com" />
        <Input label="Alternate Phone" name="alternate_phone" value={form.alternate_phone} onChange={handleChange} placeholder="9191919191" />
        <Input label="GST Number" name="gst_number" value={form.gst_number} onChange={handleChange} placeholder="08ABCDE1234F1Z5" />
        <Input label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Near temple" />
        <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="302022" />
        <Input label="Onboarding Date" type="date" name="onboarding_date" value={form.onboarding_date} onChange={handleChange} />
        <Input label="Shop Address" name="shop_address" value={form.shop_address} onChange={handleChange} placeholder="Main market, Jaipur" className="xl:col-span-2" />
        <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Regular grocery vendor" />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Shop Image</span>
          <input
            type="file"
            name="shop_image"
            accept="image/*"
            onChange={handleChange}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-3">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creating..." : "Create Vendor"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}