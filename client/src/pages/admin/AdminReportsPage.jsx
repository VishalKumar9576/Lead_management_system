import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import { getAllAreasApi } from "../../api/areaApi";
import {
  getExecutivePerformanceListApi,
  getExecutiveAreaMappingsApi,
} from "../../api/executiveApi";
import { getAllVendorsForAdminApi } from "../../api/vendorApi";
import {
  getAdminAreaPerformance,
  getAdminDailyTrend,
  getAdminDueAlerts,
  getAdminExecutivePerformance,
  getAdminOrderReport,
  getAdminPaymentReport,
  getAdminReportSummary,
  getAdminVendorDueReport,
} from "../../api/reportApi";

const today = new Date().toISOString().slice(0, 10);
const firstDayOfMonth = new Date();
firstDayOfMonth.setDate(1);
const monthStart = firstDayOfMonth.toISOString().slice(0, 10);


const reportTitles = {
  overview: "Overview Report",
  executive: "Executive Sales Report",
  area: "Area Sales Report",
  "vendor-due": "Vendor Due Report",
  orders: "Order Report",
  payments: "Payment Report",
  target: "Target Report",
  daily: "Daily Sales Report",
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN");
};

const formatStatus = (value) => {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
};

export default function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeReport = searchParams.get("type") || "overview";

  const [filters, setFilters] = useState({
    from: monthStart,
    to: today,
    executive_id: "",
    area_id: "",
    vendor_id: "",
    status: "",
    payment_status: "",
    payment_mode: "",
    settlement_status: "",
    search: "",
  });

  const [summary, setSummary] = useState(null);
  const [executives, setExecutives] = useState([]);
  const [areas, setAreas] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [areaMappings, setAreaMappings] = useState([]);

  const [executiveReport, setExecutiveReport] = useState([]);
  const [areaReport, setAreaReport] = useState([]);
  const [vendorDueReport, setVendorDueReport] = useState([]);
  const [orderReport, setOrderReport] = useState([]);
  const [paymentReport, setPaymentReport] = useState([]);
  const [dailyReport, setDailyReport] = useState([]);
  const [dueReport, setDueReport] = useState([]);

  const [loading, setLoading] = useState(false);

  const loadMasterFilters = async () => {
    try {
      const [areaRes, executiveRes, vendorRes, mappingRes] = await Promise.all([
  getAllAreasApi(),
  getExecutivePerformanceListApi(),
  getAllVendorsForAdminApi(),
  getExecutiveAreaMappingsApi(),
]);

setAreas(areaRes?.data || []);
setExecutives(executiveRes?.data || []);
setVendors(vendorRes?.data || []);
setAreaMappings(mappingRes?.data || []);
    } catch (error) {
      console.error("Failed to load report filters", error);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);

      if (activeReport === "overview") {
        const res = await getAdminReportSummary(filters);
        setSummary(res?.data || null);
      }

      if (activeReport === "executive" || activeReport === "target") {
        const res = await getAdminExecutivePerformance(filters);
        setExecutiveReport(res?.data || []);
      }

      if (activeReport === "area") {
        const res = await getAdminAreaPerformance(filters);
        setAreaReport(res?.data || []);
      }

      if (activeReport === "vendor-due") {
        const res = await getAdminVendorDueReport(filters);
        setVendorDueReport(res?.data || []);
      }

      if (activeReport === "orders") {
        const res = await getAdminOrderReport(filters);
        setOrderReport(res?.data || []);
      }

      if (activeReport === "payments") {
        const res = await getAdminPaymentReport(filters);
        setPaymentReport(res?.data || []);
      }

      if (activeReport === "daily") {
        const res = await getAdminDailyTrend(filters);
        setDailyReport(res?.data || []);
      }

      if (activeReport === "dues") {
        const res = await getAdminDueAlerts(filters);
        setDueReport(res?.data || []);
      }
    } catch (error) {
      console.error("Failed to load report", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterFilters();
  }, []);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReport]);

  const applyFilters = () => {
    loadReport();
  };

  const resetFilters = () => {
    setFilters({
      from: monthStart,
      to: today,
      executive_id: "",
      area_id: "",
      vendor_id: "",
      status: "",
      payment_status: "",
      payment_mode: "",
      settlement_status: "",
      search: "",
    });
  };

  const targetRows = useMemo(() => {
    return executiveReport.map((item) => ({
      ...item,
      target_status:
        Number(item.target_percent || 0) >= 100 ? "Completed" : "Pending",
    }));
  }, [executiveReport]);

const filteredAreas = useMemo(() => {
  if (!filters.executive_id) return [];

  const assignedAreaIds = areaMappings
    .filter((item) => String(item.executive_id) === String(filters.executive_id))
    .map((item) => Number(item.area_id));

  return areas.filter((area) =>
    assignedAreaIds.includes(Number(area.id || area.area_id))
  );
}, [areas, areaMappings, filters.executive_id]);


const filteredVendors = useMemo(() => {
  if (!filters.executive_id || !filters.area_id) return [];

  return vendors.filter((vendor) => {
    const vendorExecutiveId = vendor.executive_id || vendor.executiveId;
    const vendorAreaId = vendor.area_id || vendor.areaId;

    return (
      String(vendorExecutiveId) === String(filters.executive_id) &&
      String(vendorAreaId) === String(filters.area_id)
    );
  });
}, [vendors, filters.executive_id, filters.area_id]);


  return (
    <AdminLayout>
      <div className="space-y-4">

        <ReportFilterBar
  filters={filters}
  setFilters={setFilters}
  areas={filteredAreas}
  executives={executives}
  vendors={filteredVendors}
          activeReport={activeReport}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        {loading && (
          <div className="border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Loading report...
          </div>
        )}

        <section className="border border-gray-200 bg-white p-4">
          <ReportTitle
            title={reportTitles[activeReport] || "Report"}
            subtitle="Result changes according to selected filters."
          />

          {activeReport === "overview" && <OverviewReport summary={summary} />}

          {activeReport === "executive" && (
            <ExecutiveReport rows={executiveReport} />
          )}

          {activeReport === "area" && <AreaReport rows={areaReport} />}

          {activeReport === "vendor-due" && (
            <VendorDueReport rows={vendorDueReport} />
          )}

          {activeReport === "orders" && <OrderReport rows={orderReport} />}

          {activeReport === "payments" && (
            <PaymentReport rows={paymentReport} />
          )}

          {activeReport === "target" && <TargetReport rows={targetRows} />}

          {activeReport === "daily" && <DailySalesReport rows={dailyReport} />}
        </section>
      </div>
    </AdminLayout>
  );
}

function ReportFilterBar({
  filters,
  setFilters,
  areas,
  executives,
  vendors,
  activeReport,
  onApply,
  onReset,
}) {
  const showPaymentFilters = activeReport === "payments";
  const showOrderPaymentStatus =
    activeReport === "orders" || activeReport === "vendor-due";
  const showVendorFilter =
    activeReport === "vendor-due" ||
    activeReport === "orders" ||
    activeReport === "payments";

  return (
    <div className="border border-gray-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="date"
          value={filters.from}
         onChange={(e) =>
  setFilters((prev) => ({
    ...prev,
    area_id: e.target.value,
    vendor_id: "",
  }))
}
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, to: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={filters.executive_id}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, executive_id: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Executives</option>
          {executives.map((item) => (
            <option key={item.id || item.executive_id} value={item.id || item.executive_id}>
              {item.executive_code} - {item.full_name || item.executive_name}
            </option>
          ))}
        </select>

        <select
  value={filters.area_id}
  disabled={!filters.executive_id}
  onChange={(e) =>
    setFilters((prev) => ({ ...prev, area_id: e.target.value }))
  }
  className={`border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 ${
    !filters.executive_id ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""
  }`}
>
  <option value="">
    {filters.executive_id ? "All Assigned Areas" : "Select executive first"}
  </option>
          {areas.map((item) => (
            <option key={item.id || item.area_id} value={item.id || item.area_id}>
              {item.area_code ? `${item.area_code} - ` : ""}
              {item.area_name}
            </option>
          ))}
        </select>

        {showVendorFilter && (
  <select
    value={filters.vendor_id}
    disabled={!filters.executive_id || !filters.area_id}
    onChange={(e) =>
      setFilters((prev) => ({ ...prev, vendor_id: e.target.value }))
    }
    className={`border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 ${
      !filters.executive_id || !filters.area_id
        ? "cursor-not-allowed bg-gray-100 text-gray-400"
        : ""
    }`}
  >
    <option value="">
      {!filters.executive_id
        ? "Select executive first"
        : !filters.area_id
        ? "Select area first"
        : "All Assigned Vendors"}
    </option>

    {vendors.map((item) => (
      <option key={item.id || item.vendor_id} value={item.id || item.vendor_id}>
        {item.vendor_code ? `${item.vendor_code} - ` : ""}
        {item.shop_name || item.vendor_name}
      </option>
    ))}
  </select>
)}

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value }))
          }
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Order Status</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="assigned">Assigned</option>
          <option value="delivered">Delivered</option>
          <option value="rejected">Rejected</option>
        </select>

        {showOrderPaymentStatus && (
          <select
            value={filters.payment_status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                payment_status: e.target.value,
              }))
            }
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        )}

        {showPaymentFilters && (
          <>
            <select
              value={filters.payment_mode}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  payment_mode: e.target.value,
                }))
              }
              className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Payment Mode</option>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>

            <select
              value={filters.settlement_status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  settlement_status: e.target.value,
                }))
              }
              className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Settlement</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
            </select>
          </>
        )}

        <input
          type="text"
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          placeholder="Search order, vendor, executive..."
          className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 xl:col-span-2"
        />

        <button
          type="button"
          onClick={onApply}
          className="border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Apply Filter
        </button>

        <button
          type="button"
          onClick={onReset}
          className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function OverviewReport({ summary }) {
  const cards = [
    ["Total Sales", formatMoney(summary?.totalSales)],
    ["Collected", formatMoney(summary?.paidAmount)],
    ["Pending Due", formatMoney(summary?.pendingDue), "danger"],
    ["Total Orders", summary?.totalOrders || 0],
    ["Pending Approval", summary?.pendingApproval || 0, "warning"],
    ["Average Order Value", formatMoney(summary?.avgOrderValue)],
    ["This Month Sales", formatMoney(summary?.monthSales)],
    ["Today Sales", formatMoney(summary?.todaySales)],
  ];

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, tone]) => (
        <div key={label} className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">{label}</p>
          <p
            className={`mt-2 text-xl font-bold ${
              tone === "danger"
                ? "text-red-600"
                : tone === "warning"
                ? "text-orange-600"
                : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ExecutiveReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No executive report data found."
      columns={[
        {
          label: "Executive",
          render: (row) => (
            <>
              <p className="font-semibold text-gray-900">
                {row.executive_name}
              </p>
              <p className="text-xs text-gray-500">{row.executive_code}</p>
            </>
          ),
        },
        { label: "Orders", render: (row) => row.total_orders || 0 },
        { label: "Sales", render: (row) => formatMoney(row.total_sales) },
        { label: "Paid", render: (row) => formatMoney(row.paid_amount) },
        {
          label: "Due",
          render: (row) => (
            <span className="font-semibold text-red-600">
              {formatMoney(row.due_amount)}
            </span>
          ),
        },
        { label: "Target", render: (row) => `${row.target_percent || 0}%` },
        { label: "Commission", render: (row) => formatMoney(row.commission) },
      ]}
    />
  );
}

function AreaReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No area report data found."
      columns={[
        { label: "Area", render: (row) => row.area_name || "-" },
        { label: "Executives", render: (row) => row.executives || 0 },
        { label: "Vendors", render: (row) => row.vendors || 0 },
        { label: "Orders", render: (row) => row.orders || 0 },
        { label: "Sales", render: (row) => formatMoney(row.total_sales) },
        {
          label: "Due",
          render: (row) => (
            <span className="font-semibold text-red-600">
              {formatMoney(row.due_amount)}
            </span>
          ),
        },
      ]}
    />
  );
}

function VendorDueReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No vendor due report found."
      columns={[
        {
          label: "Vendor",
          render: (row) => (
            <>
              <p className="font-semibold text-gray-900">{row.shop_name}</p>
              <p className="text-xs text-gray-500">
                {row.vendor_code} • {row.phone}
              </p>
            </>
          ),
        },
        { label: "Owner", render: (row) => row.owner_name || "-" },
        {
          label: "Executive",
          render: (row) => (
            <>
              <p>{row.executive_name}</p>
              <p className="text-xs text-gray-500">{row.executive_code}</p>
            </>
          ),
        },
        { label: "Area", render: (row) => row.area_name || "-" },
        { label: "Orders", render: (row) => row.total_orders || 0 },
        { label: "Sales", render: (row) => formatMoney(row.total_sales) },
        { label: "Paid", render: (row) => formatMoney(row.paid_amount) },
        {
          label: "Due",
          render: (row) => (
            <span className="font-semibold text-red-600">
              {formatMoney(row.due_amount)}
            </span>
          ),
        },
        { label: "Last Order", render: (row) => formatDate(row.last_order_date) },
      ]}
    />
  );
}

function OrderReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No order report found."
      columns={[
        {
          label: "Order",
          render: (row) => (
            <>
              <p className="font-semibold text-gray-900">{row.order_number}</p>
              <p className="text-xs text-gray-500">{formatDate(row.created_at)}</p>
            </>
          ),
        },
        { label: "Vendor", render: (row) => row.shop_name || "-" },
        { label: "Executive", render: (row) => row.executive_name || "-" },
        { label: "Area", render: (row) => row.area_name || "-" },
        { label: "Status", render: (row) => formatStatus(row.status) },
        { label: "Payment", render: (row) => formatStatus(row.payment_status) },
        { label: "Final", render: (row) => formatMoney(row.final_amount) },
        { label: "Paid", render: (row) => formatMoney(row.paid_amount) },
        {
          label: "Due",
          render: (row) => (
            <span className="font-semibold text-red-600">
              {formatMoney(row.due_amount)}
            </span>
          ),
        },
      ]}
    />
  );
}

function PaymentReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No payment report found."
      columns={[
        { label: "Payment No", render: (row) => row.payment_number || "-" },
        { label: "Order", render: (row) => row.order_number || "-" },
        { label: "Vendor", render: (row) => row.shop_name || "-" },
        { label: "Executive", render: (row) => row.executive_name || "-" },
        { label: "Mode", render: (row) => formatStatus(row.payment_mode) },
        { label: "Amount", render: (row) => formatMoney(row.amount_received) },
        { label: "Received By", render: (row) => formatStatus(row.received_by) },
        {
          label: "Settlement",
          render: (row) => formatStatus(row.settlement_status),
        },
        { label: "Date", render: (row) => formatDate(row.payment_date) },
      ]}
    />
  );
}

function TargetReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No target report data found."
      columns={[
        {
          label: "Executive",
          render: (row) => (
            <>
              <p className="font-semibold text-gray-900">
                {row.executive_name}
              </p>
              <p className="text-xs text-gray-500">{row.executive_code}</p>
            </>
          ),
        },
        { label: "Sales", render: (row) => formatMoney(row.total_sales) },
        { label: "Target %", render: (row) => `${row.target_percent || 0}%` },
        { label: "Status", render: (row) => row.target_status },
        { label: "Commission", render: (row) => formatMoney(row.commission) },
        {
          label: "Due",
          render: (row) => (
            <span className="font-semibold text-red-600">
              {formatMoney(row.due_amount)}
            </span>
          ),
        },
      ]}
    />
  );
}

function DailySalesReport({ rows }) {
  return (
    <ResponsiveReportTable
      rows={rows}
      emptyMessage="No daily sales data found."
      columns={[
        { label: "Date", render: (row) => formatDate(row.report_date) },
        { label: "Orders", render: (row) => row.orders || 0 },
        { label: "Executives", render: (row) => row.executives || 0 },
        { label: "Vendors", render: (row) => row.vendors || 0 },
        { label: "Sales", render: (row) => formatMoney(row.total_sales) },
        {
          label: "Due",
          render: (row) => (
            <span className="font-semibold text-red-600">
              {formatMoney(row.due_amount)}
            </span>
          ),
        },
      ]}
    />
  );
}

function ReportTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function ResponsiveReportTable({ rows, columns, emptyMessage }) {
  if (!rows.length) {
    return (
      <div className="mt-4 border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column.label} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIndex) => (
              <tr
                key={
                  row.id ||
                  row.vendor_id ||
                  row.executive_id ||
                  row.area_id ||
                  row.report_date ||
                  rowIndex
                }
              >
                {columns.map((column) => (
                  <td key={column.label} className="px-4 py-3">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={
              row.id ||
              row.vendor_id ||
              row.executive_id ||
              row.area_id ||
              row.report_date ||
              rowIndex
            }
            className="border border-gray-200 bg-white p-3"
          >
            {columns.map((column) => (
              <div
                key={column.label}
                className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-b-0"
              >
                <p className="text-xs font-medium text-gray-500">
                  {column.label}
                </p>
                <div className="max-w-[65%] text-right text-sm font-medium text-gray-900">
                  {column.render(row)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}