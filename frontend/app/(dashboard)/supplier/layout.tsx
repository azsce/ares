"use client";

import React from "react";
import {
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  EventNote as BookingsIcon,
  AttachMoney as EarningsIcon,
  RateReview as ReviewsIcon,
} from "@mui/icons-material";
import DashboardShell, { type DashboardMenuItem } from "../_components/DashboardShell";

const menuItems: DashboardMenuItem[] = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/supplier/dashboard" },
  { text: "Vehicles", icon: <CarIcon />, path: "/supplier/vehicles" },
  { text: "Bookings", icon: <BookingsIcon />, path: "/supplier/bookings" },
  { text: "Reviews", icon: <ReviewsIcon />, path: "/supplier/reviews" },
  { text: "Earnings", icon: <EarningsIcon />, path: "/supplier/earnings" },
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
