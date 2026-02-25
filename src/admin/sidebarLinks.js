import {
  LayoutDashboard,
  Users,
  Boxes,
  ShoppingCart,
  IndianRupee,
  Settings,
  LogOut,
} from "lucide-react";

export const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/add-user", label: "Users / Staff", icon: Users },
  { to: "/admin/add-product", label: "Products", icon: Boxes },
  { to: "/admin/create-order", label: "Orders", icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", icon: IndianRupee },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/requests", label: "User / Staff Request", icon: Settings },
];

export const logoutLink = { label: "Logout", icon: LogOut };
