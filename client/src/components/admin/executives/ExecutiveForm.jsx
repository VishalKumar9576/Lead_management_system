import { useState } from "react";
import Button from "../../common/ui/Button";
import Input from "../../common/ui/Input";

const initialForm = {
  executive_code: "",
  full_name: "",
  phone: "",
  email: "",
  password: "",
  pan_number: "",
  aadhar_number: "",
  bank_account_name: "",
  bank_account_number: "",
  bank_ifsc: "",
  bank_name: "",
  commission_percent: 20,
  joined_date: "",
  notes: "",
};

export default function ExecutiveForm({ onCreate, loading }) {
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
      <h2 className="text-lg font-bold text-gray-900">Executive Details</h2>
      <p className="mt-1 text-sm text-gray-500">
        Add login credentials, commission and account details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <Input label="Executive Code" name="executive_code" value={form.executive_code} onChange={handleChange} placeholder="EXEC002" />
        <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Amit Singh" />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="7777777777" />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} placeholder="amit@example.com" />
        <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Amit@123" />
        <Input label="Commission %" name="commission_percent" value={form.commission_percent} onChange={handleChange} placeholder="20" />

        <Input label="PAN Number" name="pan_number" value={form.pan_number} onChange={handleChange} placeholder="ABCDE1234F" />
        <Input label="Aadhaar Number" name="aadhar_number" value={form.aadhar_number} onChange={handleChange} placeholder="123412341234" />
        <Input label="Joined Date" type="date" name="joined_date" value={form.joined_date} onChange={handleChange} />

        <Input label="Bank Account Name" name="bank_account_name" value={form.bank_account_name} onChange={handleChange} placeholder="Amit Singh" />
        <Input label="Bank Account Number" name="bank_account_number" value={form.bank_account_number} onChange={handleChange} placeholder="987654321000" />
        <Input label="IFSC" name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} placeholder="HDFC0001234" />

        <Input label="Bank Name" name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="HDFC Bank" />
        <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Field sales executive" className="xl:col-span-2" />

        <div className="md:col-span-2 xl:col-span-3">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creating..." : "Create Executive"}
          </Button>
        </div>
      </form>
    </section>
  );
}