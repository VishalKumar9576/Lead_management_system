import {
  Store,
  ClipboardList,
  Wallet,
  TrendingUp,
} from "lucide-react";
import StatCard from "../../common/ui/StatCard";

export default function ExecutiveStatsGrid() {
  const stats = [
    {
      label: "Total Vendors",
      value: "Live next",
      helper: "Onboarded vendor count",
      icon: <Store size={20} />,
    },
    {
      label: "My Orders",
      value: "Live next",
      helper: "Created and tracked orders",
      icon: <ClipboardList size={20} />,
    },
    {
      label: "Due Collection",
      value: "Live next",
      helper: "Pending collection amount",
      icon: <Wallet size={20} />,
    },
    {
      label: "Sales Progress",
      value: "Step 8/9",
      helper: "Target and commission ready",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          helper={item.helper}
          icon={item.icon}
        />
      ))}
    </div>
  );
}