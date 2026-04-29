export const APP_NAME = "Sales Management";

export const USER_ROLES = {
  ADMIN: "admin",
  EXECUTIVE: "executive",
};

export const ADMIN_MENU = [
  { label: "Dashboard", path: "/admin" },
  { label: "Areas", path: "/admin/areas" },
  { label: "Executives", path: "/admin/executives" },
  { label: "Orders", path: "/admin/orders" },
  { label: "Payments", path: "/admin/payments" },
  {
    label: "Reports",
    path: "/admin/reports",
    children: [
      { label: "Overview", path: "/admin/reports?type=overview" },
      { label: "Executive Report", path: "/admin/reports?type=executive" },
      { label: "Area Report", path: "/admin/reports?type=area" },
      { label: "Vendor Due Report", path: "/admin/reports?type=vendor-due" },
      { label: "Order Report", path: "/admin/reports?type=orders" },
      { label: "Payment Report", path: "/admin/reports?type=payments" },
      { label: "Target Report", path: "/admin/reports?type=target" },
      { label: "Daily Sales", path: "/admin/reports?type=daily" },
    ],
  },
];

export const EXECUTIVE_MENU = [
  { label: "Dashboard", path: "/executive" },
  { label: "Total Vendors", path: "/executive/vendors" },
  { label: "Create Vendor", path: "/executive/vendors/create" },
  { label: "My Orders", path: "/executive/orders" },
  { label: "Create Order", path: "/executive/orders/create" },
  { label: "My Dues", path: "/executive/payments" },
  {
  label: "Reports",
  path: "/executive/reports",
  children: [
    { label: "Overview", path: "/executive/reports?type=overview" },
    { label: "Top Vendors", path: "/executive/reports?type=top-vendors" },
    { label: "Vendor Sales", path: "/executive/reports?type=vendor-sales" },
    { label: "Area Sales", path: "/executive/reports?type=area-sales" },
    { label: "Pending Dues", path: "/executive/reports?type=dues" },
    { label: "Daily Sales", path: "/executive/reports?type=daily" },
    { label: "Commission", path: "/executive/reports?type=commission" },
  ],
},
];