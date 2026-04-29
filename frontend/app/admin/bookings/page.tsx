import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Box, Typography } from "@mui/material";
import BookingsManager from "./_components/BookingsManager";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);

  // حماية المسار: لازم يكون Admin أو Supplier
  if (!session || !session.user?.roles?.length) redirect("/sign-in");
  
  const userRole = session.user.roles.includes("Supplier") ? "Supplier" : "Admin";
  if (userRole !== "Admin" && userRole !== "Supplier") redirect("/admin");

  const user = {
    id: session.user.id,
    role: userRole
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}>
          Bookings Management
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          View, filter, and manage all car rental reservations.
        </Typography>
      </Box>

      {/* بنبعت بيانات اليوزر للكومبوننت اللي هيرسم الجدول */}
      <BookingsManager user={user} initialLanguage="en" />
    </Box>
  );
}