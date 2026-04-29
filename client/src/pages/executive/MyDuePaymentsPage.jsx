import { useEffect, useState } from "react";
import { getMyDueOrdersApi } from "../../api/paymentApi";
import DuePaymentsTable from "../../components/executive/payments/DuePaymentsTable";
import PageHeader from "../../components/common/ui/PageHeader";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";

export default function MyDuePaymentsPage() {
  const [dueOrders, setDueOrders] = useState([]);

  useEffect(() => {
    const fetchDueOrders = async () => {
      try {
        const res = await getMyDueOrdersApi();
        setDueOrders(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch due orders", error);
      }
    };

    fetchDueOrders();
  }, []);

  return (
    <ExecutiveLayout>
      <DuePaymentsTable dueOrders={dueOrders} />
    </ExecutiveLayout>
  );
}