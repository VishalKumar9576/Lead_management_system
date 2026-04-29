import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  IndianRupee,
  Loader2,
  PackageCheck,
  RefreshCw,
  Store,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import ExecutiveLayout from "../../layouts/ExecutiveLayout";
import { getMyVendorsApi } from "../../api/vendorApi";
import {
  getExecutiveAreaSales,
  getExecutiveCommission,
  getExecutiveDailyTrend,
  getExecutiveDueReports,
  getExecutiveReportSummary,
  getExecutiveTopVendors,
  getExecutiveVendorSales,
} from "../../api/reportApi";

const today = new Date().toISOString().slice(0, 10);

const firstDayOfMonth = new Date();
firstDayOfMonth.setDate(1);
const monthStart = firstDayOfMonth.toISOString().slice(0, 10);

const emptySummary = {
  totalSales: 0,
  paidAmount: 0,
  pendingDue: 0,
  ordersCount: 0,
  vendorsServed: 0,
  avgOrderValue: 0,
  targetPercent: 0,
  commission: 0,
};

const reportTitles = {
  overview: "Overview Report",
  "top-vendors": "Top Vendors Report",
  "vendor-sales": "Vendor Sales Report",
  "area-sales": "Area Sales Report",
  dues: "Pending Dues Report",
  daily: "Daily Sales Report",
  commission: "Commission Report",
};

const reportFilterConfig = {
  overview: {
    title: "Overview Filters",
    subtitle: "Check overall sales summary by date and order status.",
    showDate: true,
    showVendor: false,
    showArea: false,
    showStatus: true,
    showSort: false,
  },
  "top-vendors": {
    title: "Top Vendor Filters",
    subtitle: "Find best vendors by sales, orders or due amount.",
    showDate: true,
    showVendor: false,
    showArea: true,
    showStatus: true,
    showSort: true,
    sortOptions: [
      { value: "sales_desc", label: "Highest Sales" },
      { value: "due_desc", label: "Highest Due" },
      { value: "orders_desc", label: "Most Orders" },
    ],
  },
  "vendor-sales": {
    title: "Vendor Sales Filters",
    subtitle: "Select vendor, area and status to check exact vendor sales.",
    showDate: true,
    showVendor: true,
    showArea: true,
    showStatus: true,
    showSort: true,
    sortOptions: [
      { value: "sales_desc", label: "Highest Sales" },
      { value: "due_desc", label: "Highest Due" },
      { value: "orders_desc", label: "Most Orders" },
    ],
  },
  "area-sales": {
    title: "Area Sales Filters",
    subtitle: "Check sales and dues by assigned area.",
    showDate: true,
    showVendor: false,
    showArea: true,
    showStatus: true,
    showSort: true,
    sortOptions: [
      { value: "sales_desc", label: "Highest Sales" },
      { value: "due_desc", label: "Highest Due" },
      { value: "orders_desc", label: "Most Orders" },
    ],
  },
  dues: {
    title: "Due Collection Filters",
    subtitle: "Find vendors where payment collection is pending.",
    showDate: true,
    showVendor: true,
    showArea: true,
    showStatus: true,
    showSort: true,
    sortOptions: [
      { value: "due_desc", label: "Highest Due First" },
      { value: "oldest_due", label: "Oldest Due First" },
      { value: "vendor_asc", label: "Vendor A-Z" },
    ],
  },
  daily: {
    title: "Daily Sales Filters",
    subtitle: "Track date-wise sales, orders and dues.",
    showDate: true,
    showVendor: false,
    showArea: false,
    showStatus: true,
    showSort: false,
  },
  commission: {
    title: "Commission Filters",
    subtitle: "Check commission and target status by date range.",
    showDate: true,
    showVendor: false,
    showArea: false,
    showStatus: false,
    showSort: false,
  },
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

export default function ReportsPage() {
  const [searchParams] = useSearchParams();
  const activeReport = searchParams.get("type") || "overview";

  const [filters, setFilters] = useState({
  from: monthStart,
  to: today,
  vendor_id: "",
  area_id: "",
  status: "",
  sort: "",
});

  const [vendors, setVendors] = useState([]);

  const [summary, setSummary] = useState(emptySummary);
  const [vendorSales, setVendorSales] = useState([]);
  const [areaSales, setAreaSales] = useState([]);
  const [dueList, setDueList] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [commissionData, setCommissionData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");

  const allAssignedAreas = useMemo(() => {
  const map = new Map();

  vendors.forEach((vendor) => {
    const areaId = vendor.area_id || vendor.areaId;
    const areaName = vendor.area_name || vendor.area || "Assigned Area";

    if (areaId) {
      map.set(String(areaId), {
        id: areaId,
        area_name: areaName,
      });
    }
  });

  return Array.from(map.values());
}, [vendors]);

const vendorAreas = useMemo(() => {
  if (!filters.vendor_id) return allAssignedAreas;

  const selectedVendor = vendors.find(
    (vendor) =>
      String(vendor.id || vendor.vendor_id) === String(filters.vendor_id)
  );

  if (!selectedVendor) return [];

  return [
    {
      id: selectedVendor.area_id || selectedVendor.areaId,
      area_name:
        selectedVendor.area_name || selectedVendor.area || "Assigned Area",
    },
  ].filter((area) => area.id);
}, [vendors, filters.vendor_id, allAssignedAreas]);

  const fetchFilterData = async () => {
    try {
      setMetaLoading(true);
      const vendorRes = await getMyVendorsApi();

      const vendorList =
        vendorRes?.data?.vendors ||
        vendorRes?.data ||
        vendorRes?.vendors ||
        vendorRes?.result ||
        [];

      setVendors(Array.isArray(vendorList) ? vendorList : []);
    } catch (err) {
      console.error("Report filter data error:", err);
    } finally {
      setMetaLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const apiFilters = {
  from: filters.from,
  to: filters.to,
  vendor_id: filters.vendor_id,
  area_id: filters.area_id,
  status: filters.status,
  sort: filters.sort,
};

      const [
        summaryRes,
        vendorRes,
        areaRes,
        duesRes,
        commissionRes,
        topVendorRes,
        dailyTrendRes,
      ] = await Promise.all([
        getExecutiveReportSummary(apiFilters),
        getExecutiveVendorSales(apiFilters),
        getExecutiveAreaSales(apiFilters),
        getExecutiveDueReports(apiFilters),
        getExecutiveCommission(apiFilters),
        getExecutiveTopVendors(apiFilters),
        getExecutiveDailyTrend(apiFilters),
      ]);

      setSummary(summaryRes?.data || emptySummary);
      setVendorSales(vendorRes?.data || []);
      setAreaSales(areaRes?.data || []);
      setDueList(duesRes?.data || []);
      setTopVendors(topVendorRes?.data || []);
      setDailyTrend(dailyTrendRes?.data || []);
      setCommissionData(commissionRes?.data || null);
    } catch (err) {
      console.error("Report fetch error:", err);
      setError("Unable to load reports. Please check backend APIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
  const config = reportFilterConfig[activeReport] || reportFilterConfig.overview;

  setFilters((prev) => ({
    ...prev,
    vendor_id: config.showVendor ? prev.vendor_id : "",
    area_id: config.showArea ? prev.area_id : "",
    status: config.showStatus ? prev.status : "",
    sort: config.showSort ? prev.sort || config.sortOptions?.[0]?.value || "" : "",
  }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeReport]);

useEffect(() => {
  fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeReport, filters.from, filters.to, filters.vendor_id, filters.area_id, filters.status, filters.sort]);

 const resetFilters = () => {
  const config = reportFilterConfig[activeReport] || reportFilterConfig.overview;

  setFilters({
    from: monthStart,
    to: today,
    vendor_id: "",
    area_id: "",
    status: "",
    sort: config.showSort ? config.sortOptions?.[0]?.value || "" : "",
  });
};

  const kpiCards = useMemo(
    () => [
      {
        label: "Total Sales",
        value: formatMoney(summary.totalSales),
        icon: IndianRupee,
        hint: "Final billed value",
      },
      {
        label: "Paid Amount",
        value: formatMoney(summary.paidAmount),
        icon: Wallet,
        hint: "Collected amount",
        success: true,
      },
      {
        label: "Pending Due",
        value: formatMoney(summary.pendingDue),
        icon: TrendingUp,
        hint: "Payment pending",
        danger: true,
      },
      {
        label: "Orders Count",
        value: summary.ordersCount || 0,
        icon: PackageCheck,
        hint: "Total orders",
      },
      {
        label: "Vendors Served",
        value: summary.vendorsServed || 0,
        icon: Store,
        hint: "Unique vendors",
      },
      {
        label: "Avg Order Value",
        value: formatMoney(summary.avgOrderValue),
        icon: BarChart3,
        hint: "Average bill",
      },
      {
        label: "Target",
        value: `${summary.targetPercent || 0}%`,
        icon: Target,
        hint: "Monthly target",
        warning: true,
      },
      {
        label: "Commission",
        value: formatMoney(commissionData?.commission || summary.commission),
        icon: IndianRupee,
        hint: commissionData?.message || "Commission earned",
        success: true,
      },
    ],
    [summary, commissionData]
  );

  const businessInsights = useMemo(() => {
    const topVendor = topVendors?.[0];

    const highestSalesDay = [...dailyTrend].sort(
      (a, b) => Number(b.total_sales || 0) - Number(a.total_sales || 0)
    )[0];

    const highestDueVendor = [...dueList].sort(
      (a, b) => Number(b.due_amount || 0) - Number(a.due_amount || 0)
    )[0];

    const totalSales = Number(summary.totalSales || 0);
    const paidAmount = Number(summary.paidAmount || 0);
    const pendingDue = Number(summary.pendingDue || 0);

    const collectionPercent =
      totalSales > 0 ? Math.round((paidAmount / totalSales) * 100) : 0;

    return [
      {
        label: "Top Vendor",
        value: topVendor?.vendor_name || "No vendor data",
        detail: topVendor
          ? `${formatMoney(topVendor.total_sales)} sales • ${topVendor.orders} orders`
          : "No sales found in selected range",
      },
      {
        label: "Highest Sales Day",
        value: highestSalesDay?.report_date
          ? formatDate(highestSalesDay.report_date)
          : "No daily data",
        detail: highestSalesDay
          ? `${formatMoney(highestSalesDay.total_sales)} sales • ${highestSalesDay.orders} orders`
          : "No sales trend found",
      },
      {
        label: "Highest Due Vendor",
        value: highestDueVendor?.vendor_name || "No due vendor",
        detail: highestDueVendor
          ? `${formatMoney(highestDueVendor.due_amount)} pending`
          : "No pending dues found",
      },
      {
        label: "Collection Status",
        value: `${collectionPercent}% Collected`,
        detail: `${formatMoney(paidAmount)} paid • ${formatMoney(pendingDue)} pending`,
      },
      {
        label: "Target Status",
        value:
          Number(summary.targetPercent || 0) >= 100
            ? "Target Completed"
            : "Target Pending",
        detail: `${summary.targetPercent || 0}% achieved`,
      },
      {
        label: "Commission Earned",
        value: formatMoney(commissionData?.commission || 0),
        detail: commissionData?.message || "No commission earned",
      },
    ];
  }, [topVendors, dailyTrend, dueList, summary, commissionData]);


const sortRows = (rows = []) => {
  const list = [...rows];

  if (filters.sort === "due_desc") {
    return list.sort(
      (a, b) => Number(b.due_amount || 0) - Number(a.due_amount || 0)
    );
  }

  if (filters.sort === "orders_desc") {
    return list.sort((a, b) => Number(b.orders || 0) - Number(a.orders || 0));
  }

  if (filters.sort === "vendor_asc") {
    return list.sort((a, b) =>
      String(a.vendor_name || a.shop_name || "").localeCompare(
        String(b.vendor_name || b.shop_name || "")
      )
    );
  }

  if (filters.sort === "oldest_due") {
    return list.sort(
      (a, b) =>
        new Date(a.last_order_date || a.report_date || 0) -
        new Date(b.last_order_date || b.report_date || 0)
    );
  }

  return list.sort(
    (a, b) => Number(b.total_sales || 0) - Number(a.total_sales || 0)
  );
};

  return (
    <ExecutiveLayout>
      <div className="space-y-4">
        <div className="border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {reportTitles[activeReport] || "Executive Reports"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Filter sales, vendors, dues, daily trend and commission reports.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchReports}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <ReportFilterBar
  filters={filters}
  setFilters={setFilters}
  vendors={vendors}
  vendorAreas={vendorAreas}
  metaLoading={metaLoading}
  activeReport={activeReport}
  onApply={fetchReports}
  onReset={resetFilters}
/>

        {loading && (
          <div className="flex items-center gap-2 border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            <Loader2 size={18} className="animate-spin" />
            Loading latest report...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {activeReport === "overview" && (
          <>
            <KpiGrid cards={kpiCards} />
            <OverviewInsights rows={businessInsights} />
          </>
        )}

        {activeReport === "top-vendors" && (
          <ReportShell
            icon={Store}
            title="Top Vendors"
            subtitle="Vendors with highest sales in selected range."
          >
           <ResponsiveVendorTable rows={sortRows(topVendors)} />
          </ReportShell>
        )}

        {activeReport === "vendor-sales" && (
          <ReportShell
            icon={Store}
            title="Vendor Wise Sales"
            subtitle="Vendor-wise sales, paid amount and dues."
          >
           <ResponsiveVendorTable rows={sortRows(vendorSales)} />
          </ReportShell>
        )}

        {activeReport === "area-sales" && (
          <ReportShell
            icon={BarChart3}
            title="Area Wise Sales"
            subtitle="Area-wise vendors, orders, sales and dues."
          >
       <ResponsiveAreaTable rows={sortRows(areaSales)} />
          </ReportShell>
        )}

        {activeReport === "dues" && (
          <ReportShell
            icon={TrendingUp}
            title="Pending Dues List"
            subtitle="Vendors where collection is still pending."
          >
           <ResponsiveDueTable rows={sortRows(dueList)} />
          </ReportShell>
        )}

        {activeReport === "daily" && (
          <ReportShell
            icon={CalendarDays}
            title="Daily Sales Trend"
            subtitle="Date-wise sales, orders, paid amount and dues."
          >
            <ResponsiveDailyTrendTable rows={dailyTrend} />
          </ReportShell>
        )}

        {activeReport === "commission" && (
          <ReportShell
            icon={Target}
            title="Commission & Target"
            subtitle="Monthly target, sales progress and commission result."
          >
            <CommissionReport data={commissionData} summary={summary} />
          </ReportShell>
        )}
      </div>
    </ExecutiveLayout>
  );
}

function ReportFilterBar({
  filters,
  setFilters,
  vendors,
  vendorAreas,
  metaLoading,
  activeReport,
  onApply,
  onReset,
}) {
  const config = reportFilterConfig[activeReport] || reportFilterConfig.overview;

  return (
    <section className="border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="border border-orange-100 bg-orange-50 p-2 text-orange-600">
          <CalendarDays size={17} />
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900">
            {config.title}
          </h2>
          <p className="text-xs text-gray-500">{config.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {config.showDate && (
          <>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />

            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </>
        )}

        {config.showVendor && (
          <select
            value={filters.vendor_id}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                vendor_id: e.target.value,
                area_id: "",
              }))
            }
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="">
              {metaLoading ? "Loading vendors..." : "All Vendors"}
            </option>

            {vendors.map((vendor) => (
              <option
                key={vendor.id || vendor.vendor_id}
                value={vendor.id || vendor.vendor_id}
              >
                {vendor.vendor_code ? `${vendor.vendor_code} - ` : ""}
                {vendor.shop_name || vendor.vendor_name}
              </option>
            ))}
          </select>
        )}

        {config.showArea && (
          <select
            value={filters.area_id}
            disabled={config.showVendor && !filters.vendor_id && activeReport === "vendor-sales"}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, area_id: e.target.value }))
            }
            className={`border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 ${
              config.showVendor && !filters.vendor_id && activeReport === "vendor-sales"
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : ""
            }`}
          >
            <option value="">
              {config.showVendor && !filters.vendor_id && activeReport === "vendor-sales"
                ? "Select vendor first"
                : "All Assigned Areas"}
            </option>

            {vendorAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.area_name}
              </option>
            ))}
          </select>
        )}

        {config.showStatus && (
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="">All Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="assigned">Assigned</option>
            <option value="delivered">Delivered</option>
          </select>
        )}

        {config.showSort && (
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sort: e.target.value }))
            }
            className="border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            {(config.sortOptions || []).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2 xl:col-span-2">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Apply Filter
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

function KpiGrid({ cards }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <h2
                  className={`mt-2 text-xl font-bold ${
                    item.danger
                      ? "text-red-600"
                      : item.warning
                      ? "text-orange-600"
                      : item.success
                      ? "text-green-700"
                      : "text-gray-900"
                  }`}
                >
                  {item.value}
                </h2>
                <p className="mt-1 text-xs text-gray-500">{item.hint}</p>
              </div>

              <div className="border border-orange-100 bg-orange-50 p-2 text-orange-600">
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverviewInsights({ rows }) {
  return (
    <ReportShell
      icon={BarChart3}
      title="Quick Business Insights"
      subtitle="Important sales and collection insights."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((item) => (
          <div key={item.label} className="border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <h3 className="mt-2 text-base font-bold text-gray-900">
              {item.value}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </ReportShell>
  );
}

function ReportShell({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="border border-orange-100 bg-orange-50 p-2 text-orange-600">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyRows({ message = "No report data found." }) {
  return (
    <div className="border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function ResponsiveVendorTable({ rows }) {
  if (!rows.length) return <EmptyRows message="No vendor sales found." />;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Due</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr key={row.vendor_id || index}>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.vendor_name || row.shop_name || "-"}
                </td>
                <td className="px-4 py-3">{row.area_name || "-"}</td>
                <td className="px-4 py-3">{row.orders || 0}</td>
                <td className="px-4 py-3">{formatMoney(row.total_sales)}</td>
                <td className="px-4 py-3 text-green-700">
                  {formatMoney(row.paid_amount)}
                </td>
                <td className="px-4 py-3 text-red-600">
                  {formatMoney(row.due_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MobileRows
        rows={rows}
        getKey={(row, index) => row.vendor_id || index}
        columns={[
          ["Vendor", (row) => row.vendor_name || row.shop_name || "-"],
          ["Area", (row) => row.area_name || "-"],
          ["Orders", (row) => row.orders || 0],
          ["Sales", (row) => formatMoney(row.total_sales)],
          ["Paid", (row) => formatMoney(row.paid_amount), "success"],
          ["Due", (row) => formatMoney(row.due_amount), "danger"],
        ]}
      />
    </>
  );
}

function ResponsiveAreaTable({ rows }) {
  if (!rows.length) return <EmptyRows message="No area wise sales found." />;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Vendors</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Due</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr key={row.area_id || index}>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.area_name || "-"}
                </td>
                <td className="px-4 py-3">{row.vendors || 0}</td>
                <td className="px-4 py-3">{row.orders || 0}</td>
                <td className="px-4 py-3">{formatMoney(row.total_sales)}</td>
                <td className="px-4 py-3 text-green-700">
                  {formatMoney(row.paid_amount)}
                </td>
                <td className="px-4 py-3 text-red-600">
                  {formatMoney(row.due_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MobileRows
        rows={rows}
        getKey={(row, index) => row.area_id || index}
        columns={[
          ["Area", (row) => row.area_name || "-"],
          ["Vendors", (row) => row.vendors || 0],
          ["Orders", (row) => row.orders || 0],
          ["Sales", (row) => formatMoney(row.total_sales)],
          ["Paid", (row) => formatMoney(row.paid_amount), "success"],
          ["Due", (row) => formatMoney(row.due_amount), "danger"],
        ]}
      />
    </>
  );
}

function ResponsiveDailyTrendTable({ rows }) {
  if (!rows.length) return <EmptyRows message="No daily sales trend found." />;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Vendors</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Due</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr key={row.report_date || index}>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {formatDate(row.report_date)}
                </td>
                <td className="px-4 py-3">{row.orders || 0}</td>
                <td className="px-4 py-3">{row.vendors || 0}</td>
                <td className="px-4 py-3">{formatMoney(row.total_sales)}</td>
                <td className="px-4 py-3 text-green-700">
                  {formatMoney(row.paid_amount)}
                </td>
                <td className="px-4 py-3 text-red-600">
                  {formatMoney(row.due_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MobileRows
        rows={rows}
        getKey={(row, index) => row.report_date || index}
        columns={[
          ["Date", (row) => formatDate(row.report_date)],
          ["Orders", (row) => row.orders || 0],
          ["Vendors", (row) => row.vendors || 0],
          ["Sales", (row) => formatMoney(row.total_sales)],
          ["Paid", (row) => formatMoney(row.paid_amount), "success"],
          ["Due", (row) => formatMoney(row.due_amount), "danger"],
        ]}
      />
    </>
  );
}

function ResponsiveDueTable({ rows }) {
  if (!rows.length) return <EmptyRows message="No pending dues found." />;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">Due Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr key={row.vendor_id || index}>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.vendor_name || row.shop_name || "-"}
                </td>
                <td className="px-4 py-3">{row.phone || "-"}</td>
                <td className="px-4 py-3">{row.area_name || "-"}</td>
                <td className="px-4 py-3">{formatDate(row.last_order_date)}</td>
                <td className="px-4 py-3 font-bold text-red-600">
                  {formatMoney(row.due_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MobileRows
        rows={rows}
        getKey={(row, index) => row.vendor_id || index}
        columns={[
          ["Vendor", (row) => row.vendor_name || row.shop_name || "-"],
          ["Phone", (row) => row.phone || "-"],
          ["Area", (row) => row.area_name || "-"],
          ["Last Order", (row) => formatDate(row.last_order_date)],
          ["Due", (row) => formatMoney(row.due_amount), "danger"],
        ]}
      />
    </>
  );
}

function CommissionReport({ data, summary }) {
  const rows = [
    ["Monthly Target", formatMoney(data?.monthlyTarget)],
    ["Total Sales", formatMoney(data?.totalSales || summary?.totalSales)],
    ["Target Completed", `${data?.targetPercent || summary?.targetPercent || 0}%`],
    ["Commission Rate", `${data?.commissionRate || 0}%`],
    ["Commission", formatMoney(data?.commission)],
    ["Status", data?.message || "No commission data"],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">{label}</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{value}</h3>
        </div>
      ))}
    </div>
  );
}

function MobileRows({ rows, columns, getKey }) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {rows.map((row, index) => (
        <div key={getKey(row, index)} className="border border-gray-200 bg-white p-3">
          {columns.map(([label, render, tone]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-b-0"
            >
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p
                className={`max-w-[65%] text-right text-sm font-semibold ${
                  tone === "danger"
                    ? "text-red-600"
                    : tone === "success"
                    ? "text-green-700"
                    : "text-gray-900"
                }`}
              >
                {render(row)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}