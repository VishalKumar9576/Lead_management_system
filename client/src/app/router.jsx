import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AreasPage from "../pages/admin/AreasPage";
import ExecutivesPage from "../pages/admin/ExecutivesPage";
import VendorsPage from "../pages/admin/VendorsPage";
import OrdersPage from "../pages/admin/OrdersPage";
import PaymentsDuePage from "../pages/admin/PaymentsDuePage";
import ExecutiveDashboardPage from "../pages/executive/ExecutiveDashboardPage";
import MyVendorsPage from "../pages/executive/MyVendorsPage";
import CreateVendorPage from "../pages/executive/CreateVendorPage";
import MyOrdersPage from "../pages/executive/MyOrdersPage";
import CreateOrderPage from "../pages/executive/CreateOrderPage";
import MyDuePaymentsPage from "../pages/executive/MyDuePaymentsPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";
import OrderItemsPage from "../pages/executive/OrderItemsPage";
import VendorDetailsPage from "../pages/executive/VendorDetailsPage";
import EditVendorPage from "../pages/executive/EditVendorPage";
import ReportsPage from "../pages/executive/ReportsPage";
import ExecutiveDetailsPage from "../pages/admin/ExecutiveDetailsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import CreateAreaPage from "../pages/admin/CreateAreaPage";
import CreateExecutivePage from "../pages/admin/CreateExecutivePage";
import AssignExecutiveAreaPage from "../pages/admin/AssignExecutiveAreaPage";

import ProductsPage from "../pages/admin/ProductsPage";
import CreateProductPage from "../pages/admin/CreateProductPage";
import EditProductPage from "../pages/admin/EditProductPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRole="admin" />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
          { path: "/admin/areas", element: <AreasPage /> },
          { path: "/admin/areas/create", element: <CreateAreaPage /> },
          { path: "/admin/executives", element: <ExecutivesPage /> },
          {
            path: "/admin/executives/create",
            element: <CreateExecutivePage />,
          },
          {
            path: "/admin/executives/assign-area",
            element: <AssignExecutiveAreaPage />,
          },
          { path: "/admin/executives/:id", element: <ExecutiveDetailsPage /> },
          { path: "/admin/vendors", element: <VendorsPage /> },
          { path: "/admin/orders", element: <OrdersPage /> },
          { path: "/admin/payments", element: <PaymentsDuePage /> },
          { path: "/admin/reports", element: <AdminReportsPage /> },
          { path: "/admin/products", element: <ProductsPage /> },
          { path: "/admin/products/create", element: <CreateProductPage /> },
          { path: "/admin/products/:id/edit", element: <EditProductPage /> },
        ],
      },
      {
        element: <RoleRoute allowedRole="executive" />,
        children: [
          { path: "/executive", element: <ExecutiveDashboardPage /> },
          { path: "/executive/vendors", element: <MyVendorsPage /> },
          { path: "/executive/vendors/:id", element: <VendorDetailsPage /> },
          { path: "/executive/vendors/:id/edit", element: <EditVendorPage /> },
          { path: "/executive/vendors/create", element: <CreateVendorPage /> },
          { path: "/executive/orders", element: <MyOrdersPage /> },
          { path: "/executive/orders/:id/items", element: <OrderItemsPage /> },
          { path: "/executive/orders/create", element: <CreateOrderPage /> },
          { path: "/executive/payments", element: <MyDuePaymentsPage /> },
          { path: "/executive/reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <LoginPage />,
  },
]);
