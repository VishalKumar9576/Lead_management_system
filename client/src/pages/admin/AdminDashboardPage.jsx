import { useEffect, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import AdminStatsGrid from "../../components/admin/dashboard/AdminStatsGrid";
import AdminQuickReports from "../../components/admin/dashboard/AdminQuickReports";

import {
  getAdminDailyTrend,
  getAdminDueAlerts,
  getAdminReportSummary,
} from "../../api/reportApi";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [dueAlerts, setDueAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [summaryRes, trendRes, dueRes] = await Promise.all([
        getAdminReportSummary(),
        getAdminDailyTrend(),
        getAdminDueAlerts(),
      ]);

      setSummary(summaryRes?.data || null);
      setDailyTrend(trendRes?.data || []);
      setDueAlerts(dueRes?.data || []);
    } catch (error) {
      console.error("Failed to load admin dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1>Deepak</h1>
        {loading && (
          <div className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Loading dashboard...
          </div>
        )}

        <AdminStatsGrid summary={summary} />

        <AdminQuickReports
          summary={summary}
          dailyTrend={dailyTrend}
          dueAlerts={dueAlerts}
        />
      </div>
    </AdminLayout>
  );
}