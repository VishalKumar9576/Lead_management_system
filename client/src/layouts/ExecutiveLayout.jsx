import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  PlusSquare,
  ClipboardList,
  ReceiptText,
  BarChart3,
} from "lucide-react";

import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";
import ContentWrapper from "../components/common/layout/ContentWrapper";
import { EXECUTIVE_MENU } from "../utils/constants";

const executiveMenu = EXECUTIVE_MENU.map((item) => {
  const iconMap = {
    Dashboard: LayoutDashboard,
    "Total Vendors": Store,
    "Create Vendor": PlusSquare,
    "My Orders": ClipboardList,
    "Create Order": PlusSquare,
    "My Dues": ReceiptText,
    Reports: BarChart3,
  };

  return {
    ...item,
    icon: iconMap[item.label],
  };
});

export default function ExecutiveLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar
          title="Executive Panel"
          menu={executiveMenu}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            panelLabel="Executive Dashboard"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <ContentWrapper>{children}</ContentWrapper>
        </div>
      </div>
    </div>
  );
}