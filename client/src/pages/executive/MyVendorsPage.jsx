import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { deleteMyVendorApi, getMyVendorsApi, updateMyVendorApi } from "../../api/vendorApi";
import VendorsTable from "../../components/executive/vendors/VendorsTable";
import PageHeader from "../../components/common/ui/PageHeader";
import Button from "../../components/common/ui/Button";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";

export default function MyVendorsPage() {
  const [vendors, setVendors] = useState([]);

  const fetchVendors = async () => {
    const res = await getMyVendorsApi();
    setVendors(res?.data || []);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleEdit = async (vendor) => {
    const shop_name = prompt("Update shop name", vendor.shop_name);
    if (!shop_name) return;

    await updateMyVendorApi(vendor.id, {
      owner_name: vendor.owner_name,
      shop_name,
      phone: vendor.phone,
      email: vendor.email || "",
      shop_address: vendor.shop_address || "Not provided",
      landmark: vendor.landmark || "",
      pincode: vendor.pincode || "",
      status: vendor.status || "active",
      notes: vendor.notes || "",
    });

    await fetchVendors();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this vendor? If vendor has orders, delete will be blocked.")) return;

    try {
      await deleteMyVendorApi(id);
      await fetchVendors();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete vendor");
    }
  };

  return (
    <ExecutiveLayout>
      {/* <PageHeader
        action={
          <Link to="/executive/vendors/create">
            <Button>
              <Plus size={16} />
              Create Vendor
            </Button>
          </Link>
        }
      /> */}

      <VendorsTable vendors={vendors} onEdit={handleEdit} onDelete={handleDelete} />
    </ExecutiveLayout>
  );
}