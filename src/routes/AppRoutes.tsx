import { DashboardLayout } from "@/components/DashboardLayout"
import { CafePage } from "@/pages/cafe/"
import { CafeListPage } from "@/pages/cafe/CafeListPage"
import ViewCafe from "@/pages/cafe/ViewCafe"
import { CouponPage } from "@/pages/coupon"
import { CouponListPage } from "@/pages/coupon/CouponList"
import { ViewCouponPage } from "@/pages/coupon/ViewCouponPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { StudentPage } from "@/pages/student"
import { StudentListPage } from "@/pages/student/StudentListPage"
import ViewTfStudentPage from "@/pages/student/ViewTfPage"
import { TransactionPage } from "@/pages/TransactionPage"
import { Navigate, type RouteObject } from "react-router-dom"

export const AppRoutes: RouteObject[] = [
  { path: "/ekupon-admin/login", element: <LoginPage /> },
  {
    path: "/ekupon-admin",
    element: <DashboardLayout />, // Sidebar layout
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <DashboardPage /> },
      {
        path: "student",
        element: <StudentPage />,
        children: [
          { path: "", element: <StudentListPage /> },
          { path: ":icNo/:fundId", element: <ViewTfStudentPage /> },
        ],
      },
      {
        path: "cafe",
        element: <CafePage />,
        children: [
          { path: "", element: <CafeListPage /> },
          { path: ":id", element: <ViewCafe /> },
        ],
      },
      { path: "transaction", element: <TransactionPage /> },
      {
        path: "coupon",
        element: <CouponPage />,
        children: [
          { path: "", element: <CouponListPage /> },
          { path: ":id", element: <ViewCouponPage /> },
        ],
      },
    ],
  },
]
