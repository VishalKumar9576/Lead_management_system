import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  IndianRupee,
  MapPinned,
  Phone,
  ReceiptText,
  Target,
  UserRound,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import Loader from "../../components/common/ui/Loader";
import { getExecutiveDetailsForAdminApi } from "../../api/executiveApi";

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

export default function ExecutiveDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const executive = data?.executive;
  const areas = data?.areas || [];
  const sales = data?.sales || {};
  const monthly = data?.monthlyPerformance || {};
  const recentOrders = data?.recentOrders || [];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getExecutiveDetailsForAdminApi(id);
        setData(res?.data || null);
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to load executive details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  return (
    <AdminLayout>
      {loading ? (
        <Loader text="Loading executive details..." />
      ) : !executive ? (
        <div className="border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Executive not found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 bg-white p-4">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-blue-100 bg-blue-50 text-3xl font-black text-blue-700">
        {executive.profile_image_url ? (
          <img
            src={executive.profile_image_url}
            alt={executive.full_name}
            className="h-full w-full object-cover"
          />
        ) : (
          String(executive.full_name || "E").slice(0, 1)
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {executive.full_name}
        </h1>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <UserRound size={15} />
            {executive.executive_code}
          </span>

          <span className="inline-flex items-center gap-1 capitalize">
            <Target size={15} />
            {formatStatus(executive.status)}
          </span>

          <span className="inline-flex items-center gap-1">
            <CalendarDays size={15} />
            Joined: {formatDate(executive.joined_date)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Phone size={15} />
            {executive.phone || "-"}
          </span>
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={() => navigate("/admin/executives")}
      className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
    >
      <ArrowLeft size={16} />
      Back to Executives
    </button>
  </div>
</div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={IndianRupee} label="Total Sales" value={formatMoney(sales?.total_sales)} />
<Kpi icon={IndianRupee} label="Paid Amount" value={formatMoney(sales?.paid_amount)} />
<Kpi icon={IndianRupee} label="Pending Due" value={formatMoney(sales?.due_amount)} danger />
<Kpi icon={Banknote} label="Commission" value={formatMoney(monthly?.commission)} />
<Kpi icon={ReceiptText} label="Total Orders" value={sales?.total_orders || 0} />
<Kpi icon={UserRound} label="Vendors Served" value={sales?.vendors_served || 0} />
<Kpi icon={ReceiptText} label="Delivered Orders" value={sales?.delivered_orders || 0} />
<Kpi icon={Target} label="Pending Approval" value={sales?.pending_approval || 0} warning />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <InfoSection
  icon={UserRound}
  title="Personal Details"
              rows={[
                ["Full Name", executive.full_name],
                ["Executive Code", executive.executive_code],
                ["Phone", executive.phone],
                ["Email", executive.email],
                ["PAN", executive.pan_number],
                ["Aadhaar", executive.aadhar_number],
                ["Commission", `${executive.commission_percent || 0}%`],
                ["Notes", executive.notes],
              ]}
            />

            <InfoSection
  icon={Banknote}
  title="Bank Details"
              rows={[
                ["Account Name", executive.bank_account_name],
                ["Account Number", executive.bank_account_number],
                ["IFSC", executive.bank_ifsc],
                ["Bank Name", executive.bank_name],
              ]}
            />
          </div>

          <section className="border border-gray-200 bg-white p-4">
           <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
  <Target size={18} className="text-blue-600" />
  Monthly Target
</h2>
            <p className="mt-1 text-sm text-gray-500">
              Target achievement and commission status for current month.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Kpi label="Monthly Target" value={formatMoney(monthly?.monthlyTarget)} />
              <Kpi label="Month Sales" value={formatMoney(monthly?.month_sales)} />
              <Kpi label="Target Completed" value={`${monthly?.target_percent || 0}%`} />
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
  <MapPinned size={18} className="text-blue-600" />
  Assigned Areas
</h2>
            <p className="mt-1 text-sm text-gray-500">
              Areas currently assigned to this executive.
            </p>

            {areas.length === 0 ? (
              <div className="mt-4 border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                No area assigned yet.
              </div>
            ) : (
              <>
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Area</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">City</th>
                        <th className="px-4 py-3">State</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {areas.map((area) => (
                        <tr key={area.id}>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {area.area_name}
                          </td>
                          <td className="px-4 py-3">{area.area_code}</td>
                          <td className="px-4 py-3">{area.city || "-"}</td>
                          <td className="px-4 py-3">{area.state || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-3 md:hidden">
                  {areas.map((area) => (
                    <div key={area.id} className="border border-gray-200 bg-white p-3">
                      <h3 className="font-bold text-gray-900">{area.area_name}</h3>
                      <p className="text-sm text-gray-500">{area.area_code}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {area.city || "-"} • {area.state || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="border border-gray-200 bg-white p-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
  <ReceiptText size={18} className="text-blue-600" />
  Recent Orders
</h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest orders handled by this executive.
            </p>

            {recentOrders.length === 0 ? (
              <div className="mt-4 border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                No recent orders found.
              </div>
            ) : (
              <>
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Vendor</th>
                        <th className="px-4 py-3">Area</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Final</th>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="px-4 py-3">{order.shop_name}</td>
                          <td className="px-4 py-3">{order.area_name}</td>
                          <td className="px-4 py-3 capitalize">
                            {formatStatus(order.status)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {formatMoney(order.final_amount)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-red-600">
                            {formatMoney(order.due_amount)}
                          </td>
                          <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-3 md:hidden">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {order.order_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.shop_name}
                          </p>
                        </div>

                        <p className="font-bold text-gray-900">
                          {formatMoney(order.final_amount)}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <Info label="Area" value={order.area_name} />
                        <Info label="Status" value={formatStatus(order.status)} />
                        <Info label="Date" value={formatDate(order.created_at)} />
                        <Info
                          label="Due"
                          value={formatMoney(order.due_amount)}
                          danger
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

function Kpi({ icon: Icon, label, value, danger, warning }) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <h3
            className={`mt-2 text-xl font-bold ${
              danger
                ? "text-red-600"
                : warning
                ? "text-orange-600"
                : "text-gray-900"
            }`}
          >
            {value}
          </h3>
        </div>

        {Icon ? (
          <div className="border border-blue-100 bg-blue-50 p-2 text-blue-600">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoSection({ icon: Icon, title, rows }) {
  return (
    <section className="border border-gray-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        {Icon ? <Icon size={18} className="text-blue-600" /> : null}
        {title}
      </h2>

      <div className="mt-4 divide-y divide-gray-100 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[140px_1fr] gap-3 py-2">
            <p className="text-gray-500">{label}</p>
            <p className="font-medium text-gray-900 break-words">
              {value || "-"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value, danger }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`font-semibold ${danger ? "text-red-600" : "text-gray-900"}`}
      >
        {value || "-"}
      </p>
    </div>
  );
}