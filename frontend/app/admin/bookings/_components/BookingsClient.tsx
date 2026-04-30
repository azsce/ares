"use client";

import React, { useEffect, useState } from "react";
import { 
  Box, Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, IconButton, 
  CircularProgress, Pagination, useTheme, Checkbox
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon, DeleteSweep as DeleteSweepIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetchJson } from "@/utils/api-client";

// --- Types ---
interface Booking {
  id: string;
  bookingNumber?: string;
  vehicle: { id: string; name: string; pricePerDay?: number } | null;
  supplier: { id: string; fullName: string } | null;
  driver: { id: string; fullName: string; email: string } | null;
  pickupLocation: { id: string; name: string } | null;
  dropOffLocation: { id: string; name: string } | null;
  fromDate: string;
  toDate: string;
  totalPrice: number;
  status: string;
}

export default function BookingsClient() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const pageSize = 10;

  // جلب البيانات
  const fetchBookings = async (currentPage: number) => {
    try {
      setLoading(true);
      if (session?.accessToken) {
        
        const requestBody = {
          suppliers: [],
          statuses: [],
          user: null,
          carId: null, 
          filter: {
            from: null,
            to: null,
            keyword: null,
            pickupLocation: null,
            dropOffLocation: null
          },
          page: currentPage,
          size: pageSize,
          language: "en"
        };

        const response = await apiFetchJson<any>(`api/admin/bookings/search/${currentPage}/${pageSize}`, {
          method: "POST",
          accessToken: session.accessToken,
          body: JSON.stringify(requestBody)
        });
        
        console.log("🚀 API Response Data:", response); // للتحقق من الكونسول

        // سحب البيانات مهما كان المسمى اللي الباك إند باعته
        const bookingsList = response.data || response.items || response.resultData || [];
        setBookings(bookingsList);
        
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || 0) / pageSize) || 1);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchBookings(page);
    }
  }, [page, session]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(bookings.map((b) => b.id)); 
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (idsToDelete: string[]) => {
    if (!confirm(`Are you sure you want to delete ${idsToDelete.length} booking(s)?`)) return;
    
    try {
      if (session?.accessToken) {
        await apiFetchJson(`api/admin/bookings/delete-bookings`, {
          method: "POST",
          accessToken: session.accessToken,
          body: JSON.stringify({ ids: idsToDelete })
        });
        
        alert("Booking(s) deleted successfully");
        setSelectedIds([]);
        fetchBookings(page);
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to delete booking(s)");
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'paid' || s === 'reserved' || s === 'confirmed') return "success";
    if (s === 'pending' || s === 'deposit') return "warning";
    if (s === 'cancelled') return "error";
    return "default";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // 🔥 دالة منفصلة لعرض محتوى الجدول لحل مشكلة الـ Nested Ternary
  const renderTableContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    if (bookings.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
            <Typography color="text.secondary">No bookings found.</Typography>
          </TableCell>
        </TableRow>
      );
    }

    return bookings.map((booking) => {
      const isSelected = selectedIds.includes(booking.id);
      return (
        <TableRow key={booking.id} hover selected={isSelected}>
          <TableCell padding="checkbox">
            <Checkbox 
              color="primary" 
              checked={isSelected} 
              onChange={() => handleSelectOne(booking.id)} 
            />
          </TableCell>
          <TableCell>
            <Typography variant="subtitle2" fontWeight="600">{booking.vehicle?.name || "Deleted Vehicle"}</Typography>
            <Typography variant="caption" color="text.secondary">By: {booking.supplier?.fullName || "N/A"}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{booking.driver?.fullName || "N/A"}</Typography>
            <Typography variant="caption" color="text.secondary">{booking.driver?.email}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{formatDate(booking.fromDate)}</Typography>
            <Typography variant="caption" color="text.secondary">To: {formatDate(booking.toDate)}</Typography>
          </TableCell>
          <TableCell>
            <Typography fontWeight="bold">${booking.totalPrice || 0}</Typography>
          </TableCell>
          <TableCell>
            <Chip 
              label={booking.status || 'Pending'} 
              color={getStatusColor(booking.status) as any} 
              size="small" 
              variant="filled"
            />
          </TableCell>
          <TableCell align="right">
            <IconButton color="primary" onClick={() => router.push(`/admin/bookings/${booking.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete([booking.id])}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="800">
          Bookings Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {selectedIds.length > 0 && (
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={() => handleDelete(selectedIds)}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/admin/bookings/create')}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Add New Booking
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox 
                    color="primary"
                    indeterminate={selectedIds.length > 0 && selectedIds.length < bookings.length}
                    checked={bookings.length > 0 && selectedIds.length === bookings.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vehicle / Supplier</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 🔥 استدعاء دالة عرض محتوى الجدول هنا */}
              {renderTableContent()}
            </TableBody>
          </Table>
        </TableContainer>
        
        {!loading && bookings.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
}