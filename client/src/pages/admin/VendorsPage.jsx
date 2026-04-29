import { useEffect, useState } from "react";
import { getAllVendorsForAdminApi } from "../../api/vendorApi";
import VendorsTable from "../../components/admin/vendors/VendorsTable";
import PageHeader from "../../components/common/ui/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await getAllVendorsForAdminApi();
        setVendors(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch vendors", error);
      }
    };

    fetchVendors();
  }, []);

  return (
    <AdminLayout>
      <PageHeader
        title="Vendors Management"
        subtitle="Admin can view all onboarded vendors and coverage."
      />
      <VendorsTable vendors={vendors} />
    </AdminLayout>
  );
}