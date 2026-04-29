import { CheckCircle2, Clock3, WalletCards } from "lucide-react";
import SectionCard from "../../common/ui/SectionCard";

export default function ExecutiveQuickReports() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <SectionCard
        title="Today’s Focus"
        subtitle="Quick field priorities for the executive."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <CheckCircle2 size={18} className="text-green-600" />
            Vendor onboarding and follow-up
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <Clock3 size={18} className="text-yellow-600" />
            Pending delivery movement
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <WalletCards size={18} className="text-blue-600" />
            Due collection tracking
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Sales Report Preview"
        subtitle="Prepared for target, commission and analytics APIs."
        className="xl:col-span-2"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Monthly Target</p>
            <p className="mt-2 text-xl font-bold text-blue-900">Coming next</p>
            <p className="mt-1 text-xs text-blue-700">Live target summary</p>
          </div>

          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">Sales Achieved</p>
            <p className="mt-2 text-xl font-bold text-green-900">Coming next</p>
            <p className="mt-1 text-xs text-green-700">Area and month wise</p>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-800">Commission</p>
            <p className="mt-2 text-xl font-bold text-yellow-900">Coming next</p>
            <p className="mt-1 text-xs text-yellow-700">Cut and settlement view</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}