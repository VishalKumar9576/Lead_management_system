import { useState } from "react";
import Button from "../../common/ui/Button";

export default function AssignAreaForm({ executives, areas, onAssign, loading }) {
  const [form, setForm] = useState({
    executive_id: "",
    area_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAssign(form);
    if (success) {
      setForm({ executive_id: "", area_id: "" });
    }
  };

  return (
    <section className="border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-bold text-gray-900">Assign Area</h2>
      <p className="mt-1 text-sm text-gray-500">
        Select executive and assign business coverage area.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            Select Executive
          </span>
          <select
            name="executive_id"
            value={form.executive_id}
            onChange={handleChange}
            className="border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Choose executive</option>
            {executives.map((item) => (
              <option key={item.id} value={item.id}>
                {item.executive_code} - {item.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Select Area</span>
          <select
            name="area_id"
            value={form.area_id}
            onChange={handleChange}
            className="border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Choose area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.area_code} - {area.area_name}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Assigning..." : "Assign Area"}
          </Button>
        </div>
      </form>
    </section>
  );
}