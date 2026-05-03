// app/admin/layout.tsx
import { ReactNode } from "react";
import { Metadata } from "next";
import AdminLayoutClient from "./_components/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Ares Rentals",
  description: "Manage bookings, vehicles, users, and more",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}