import { useEffect, useMemo, useState } from "react";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";
import Loader from "../../components/common/ui/Loader";
import { getMyVendorsApi } from "../../api/vendorApi";
import { getMyOrdersApi } from "../../api/orderApi";
import { getMyDueOrdersApi } from "../../api/paymentApi";
import ExecutiveOverviewCards from "../../components/executive/dashboard/ExecutiveOverviewCards";
import ExecutiveTrackingPanel from "../../components/executive/dashboard/ExecutiveTrackingPanel";
import ExecutiveRecentOrders from "../../components/executive/dashboard/ExecutiveRecentOrders";

export default function ExecutiveDashboardPage() {
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [vendorRes, orderRes, dueRes] = await Promise.all([
          getMyVendorsApi(),
          getMyOrdersApi(),
          getMyDueOrdersApi(),
        ]);

        setVendors(vendorRes?.data || []);
        setOrders(orderRes?.data || []);
        setDues(dueRes?.data || []);
      } catch (error) {
        console.error("Executive dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalOrderValue = orders.reduce(
      (sum, order) => sum + Number(order.final_amount || order.total_amount || 0),
      0
    );

    const totalPaid = orders.reduce(
      (sum, order) => sum + Number(order.paid_amount || 0),
      0
    );

    const totalDue = dues.reduce(
      (sum, order) => sum + Number(order.due_amount || 0),
      0
    );

    const collectionPercent =
      totalOrderValue > 0 ? Math.round((totalPaid / totalOrderValue) * 100) : 0;

    return {
      totalVendors: vendors.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending_approval").length,
      assignedOrders: orders.filter((o) => o.status === "assigned").length,
      deliveredOrders: orders.filter((o) => o.status === "delivered").length,
      totalOrderValue,
      totalPaid,
      totalDue,
      collectionPercent,
    };
  }, [vendors, orders, dues]);

  return (
    <ExecutiveLayout>
      {loading ? (
        <Loader text="Loading executive dashboard..." />
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 bg-white p-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Executive Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track vendors, orders, collections and pending field work.
            </p>
          </div>

          <ExecutiveOverviewCards stats={stats} />
          <ExecutiveTrackingPanel stats={stats} />
          <ExecutiveRecentOrders orders={orders} dues={dues} />
        </div>
      )}
    </ExecutiveLayout>
  );
}