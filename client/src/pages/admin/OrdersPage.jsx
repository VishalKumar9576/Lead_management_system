import { useEffect, useState } from "react";
import {
  approveOrderApi,
  assignOrderApi,
  getAllOrdersForAdminApi,
  rejectOrderApi,
} from "../../api/orderApi";
import OrdersTable from "../../components/admin/orders/OrdersTable";
import PageHeader from "../../components/common/ui/PageHeader";
import AdminLayout from "../../layouts/AdminLayout";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrdersForAdminApi();
      setOrders(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);
      await approveOrderApi(id);
      await fetchOrders();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to approve order");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    if (!reason.trim()) {
      alert("Rejection reason is required");
      return;
    }

    try {
      setLoadingId(id);
      await rejectOrderApi(id, { rejection_reason: reason });
      await fetchOrders();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to reject order");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssign = async (id) => {
    try {
      setLoadingId(id);
      await assignOrderApi(id);
      await fetchOrders();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to assign order");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AdminLayout>
      <OrdersTable
        orders={orders}
        onApprove={handleApprove}
        onReject={handleReject}
        onAssign={handleAssign}
        loadingId={loadingId}
      />
    </AdminLayout>
  );
}