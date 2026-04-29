import { useEffect, useState } from "react";
import { getAdminDueOrdersApi, getPaymentSummaryApi } from "../../api/paymentApi";
import DueOrdersTable from "../../components/admin/payments/DueOrdersTable";
import PaymentSummaryCards from "../../components/admin/payments/PaymentSummaryCards";
import AdminLayout from "../../layouts/AdminLayout";

export default function PaymentsDuePage() {
  const [dueOrders, setDueOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [dueRes, summaryRes] = await Promise.all([
        getAdminDueOrdersApi(),
        getPaymentSummaryApi(),
      ]);

      setDueOrders(dueRes?.data || []);
      setSummary(summaryRes?.data || null);
    } catch (error) {
      console.error("Failed to load payment data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {loading && (
          <div className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Loading payment data...
          </div>
        )}

        <PaymentSummaryCards summary={summary} />
        <DueOrdersTable dueOrders={dueOrders} />
      </div>
    </AdminLayout>
  );
}