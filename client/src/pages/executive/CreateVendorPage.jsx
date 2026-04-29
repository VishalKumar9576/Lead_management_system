import { useEffect, useState } from "react";
import { getAllAreasApi } from "../../api/areaApi";
import { createVendorApi } from "../../api/vendorApi";
import VendorForm from "../../components/executive/vendors/VendorForm";
import PageHeader from "../../components/common/ui/PageHeader";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";

export default function CreateVendorPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await getAllAreasApi();
        setAreas(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch areas", error);
      }
    };

    fetchAreas();
  }, []);

  const handleCreateVendor = async (formData) => {
    try {
      setLoading(true);
      await createVendorApi(formData);
      alert("Vendor created successfully");
      return true;
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create vendor");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExecutiveLayout>
      <VendorForm areas={areas} onCreate={handleCreateVendor} loading={loading} />
    </ExecutiveLayout>
  );
}