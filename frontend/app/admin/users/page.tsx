"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  InputAdornment,
  Card,
  Pagination,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toggleUserStatus, getUsers } from "@/app/api/users/users";

// ── UI Card ─────────────────────────────
function StatCard({ label, value, color }: any) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        background: theme =>
          `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.08)} 100%)`,
      }}
    >
      <Typography variant="overline" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ color }}>
        {value}
      </Typography>
    </Card>
  );
}

// ── PAGE ───────────────────────────────
export default function UsersPage() {
  const theme = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  // ── FETCH USERS ───────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(1, 100);

      // ✅ Normalize status here
      const normalized = (data?.data || []).map((u: any) => ({
        ...u,
        status: (u.status || "").toLowerCase(),
      }));

      setUsers(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── FILTER ────────────────────────────
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || u.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  // ── STATS ─────────────────────────────
  const totalUsers = users.length;

  const activeUsers = users.filter(u => u.status === "active").length;

  const blockedUsers = users.filter(u => u.status === "blocked").length;

  // ── PAGINATION ────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1300, mx: "auto" }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Users Directory
          </Typography>
          <Typography color="text.secondary">Manage platform users</Typography>
        </Box>

        {/* ACTION BUTTON */}
        <Stack direction="row" spacing={2}>
          <Link href="/admin/users/create" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                px: 2.5,
                py: 1.2,
                borderRadius: 3,
                fontWeight: 700,
                color: "#fff",
                background: theme =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                },
              }}
            >
              + Add New User
            </Box>
          </Link>
        </Stack>
      </Stack>

      {/* STATS */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatCard label="Total Users" value={totalUsers} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Active Users" value={activeUsers} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Blocked Users" value={blockedUsers} color={theme.palette.error.main} />
        </Grid>
      </Grid>

      {/* FILTER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
      >
        <TextField
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 160 }}>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* TABLE */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 3 }}>
          <TableContainer>
            <Table sx={{ minWidth: { xs: 0, sm: 500 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  {/* Hide Contact column on xs */}
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Contact
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pageData.length > 0 ? (
                  pageData.map(u => {
                    const status = (u.status || "").toLowerCase();
                    const isActive = status === "active";

                    return (
                      <TableRow key={u.id} hover>
                        {/* USER */}
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: theme.palette.primary.light, fontWeight: 700 }}>
                              {u.firstName?.[0]}
                              {u.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {u.firstName} {u.lastName}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* CONTACT */}
                        <TableCell>{u.email}</TableCell>

                        {/* STATUS */}
                        <TableCell>
                          <Chip
                            label={status}
                            sx={{
                              textTransform: "capitalize",
                              bgcolor: isActive
                                ? alpha(theme.palette.success.main, 0.15)
                                : alpha(theme.palette.error.main, 0.15),
                              color: isActive ? theme.palette.success.main : theme.palette.error.main,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        {/* ACTIONS */}
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={1}>
                            <Tooltip title="View">
                              <IconButton component={Link} href={`/admin/users/${u.id}`}>
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit">
                              <IconButton component={Link} href={`/admin/users/${u.id}/edit`}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={isActive ? "Block User" : "Activate User"}>
                              <IconButton
                                onClick={async () => {
                                  await toggleUserStatus(u.id);
                                  fetchUsers();
                                }}
                                sx={{
                                  color: isActive ? "error.main" : "success.main",
                                }}
                              >
                                {isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  /* ── EMPTY STATE ────────────────────────── */
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                      <Box sx={{ textAlign: "center", opacity: 0.6 }}>
                        <SearchIcon sx={{ fontSize: 60, mb: 2, color: "text.disabled" }} />
                        <Typography variant="h6" fontWeight={700} color="text.secondary">
                          No users found
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          Try adjusting your search or filters to find what you're looking for.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          <Stack direction="row" justifyContent="space-between" p={2}>
            <Typography variant="caption">
              Showing {pageData.length} of {filtered.length}
            </Typography>

            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
