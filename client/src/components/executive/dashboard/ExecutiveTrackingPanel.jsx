import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Percent,
  ReceiptText,
  Target,
  WalletCards,
} from "lucide-react";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ExecutiveTrackingPanel({ stats }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="border border-gray-200 bg-white p-4">
        <SectionTitle
          icon={IndianRupee}
          title="Sales Collection Summary"
          subtitle="Your total sales, collected amount and pending dues."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniCard
            icon={ReceiptText}
            label="Order Value"
            value={formatMoney(stats.totalOrderValue)}
          />

          <MiniCard
            icon={WalletCards}
            label="Collected"
            value={formatMoney(stats.totalPaid)}
            success
          />

          <MiniCard
            icon={AlertTriangle}
            label="Pending Due"
            value={formatMoney(stats.totalDue)}
            danger
          />
        </div>

        <div className="mt-4 border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-gray-700">
              Collection Progress
            </span>
            <span className="font-bold text-gray-900">
              {stats.collectionPercent}%
            </span>
          </div>

          <div className="mt-2 h-2 bg-white">
            <div
              className="h-2 bg-blue-600"
              style={{ width: `${Math.min(stats.collectionPercent, 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="border border-gray-200 bg-white p-4">
        <SectionTitle
          icon={Target}
          title="Today’s Field Focus"
          subtitle="Quick actions to complete your daily sales workflow."
        />

        <div className="mt-4 divide-y divide-gray-100 border border-gray-100">
          <FocusRow
            icon={ClipboardList}
            label="Orders waiting for admin approval"
            value={stats.pendingOrders}
            to="/executive/orders?status=pending_approval"
            warning
          />

          <FocusRow
            icon={CheckCircle2}
            label="Assigned orders ready for delivery"
            value={stats.assignedOrders}
            to="/executive/orders?status=assigned"
          />

          <FocusRow
            icon={AlertTriangle}
            label="Pending due collection"
            value={formatMoney(stats.totalDue)}
            to="/executive/payments"
            danger
          />
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="border border-blue-100 bg-blue-50 p-2 text-blue-600">
        <Icon size={18} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniCard({ icon: Icon, label, value, success, danger }) {
  return (
    <div className="border border-gray-100 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p
            className={`mt-2 text-lg font-bold ${
              danger ? "text-red-600" : success ? "text-green-700" : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`border p-2 ${
            danger
              ? "border-red-100 bg-red-50 text-red-600"
              : success
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-blue-100 bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function FocusRow({ icon: Icon, label, value, to, warning, danger }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 px-3 py-3 text-sm hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div
          className={`border p-2 ${
            danger
              ? "border-red-100 bg-red-50 text-red-600"
              : warning
              ? "border-orange-100 bg-orange-50 text-orange-600"
              : "border-blue-100 bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={16} />
        </div>

        <p className="font-medium text-gray-700">{label}</p>
      </div>

      <div className="flex items-center gap-2">
        <p
          className={`font-bold ${
            danger ? "text-red-600" : warning ? "text-orange-600" : "text-gray-900"
          }`}
        >
          {value}
        </p>
        <ArrowRight size={14} className="text-gray-400" />
      </div>
    </Link>
  );
}