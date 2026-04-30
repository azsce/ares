"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, Container, Typography, Paper, Button, TextField, 
  MenuItem, CircularProgress, useTheme, InputAdornment, IconButton, Chip, Divider
} from "@mui/material";
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetchJson } from "@/utils/api-client";

// --- Types المطابقة للـ API الجديد ---
interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  totalPrice: number;
  fromDate: string;
  toDate: string;
  pickupLocation: { id: string; name: string } | null;
  dropOffLocation: { id: string; name: string } | null;
  vehicle: { id: string; name: string; pricePerDay: number } | null;
  driver: { id: string; fullName: string; email: string } | null;
  supplier: { id: string; fullName: string } | null;
  notes: string | null;
}

const STATUS_OPTIONS = ["Pending", "Confirmed", "Deposit", "Paid", "Reserved", "Cancelled"];

// دالة لتحويل التاريخ لشكل مقروء في حقول القراءة
const formatDisplayDate = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

export default function EditBookingClient({ bookingId }: { bookingId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. جلب بيانات الحجز
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!session?.accessToken) return;
      try {
        const data = await apiFetchJson<BookingDetail>(`api/admin/bookings/${bookingId}`, {
          accessToken: session.accessToken,
        });
        
        // لو الداتا جاية جوه data (حسب إعدادات PagedResult في بعض الأحيان)
        const bookingData = (data as any).data || data;
        
        setBooking(bookingData);
        setCurrentStatus(bookingData.status || "Pending");
      } catch (error: any) {
        console.error("Failed to load booking details:", error);
        alert("Failed to load booking details. It may not exist.");
        router.push("/admin/bookings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId, session, router]);

  // 2. تحديث الحالة
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStatus(e.target.value);
  };

  // 3. حفظ التعديلات (تحديث الحالة فقط حسب الـ API)
  const handleSaveStatus = async () => {
    if (!session?.accessToken) return;
    setIsSaving(true);
    try {
      await apiFetchJson(`api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        accessToken: session.accessToken,
        body: JSON.stringify({ status: currentStatus })
      });

      setBooking(prev => prev ? { ...prev, status: currentStatus } : null);
      alert("Booking status updated successfully!");
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert(error.message || "Failed to update booking status.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. إلغاء الحجز
  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setIsSaving(true);
    try {
      await apiFetchJson(`api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        accessToken: session.accessToken,
        body: JSON.stringify({ status: "Cancelled" })
      });

      setBooking(prev => prev ? { ...prev, status: "Cancelled" } : null);
      setCurrentStatus("Cancelled");
      alert("Booking has been cancelled.");
    } catch (error: any) {
      alert(error.message || "Failed to cancel booking.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'paid' || s === 'confirmed' || s === 'reserved') return "success";
    if (s === 'pending' || s === 'deposit') return "warning";
    if (s === 'cancelled') return "error";
    return "default";
  };

  const paperSx = { 
    p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, 
    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fafafa' 
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!booking) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/admin/bookings')} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="800">
              Booking #{booking.bookingNumber || "N/A"}
            </Typography>
            <Chip 
              label={booking.status} 
              color={getStatusColor(booking.status) as any} 
              size="small" 
              sx={{ mt: 1, fontWeight: 'bold' }} 
            />
          </Box>
        </Box>
        
        {booking.status !== "Cancelled" && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={isSaving ? <CircularProgress size={20} /> : <CancelIcon />} 
            onClick={handleCancelBooking} 
            disabled={isSaving} 
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Cancel Booking
          </Button>
        )}
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Editable Status & Core Info */}
        <Box className="lg:col-span-1 space-y-6">
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={3} color="primary.main">
              ⚙️ Manage Status
            </Typography>
            
            <TextField 
              select 
              label="Booking Status" 
              value={currentStatus} 
              onChange={handleStatusChange} 
              fullWidth 
              sx={{ mb: 3 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <TextField 
              label="Total Price" 
              value={booking.totalPrice || 0} 
              InputProps={{ 
                readOnly: true,
                startAdornment: <InputAdornment position="start">$</InputAdornment> 
              }} 
              fullWidth 
              sx={{ mb: 3 }}
            />

            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              fullWidth 
              onClick={handleSaveStatus}
              disabled={isSaving || currentStatus === booking.status} 
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />} 
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              {isSaving ? "Saving..." : "Update Status"}
            </Button>
          </Paper>

          {booking.notes && (
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>📝 Booking Notes:</Typography>
              <Typography variant="body2">{booking.notes}</Typography>
            </Paper>
          )}
        </Box>

        {/* Right Column: Read-only Booking Details */}
        <Box className="lg:col-span-2 space-y-6">
          
          {/* Dates & Locations */}
          <Paper elevation={0} sx={paperSx}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <LocationIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Dates & Locations</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Pickup Location" value={booking.pickupLocation?.name || "N/A"} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              <TextField label="Drop-off Location" value={booking.dropOffLocation?.name || "N/A"} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              <TextField label="From Date" value={formatDisplayDate(booking.fromDate)} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              <TextField label="To Date" value={formatDisplayDate(booking.toDate)} InputProps={{ readOnly: true }} fullWidth variant="filled" />
            </Box>
          </Paper>

          {/* Vehicle & Supplier */}
          <Paper elevation={0} sx={paperSx}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <CarIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Vehicle Details</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Vehicle" value={booking.vehicle?.name || "N/A"} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              <TextField label="Price Per Day" value={booking.vehicle?.pricePerDay ? `$${booking.vehicle.pricePerDay}` : "N/A"} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              <TextField label="Supplier" value={booking.supplier?.fullName || "N/A"} InputProps={{ readOnly: true }} fullWidth variant="filled" />
            </Box>
          </Paper>

          {/* Driver Details */}
          <Paper elevation={0} sx={paperSx}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Driver Information</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {booking.driver ? (
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Driver Name" value={booking.driver.fullName} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                <TextField label="Driver Email" value={booking.driver.email} InputProps={{ readOnly: true }} fullWidth variant="filled" />
              </Box>
            ) : (
              <Typography color="text.secondary" fontStyle="italic">No driver assigned to this booking.</Typography>
            )}
          </Paper>

        </Box>
      </Box>
    </Container>
  );
}