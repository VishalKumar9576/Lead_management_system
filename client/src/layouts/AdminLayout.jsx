import { useState } from "react";
import Sidebar from "../components/common/layout/Sidebar";
import Topbar from "../components/common/layout/Topbar";
import ContentWrapper from "../components/common/layout/ContentWrapper";
import { ADMIN_MENU } from "../utils/constants";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar
          title="Admin Panel"
          menu={ADMIN_MENU}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            panelLabel="Panel"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <ContentWrapper>{children}</ContentWrapper>
        </div>
      </div>
    </div>
  );
}