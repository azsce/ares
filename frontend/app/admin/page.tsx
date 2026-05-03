"use client";

import { useSession } from "next-auth/react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useDashboardData } from "./hooks/useDashboardData";
import DashboardSkeleton from "./_components/DashboardSkeleton";
import WelcomeHeader from "./_components/WelcomeHeader";
import StatsGrid from "./_components/StatsGrid";
import RevenueChart from "./_components/RevenueChart";
import QuickActions from "./_components/QuickActions";
import RecentBookingsTable from "./_components/RecentBookingsTable";
import UpcomingBookings from "./_components/UpcomingBookings";
import ActivityFeed from "./_components/ActivityFeed";
import SystemStatusCard from "./_components/SystemStatusCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const { loading, summary, recentBookings, upcomingBookings, activities, revenueData } = useDashboardData();

  if (loading || !summary) {
    return <DashboardSkeleton />;
  }

  // تحضير البيانات للإحصائيات الأربعة
  const stats = [
    {
      title: "Total Bookings",
      value: summary.totalBookings.toLocaleString(),
      change: "+12.5%",
      isUp: true,
      icon: "EventAvailable",
      color: "primary",
    },
    {
      title: "Active Vehicles",
      value: summary.totalVehicles.toLocaleString(),
      change: "+4.2%",
      isUp: true,
      icon: "DirectionsCar",
      color: "success",
    },
    {
      title: "Total Revenue",
      value: `$${summary.totalRevenue.toLocaleString()}`,
      change: "+18.2%",
      isUp: true,
      icon: "AttachMoney",
      color: "warning",
    },
    {
      title: "Total Users",
      value: summary.totalUsers.toLocaleString(),
      change: "-2.1%",
      isUp: false,
      icon: "PeopleAlt",
      color: "error",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default" }}>
      <WelcomeHeader userName={session?.user?.firstName} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <StatsGrid stats={stats} />

       {/* صف الرسم البياني والأزرار السريعة */}
        <RevenueChart data={revenueData} />
        <RecentBookingsTable bookings={recentBookings} />

        {/* صف الجداول والنشاطات */}
        {/* هنا خلينا الأساس عمود واحد للموبايل، ويبقوا عمودين بس في الشاشات الكبيرة جداً */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          
          {/* الجروب الأول */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UpcomingBookings bookings={upcomingBookings} />
            <QuickActions />
          </div>

          {/* الجروب الثاني */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityFeed activities={activities} />
            <SystemStatusCard />
          </div>
          
        </div>
      </motion.div>
    </Box>
  );
}