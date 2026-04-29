import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMyOrdersApi, markDeliveredApi } from "../../api/orderApi";
import OrdersTable from "../../components/executive/orders/OrdersTable";
import PageHeader from "../../components/common/ui/PageHeader";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [searchParams] = useSearchParams();

  const statusFilter = searchParams.get("status");

  const fetchOrders = async () => {
    try {
      const res = await getMyOrdersApi();
      setOrders(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleDeliver = async (id) => {
    try {
      setLoadingId(id);
      await markDeliveredApi(id);
      await fetchOrders();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update delivery");
    } finally {
      setLoadingId(null);
    }
  };

  const pageTitle = statusFilter
    ? `${statusFilter.replace("_", " ")} Orders`
    : "My Orders";

  return (
    <ExecutiveLayout>

      <OrdersTable
        orders={filteredOrders}
        onDeliver={handleDeliver}
        loadingId={loadingId}
      />
    </ExecutiveLayout>
  );
}