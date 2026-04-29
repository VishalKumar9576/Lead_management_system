import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";
import PageHeader from "../../components/common/ui/PageHeader";
import Button from "../../components/common/ui/Button";
import SectionCard from "../../components/common/ui/SectionCard";
import Input from "../../components/common/ui/Input";
import Loader from "../../components/common/ui/Loader";
import { getMyVendorByIdApi, updateMyVendorApi } from "../../api/vendorApi";

export default function EditVendorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    vendor_code: "",
    area_name: "",
    owner_name: "",
    shop_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    gst_number: "",
    shop_address: "",
    landmark: "",
    pincode: "",
    status: "active",
    onboarding_date: "",
    notes: "",
    shop_image: null,
    current_shop_image_url: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const vendorRes = await getMyVendorByIdApi(id);
        const vendor = vendorRes?.data;

        setForm({
          vendor_code: vendor?.vendor_code || "",
          area_name: `${vendor?.area_code || ""} - ${vendor?.area_name || ""}`,
          owner_name: vendor?.owner_name || "",
          shop_name: vendor?.shop_name || "",
          email: vendor?.email || "",
          phone: vendor?.phone || "",
          alternate_phone: vendor?.alternate_phone || "",
          gst_number: vendor?.gst_number || "",
          shop_address: vendor?.shop_address || "",
          landmark: vendor?.landmark || "",
          pincode: vendor?.pincode || "",
          status: vendor?.status || "active",
          onboarding_date: vendor?.onboarding_date
            ? String(vendor.onboarding_date).slice(0, 10)
            : "",
          notes: vendor?.notes || "",
          shop_image: null,
          current_shop_image_url: vendor?.shop_image_url || "",
        });
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to load vendor");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

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

    try {
      setSaving(true);

      const formData = new FormData();

      [
        "owner_name",
        "shop_name",
        "email",
        "phone",
        "alternate_phone",
        "gst_number",
        "shop_address",
        "landmark",
        "pincode",
        "status",
        "onboarding_date",
        "notes",
      ].forEach((key) => {
        formData.append(key, form[key] || "");
      });

      if (form.shop_image) {
        formData.append("shop_image", form.shop_image);
      }

      await updateMyVendorApi(id, formData);

      alert("Vendor updated successfully");
      navigate(`/executive/vendors/${id}`);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update vendor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ExecutiveLayout>
        <Loader text="Loading vendor edit form..." />
      </ExecutiveLayout>
    );
  }

  return (
    <ExecutiveLayout>
      <PageHeader
        title="Edit Vendor"
        subtitle="Update vendor profile, contact, address and shop details."
        action={
          <Button variant="secondary" onClick={() => navigate(`/executive/vendors/${id}`)}>
            Back
          </Button>
        }
      />

      <SectionCard title="Vendor Edit Form" subtitle="All saved details are pre-filled from database.">
        <form onSubmit={handleSubmit} className="grid w-full min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="Vendor Code" name="vendor_code" value={form.vendor_code} disabled />
          <Input label="Area" name="area_name" value={form.area_name} disabled />

          <Input label="Owner Name" name="owner_name" value={form.owner_name} onChange={handleChange} />
          <Input label="Shop Name" name="shop_name" value={form.shop_name} onChange={handleChange} />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Alternate Phone" name="alternate_phone" value={form.alternate_phone} onChange={handleChange} />
          <Input label="GST Number" name="gst_number" value={form.gst_number} onChange={handleChange} />
          <Input label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} />
          <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
          <Input label="Onboarding Date" type="date" name="onboarding_date" value={form.onboarding_date} onChange={handleChange} />

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <Input label="Shop Address" name="shop_address" value={form.shop_address} onChange={handleChange} className="xl:col-span-2" />
          <Input label="Notes" name="notes" value={form.notes} onChange={handleChange} />

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Update Shop Image</span>
            <input
              type="file"
              name="shop_image"
              accept="image/*"
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
            />
          </label>

          {form.current_shop_image_url && (
            <div className="md:col-span-2 xl:col-span-3">
              <p className="mb-2 text-sm font-medium text-gray-700">Current Shop Image</p>
              <img
                src={form.current_shop_image_url}
                alt="Current shop"
                className="h-100 w-full max-w-md rounded-sm object-cover"
              />
            </div>
          )}

          <div className="md:col-span-2 xl:col-span-3">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? "Updating..." : "Update Vendor"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </ExecutiveLayout>
  );
}