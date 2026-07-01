import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/shared/i18n/routing";
import { getVehiclesApi, getAdminVehicleStatsApi } from "@/api-clients/cars/cars";
import VehiclesClient from "./VehiclesClient";

export const metadata: Metadata = {
  title: "Admin Fleet Management | ARES Car Rental",
  description:
    "Monitor operational status, view performance metrics, and perform bulk operations on the vehicle fleet.",
};

export default async function AdminCarsPage() {
  const locale = await getLocale();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.roles?.includes("Admin") || !session.accessToken) {
    return redirect({ href: "/", locale });
  }

  let initialVehiclesData = undefined;
  let initialStats = undefined;

  try {
    const [vehiclesRes, statsRes] = await Promise.all([
      getVehiclesApi(session.accessToken, 1, 10, {}),
      getAdminVehicleStatsApi(session.accessToken),
    ]);
    initialVehiclesData = {
      data: vehiclesRes.data || [],
      totalPages: vehiclesRes.totalPages || 1,
      totalCount: vehiclesRes.totalCount || 0,
    };
    initialStats = statsRes;
  } catch (err) {
    // If server fetch fails, client component will fallback to loading on mount
  }

  return (
    <VehiclesClient
      accessToken={session.accessToken}
      initialVehiclesData={initialVehiclesData}
      initialStats={initialStats}
    />
  );
}
