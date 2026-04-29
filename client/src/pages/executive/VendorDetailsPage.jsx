import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Edit } from "lucide-react";
import ExecutiveLayout from "../../layouts/ExecutiveLayout";
import PageHeader from "../../components/common/ui/PageHeader";
import Button from "../../components/common/ui/Button";
import SectionCard from "../../components/common/ui/SectionCard";
import Loader from "../../components/common/ui/Loader";
import EmptyState from "../../components/common/ui/EmptyState";
import {
  getMyVendorByIdApi,
  getMyVendorOrdersApi,
  getMyVendorPaymentsApi,
} from "../../api/vendorApi";

export default function VendorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [vendorRes, orderRes, paymentRes] = await Promise.all([
          getMyVendorByIdApi(id),
          getMyVendorOrdersApi(id),
          getMyVendorPaymentsApi(id),
        ]);

        setVendor(vendorRes?.data || null);
        setOrders(orderRes?.data || []);
        setPayments(paymentRes?.data || []);
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const summary = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + Number(o.final_amount || 0), 0);
    const totalPaid = orders.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0);
    const totalDue = orders.reduce((sum, o) => sum + Number(o.due_amount || 0), 0);

    return {
      totalOrders: orders.length,
      totalSales: totalSales.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalDue: totalDue.toFixed(2),
    };
  }, [orders]);

  if (loading) {
    return (
      <ExecutiveLayout>
        <Loader text="Loading vendor details..." />
      </ExecutiveLayout>
    );
  }

  return (
    <ExecutiveLayout>

      <div className="space-y-4">
        <SectionCard title="Vendor Profile">
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div>
              {vendor?.shop_image_url ? (
                <img src={vendor.shop_image_url} alt={vendor.shop_name} className="h-44 w-full rounded-xl object-cover sm:h-52" />
              ) : (
                <div className="flex h-44 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500 sm:h-52">
                  No shop image
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Info label="Vendor Code" value={vendor?.vendor_code} />
              <Info label="Shop Name" value={vendor?.shop_name} />
              <Info label="Owner Name" value={vendor?.owner_name} />
              <Info label="Phone" value={vendor?.phone} />
              <Info label="Alternate Phone" value={vendor?.alternate_phone || "-"} />
              <Info label="Email" value={vendor?.email || "-"} />
              <Info label="GST Number" value={vendor?.gst_number || "-"} />
              <Info label="Area" value={`${vendor?.area_code || ""} ${vendor?.area_name || ""}`} />
              <Info label="City / State" value={`${vendor?.city || "-"} / ${vendor?.state || "-"}`} />
              <Info label="Pincode" value={vendor?.pincode || "-"} />
              <Info label="Landmark" value={vendor?.landmark || "-"} />
              <Info label="Status" value={vendor?.status} />
              <Info label="Onboarding Date" value={vendor?.onboarding_date ? String(vendor.onboarding_date).slice(0, 10) : "-"} />
              <Info label="Shop Address" value={vendor?.shop_address || "-"} className="sm:col-span-2 xl:col-span-3" />
              <Info label="Notes" value={vendor?.notes || "-"} className="sm:col-span-2 xl:col-span-3" />
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Total Orders" value={summary.totalOrders} />
          <MiniStat label="Total Sales" value={`₹${summary.totalSales}`} />
          <MiniStat label="Paid Amount" value={`₹${summary.totalPaid}`} />
          <MiniStat label="Due Amount" value={`₹${summary.totalDue}`} danger />
        </div>

        <CollapsibleCard
          title="Vendor Orders"
          subtitle="All billing orders created for this vendor."
          open={ordersOpen}
          setOpen={setOrdersOpen}
          count={orders.length}
        >
          {orders.length === 0 ? (
            <EmptyState title="No orders found" message="No order created for this vendor yet." />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">{o.order_number}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <InfoSmall label="Final" value={`₹${o.final_amount}`} />
                      <InfoSmall label="Due" value={`₹${o.due_amount}`} danger />
                      <InfoSmall label="Discount" value={`${o.discount_percent}%`} />
                      <InfoSmall label="Status" value={String(o.status).replace("_", " ")} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">Subtotal</th>
                      <th className="px-3 py-2">Discount</th>
                      <th className="px-3 py-2">Final</th>
                      <th className="px-3 py-2">Paid</th>
                      <th className="px-3 py-2">Due</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-semibold">{o.order_number}</td>
                        <td className="px-3 py-2">₹{o.subtotal_amount}</td>
                        <td className="px-3 py-2">{o.discount_percent}%</td>
                        <td className="px-3 py-2 font-semibold">₹{o.final_amount}</td>
                        <td className="px-3 py-2 text-green-700">₹{o.paid_amount}</td>
                        <td className="px-3 py-2 font-semibold text-red-600">₹{o.due_amount}</td>
                        <td className="px-3 py-2 capitalize">{String(o.status).replace("_", " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CollapsibleCard>

        <CollapsibleCard
          title="Payment History"
          subtitle="Collections received for this vendor."
          open={paymentsOpen}
          setOpen={setPaymentsOpen}
          count={payments.length}
        >
          {payments.length === 0 ? (
            <EmptyState title="No payments found" message="No payment collection found for this vendor." />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {payments.map((p) => (
                  <div key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">{p.payment_number}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <InfoSmall label="Order" value={p.order_number} />
                      <InfoSmall label="Amount" value={`₹${p.amount_received}`} />
                      <InfoSmall label="Mode" value={p.payment_mode} />
                      <InfoSmall label="Status" value={p.settlement_status} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Payment No</th>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">Mode</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Received By</th>
                      <th className="px-3 py-2">Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-semibold">{p.payment_number}</td>
                        <td className="px-3 py-2">{p.order_number}</td>
                        <td className="px-3 py-2 capitalize">{p.payment_mode}</td>
                        <td className="px-3 py-2 font-semibold">₹{p.amount_received}</td>
                        <td className="px-3 py-2 capitalize">{p.received_by}</td>
                        <td className="px-3 py-2 capitalize">{p.settlement_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CollapsibleCard>
      </div>
    </ExecutiveLayout>
  );
}

function CollapsibleCard({ title, subtitle, count, open, setOpen, children }) {
  return (
    <SectionCard
      title={title}
      subtitle={`${subtitle} (${count})`}
      headerAction={
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
        >
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
      }
    >
      {open ? children : <p className="text-sm text-gray-500">Click arrow to view details.</p>}
    </SectionCard>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className={`min-w-0 rounded-xl bg-gray-50 px-3 py-2 ${className}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
}

function InfoSmall({ label, value, danger = false }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-semibold capitalize ${danger ? "text-red-600" : "text-gray-900"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function MiniStat({ label, value, danger = false }) {
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${danger ? "border-red-100" : "border-gray-200"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${danger ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}