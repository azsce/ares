"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react"; // استدعاء الجلسة عشان نجيب التوكن
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TablePagination, Chip, Checkbox, Button, IconButton, TextField, MenuItem, Toolbar, Typography, CircularProgress
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, FilterList as FilterIcon } from "@mui/icons-material";
import Link from "next/link";
import { apiFetchJson } from "@/utils/api-client";

interface BookingItem {
  _id?: string;
  id?: string;
  car: { id?: string; name: string; image?: string };
  supplier: { id?: string; fullName: string };
  driver?: { id?: string; fullName: string; phone?: string };
  pickupLocation?: { id?: string; name: string };
  dropOffLocation?: { id?: string; name: string };
  from: string;
  to: string;
  price: number;
  status: string;
  payLater?: boolean;
}

const USE_MOCK_API = false;

export default function BookingsManager({ user, initialLanguage }: { readonly user: {id: string, role: string}; readonly initialLanguage: string }) {
  const { data: session } = useSession(); // سحب التوكن من الـ NextAuth
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Selection for Bulk Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [keyword, setKeyword] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = `api/admin/bookings/search/${(page + 1).toString()}/${rowsPerPage.toString()}`;
      
      const payload = {
        userId: null,
        suppliers: user.role === "Supplier" ? [user.id] : null,
        statuses: statusFilter === "All" ? null : [statusFilter],
        carId: null,
        filter: {
          from: null,
          to: null,
          keyword: keyword || null,
          pickupLocation: null,
          dropOffLocation: null
        },
        page: page + 1,
        size: rowsPerPage,
        language: initialLanguage || "en"
      };

      const data = await apiFetchJson<any>(endpoint, {
        method: "POST",
        accessToken: (session as any)?.accessToken,
        body: JSON.stringify(payload),
      });

      // دعم أسماء المصفوفات المختلفة سواء Mock أو Real API
      setBookings(data.resultData || data.data || data.items || []);
      setTotalRecords(data.pageInfo?.[0]?.totalRecords || data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, initialLanguage, user.id, user.role, statusFilter, keyword, session]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  // Handle Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // استخدام id أو _id بناءً على اللي راجع
      setSelectedIds(bookings.map((b) => (b.id || b._id) as string));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Handle Bulk Delete
  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} bookings?`)) return;
    
    try {
      await apiFetchJson(`api/admin/bookings/delete-bookings`, {
        method: "POST",
        accessToken: (session as any)?.accessToken,
        body: JSON.stringify({ ids: selectedIds }),
      });
      
      setSelectedIds([]);
      void fetchBookings(); // Refresh table
    } catch (err) {
      alert("Failed to delete bookings");
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      
      {/* شريط الفلاتر والأدوات */}
      <Toolbar sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {selectedIds.length > 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography color="inherit" variant="subtitle1">
              {selectedIds.length} selected
            </Typography>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => void handleDeleteSelected()}>
              Delete Selected
            </Button>
          </Box>
        ) : (
          <>
            <TextField
              size="small"
              placeholder="Search by keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={() => setPage(0)} // Reset page on search
              sx={{ minWidth: 250, bgcolor: 'white', borderRadius: 1 }}
            />
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </>
        )}
      </Toolbar>

      {/* الجدول */}
      <TableContainer sx={{ maxHeight: '60vh' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox 
                  indeterminate={selectedIds.length > 0 && selectedIds.length < bookings.length}
                  checked={bookings.length > 0 && selectedIds.length === bookings.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Car Model</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}>No bookings found.</TableCell></TableRow>
            ) : (
              bookings.map((row) => {
                const rowId = (row.id || row._id) as string; // تظبيط قراءة الـ ID
                return (
                  <TableRow hover key={rowId} selected={selectedIds.includes(rowId)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedIds.includes(rowId)} onChange={() => handleSelectOne(rowId)} />
                    </TableCell>
                    <TableCell>{row.car?.name}</TableCell>
                    <TableCell>{row.driver?.fullName}</TableCell>
                    <TableCell>{row.supplier?.fullName}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      {row.from ? new Date(row.from).toLocaleDateString() : ""} - {row.to ? new Date(row.to).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>${row.price}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        size="small" 
                        color={row.status === 'Paid' ? 'success' : row.status === 'Cancelled' ? 'error' : 'warning'} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton component={Link} href={`/admin/bookings/${rowId}/edit`} size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalRecords}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  );
}