import { useEffect, useState } from "react";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";
import PageHeader from "../../components/common/ui/PageHeader";
import { getMyVendorsApi } from "../../api/vendorApi";
import { getExecutiveProductsApi } from "../../api/productApi";
import { createOrderApi } from "../../api/orderApi";
import CreateOrderPOS from "../../components/executive/orders/CreateOrderPOS";

export default function CreateOrderPage() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const vendorRes = await getMyVendorsApi();
        const productRes =
          await getExecutiveProductsApi();

        setVendors(vendorRes?.data || []);
        setProducts(productRes?.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadPage();
  }, []);

  const handleCreateOrder = async (
    payload
  ) => {
    try {
      setLoading(true);

      await createOrderApi(payload);

      alert("Order created successfully");
      return true;
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to create order"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExecutiveLayout>

      <CreateOrderPOS
        vendors={vendors}
        products={products}
        onSubmitOrder={handleCreateOrder}
        loading={loading}
      />
    </ExecutiveLayout>
  );
}