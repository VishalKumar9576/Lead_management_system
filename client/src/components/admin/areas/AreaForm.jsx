import { useState } from "react";
import Button from "../../common/ui/Button";
import Input from "../../common/ui/Input";

const initialForm = {
  area_name: "",
  area_code: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AreaForm({ onCreate, loading }) {
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
    <section className="border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-bold text-gray-900">Create New Area</h2>
      <p className="mt-1 text-sm text-gray-500">
        Add area codes for executive assignment and sales tracking.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="Area Name"
          name="area_name"
          value={form.area_name}
          onChange={handleChange}
          placeholder="Sitapura"
        />

        <Input
          label="Area Code"
          name="area_code"
          value={form.area_code}
          onChange={handleChange}
          placeholder="AREA001"
        />

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Jaipur"
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="Rajasthan"
        />

        <Input
          label="Pincode"
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
          placeholder="302022"
          className="md:col-span-2"
        />

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creating..." : "Create Area"}
          </Button>
        </div>
      </form>
    </section>
  );
}