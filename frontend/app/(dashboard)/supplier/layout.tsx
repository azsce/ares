"use client";

import React from "react";
import { Dashboard as DashboardIcon, DirectionsCar as CarIcon } from "@mui/icons-material";
import DashboardShell, { type DashboardMenuItem } from "../_components/DashboardShell";

const menuItems: DashboardMenuItem[] = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/supplier/dashboard" },
  { text: "Vehicles", icon: <CarIcon />, path: "/supplier/vehicles" },
];

export default function SupplierLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <DashboardShell
      menuItems={menuItems}
      sidebarLabel="Supplier"
      userFallbackName="Supplier"
      userFallbackInitial="S"
      userRoleFallback="Supplier"
      notificationsHref="/supplier/notifications"
    >
      {children}
    </DashboardShell>
  );
}
