import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Phone,
  Store,
  UserRound,
} from "lucide-react";

import ExecutiveLayout from "../../layouts/ExecutiveLayout";
import PageHeader from "../../components/common/ui/PageHeader";
import Button from "../../components/common/ui/Button";
import Loader from "../../components/common/ui/Loader";
import { getOrderInvoiceApi } from "../../api/orderApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (value) => {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
};

export default function OrderItemsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const order = invoice?.order;
  const items = invoice?.items || [];
  const payments = invoice?.payments || [];

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await getOrderInvoiceApi(id);
        setInvoice(res?.data || null);
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloading(true);

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 14;
      let y = 14;

      const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

      const addText = (text, x, yPos, options = {}) => {
        doc.text(String(text || "-"), x, yPos, options);
      };

      const addLine = () => {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
      };

      const checkPageSpace = (neededHeight = 20) => {
        if (y + neededHeight > pageHeight - 18) {
          doc.addPage();
          y = 16;
        }
      };

      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, pageWidth, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      addText("Sales Management Invoice", margin, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      addText("Field Sales Billing Invoice", margin, 24);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      addText(`Invoice: ${order.order_number}`, pageWidth - margin, 16, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      addText(`Date: ${formatDate(order.created_at)}`, pageWidth - margin, 24, {
        align: "right",
      });

      y = 48;
      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      addText("Bill To Vendor", margin, y);
      addText("Executive Details", 112, y);

      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const leftRows = [
        ["Shop", order.shop_name],
        ["Owner", order.owner_name],
        ["Vendor Code", order.vendor_code],
        ["Phone", order.vendor_phone],
        ["GST", order.gst_number],
        ["Area", order.area_name],
        [
          "Address",
          [order.shop_address, order.landmark, order.pincode]
            .filter(Boolean)
            .join(", "),
        ],
      ];

      const rightRows = [
        ["Name", order.executive_name],
        ["Code", order.executive_code],
        ["Phone", order.executive_phone],
        ["Email", order.executive_email],
        ["Order Status", formatStatus(order.status)],
        ["Payment", formatStatus(order.payment_status)],
      ];

      const startY = y;

      leftRows.forEach(([label, value]) => {
        checkPageSpace(8);
        doc.setFont("helvetica", "bold");
        addText(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(String(value || "-"), 62);
        doc.text(lines, margin + 25, y);
        y += Math.max(6, lines.length * 5);
      });

      let rightY = startY;
      rightRows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        addText(`${label}:`, 112, rightY);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(String(value || "-"), 62);
        doc.text(lines, 140, rightY);
        rightY += Math.max(6, lines.length * 5);
      });

      y = Math.max(y, rightY) + 4;
      addLine();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      addText("Order Items", margin, y);
      y += 8;

const col = {
  no: margin,
  product: margin + 10,
  brand: margin + 82,
  unit: margin + 120,
  qty: margin + 145,
  total: pageWidth - margin,
};

      doc.setFillColor(245, 245, 245);
doc.rect(margin, y - 5, pageWidth - margin * 2, 9, "F");

      doc.setFont("helvetica", "bold");
doc.setFontSize(9);

addText("#", col.no, y);
addText("Product / Unit Price", col.product, y);
addText("Brand", col.brand, y);
addText("Unit", col.unit, y);
addText("Qty", col.qty, y);
addText("Total", col.total, y, { align: "right" });

      y += 7;
      doc.setFont("helvetica", "normal");

      items.forEach((item, index) => {
  checkPageSpace(18);

  const productText = `${item.product_name || "-"}  (${money(item.unit_price)} each)`;
const productLines = doc.splitTextToSize(productText, 68);
const rowHeight = Math.max(12, productLines.length * 5 + 4);

addText(index + 1, col.no, y);
doc.text(productLines, col.product, y);
addText(item.brand || "-", col.brand, y);
addText(item.unit_label || "-", col.unit, y);
addText(item.quantity || "-", col.qty, y);
addText(money(item.line_total), col.total, y, { align: "right" });

y += rowHeight;

  doc.setDrawColor(235, 235, 235);
  doc.line(margin, y, pageWidth - margin, y);

  y += 3;
});

      y += 6;
      checkPageSpace(45);

      const totalX = 118;
      doc.setFontSize(10);

      const totalRows = [
        ["Subtotal", money(order.subtotal_amount)],
        [
          `Discount (${Number(order.discount_percent || 0)}%)`,
          money(order.discount_amount),
        ],
        ["Final Amount", money(order.final_amount)],
        ["Paid Amount", money(order.paid_amount)],
        ["Due Amount", money(order.due_amount)],
      ];

      totalRows.forEach(([label, value], index) => {
  if (index === 2) {
    doc.setDrawColor(180, 180, 180);

    // short separator only between label and value, so it does not cut the text
    doc.line(totalX + 28, y - 2, pageWidth - margin - 28, y - 2);
  }

  doc.setFont("helvetica", index >= 2 ? "bold" : "normal");
  addText(label, totalX, y);
  addText(value, pageWidth - margin, y, { align: "right" });
  y += 7;
});

      y += 4;
      addLine();

      checkPageSpace(25);
      doc.setFont("helvetica", "bold");
      addText("Order Note", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      const noteLines = doc.splitTextToSize(
        order.order_note || "No special note added for this order.",
        pageWidth - margin * 2
      );
      doc.text(noteLines, margin, y);
      y += noteLines.length * 5 + 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "This invoice is generated by Sales Management System. Please verify quantity and payment status before settlement.",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      doc.save(`${order.order_number || `invoice-${id}`}.pdf`);
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Failed to download invoice PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ExecutiveLayout>
      <PageHeader
        title="Invoice Details"
        subtitle={
          order?.order_number
            ? `Invoice for ${order.order_number}`
            : `Order ID: ${id}`
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate("/executive/orders")}
            >
              Back to Orders
            </Button>

            {!loading && order && (
              <Button onClick={handleDownloadInvoice} disabled={downloading}>
                {downloading ? "Generating..." : "Download Invoice"}
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <Loader text="Loading invoice details..." />
      ) : !order ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-700">
          Invoice data not found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Sales Invoice
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {order.order_number}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Created on {formatDate(order.created_at)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm md:text-right">
              <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                <p className="text-xs font-medium">Order Status</p>
                <p className="font-bold capitalize">
                  {formatStatus(order.status)}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 px-3 py-2 text-orange-700">
                <p className="text-xs font-medium">Payment</p>
                <p className="font-bold capitalize">
                  {formatStatus(order.payment_status)}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={invoiceRef}
            className="invoice-print overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            style={{ fontFamily: "'Inter', Arial, sans-serif" }}
          >
            <div className="border-b border-gray-200 bg-gray-950 p-5 text-white md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
                      <FileText size={24} />
                    </div>

                    <div>
                      <h1 className="text-2xl font-black">
                        Sales Management
                      </h1>
                      <p className="text-sm text-gray-300">
                        Field Sales Billing Invoice
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-1 text-sm text-gray-300">
                    <p>Invoice No: {order.order_number}</p>
                    <p>Invoice Date: {formatDate(order.created_at)}</p>
                    <p>Area: {order.area_name || "-"}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 text-sm">
                  <p className="text-gray-300">Total Amount</p>
                  <h2 className="mt-1 text-2xl font-black">
                    {formatMoney(order.final_amount)}
                  </h2>
                  <p className="mt-2 capitalize text-gray-300">
                    {formatStatus(order.payment_status)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2 md:p-7">
              <InfoCard
                icon={Store}
                title="Bill To Vendor"
                rows={[
                  ["Shop", order.shop_name],
                  ["Owner", order.owner_name],
                  ["Vendor Code", order.vendor_code],
                  ["Phone", order.vendor_phone],
                  ["Email", order.vendor_email],
                  ["GST", order.gst_number],
                  [
                    "Address",
                    [order.shop_address, order.landmark, order.pincode]
                      .filter(Boolean)
                      .join(", "),
                  ],
                ]}
              />

              <InfoCard
                icon={UserRound}
                title="Executive Details"
                rows={[
                  ["Name", order.executive_name],
                  ["Code", order.executive_code],
                  ["Phone", order.executive_phone],
                  ["Email", order.executive_email],
                  ["Area", order.area_name],
                ]}
              />
            </div>

            <div className="px-5 pb-5 md:px-7">
              <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-3 text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3">{item.brand || "-"}</td>
                        <td className="px-4 py-3">{item.unit_label || "-"}</td>
                        <td className="px-4 py-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMoney(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {formatMoney(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-400">
                          Item #{index + 1}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.brand || "-"} • {item.unit_label || "-"}
                        </p>
                      </div>

                      <p className="text-sm font-black text-gray-900">
                        {formatMoney(item.line_total)}
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-xs">
                      <div>
                        <p className="text-gray-400">Qty</p>
                        <p className="font-bold text-gray-900">
                          {item.quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Price</p>
                        <p className="font-bold text-gray-900">
                          {formatMoney(item.unit_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-bold text-gray-900">
                          {formatMoney(item.line_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_360px]">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <h3 className="font-bold text-gray-900">Order Note</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {order.order_note ||
                      "No special note added for this order."}
                  </p>

                  <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                    <Phone size={16} className="mt-0.5" />
                    <p>
                      For payment or delivery queries, contact executive{" "}
                      <span className="font-semibold text-gray-700">
                        {order.executive_name}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <AmountRow label="Subtotal" value={order.subtotal_amount} />
                  <AmountRow
                    label={`Discount (${Number(order.discount_percent || 0)}%)`}
                    value={order.discount_amount}
                    danger
                  />
                  <div className="my-3 border-t border-dashed border-gray-200" />
                  <AmountRow
                    label="Final Amount"
                    value={order.final_amount}
                    bold
                  />
                  <AmountRow
                    label="Paid Amount"
                    value={order.paid_amount}
                    success
                  />
                  <AmountRow
                    label="Due Amount"
                    value={order.due_amount}
                    danger
                    bold
                  />
                </div>
              </div>

              {payments.length > 0 && (
                <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900">Payment History</h3>

                  <div className="mt-3 space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col justify-between gap-2 rounded-xl bg-gray-50 p-3 text-sm md:flex-row md:items-center"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {payment.payment_number}
                          </p>
                          <p className="text-gray-500">
                            {formatDate(payment.payment_date)} •{" "}
                            {formatStatus(payment.payment_mode)} •{" "}
                            {formatStatus(payment.settlement_status)}
                          </p>
                        </div>

                        <p className="font-bold text-green-700">
                          {formatMoney(payment.amount_received)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
                This invoice is generated by Sales Management System. Please
                verify product quantity and payment status before final
                settlement.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/executive/orders")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download size={16} />
              {downloading ? "Generating PDF..." : "Download Invoice PDF"}
            </button>
          </div>
        </div>
      )}
    </ExecutiveLayout>
  );
}

function InfoCard({ icon: Icon, title, rows }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[110px_1fr] gap-3">
            <p className="text-gray-500">{label}</p>
            <p className="font-medium text-gray-900">{value || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmountRow({ label, value, bold, success, danger }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <p className={`${bold ? "font-bold" : "font-medium"} text-gray-600`}>
        {label}
      </p>
      <p
        className={`text-right ${
          bold ? "text-base font-black" : "font-bold"
        } ${success ? "text-green-700" : ""} ${danger ? "text-red-600" : ""}`}
      >
        {formatMoney(value)}
      </p>
    </div>
  );
}