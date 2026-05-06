"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSession } from "next-auth/react";
import { apiFetchJson, ApiError } from "@/utils/api-client";
import { logger } from "@/utils/logger";

// ── Response shape from GET /api/dashboard/recent-summary ────────────────────
interface RecentActivityItem {
  type: "booking" | "payment" | "user" | "vehicle";
  message: string;
  createdAt: string; // ISO-8601 UTC from the database — always real
  icon: string;
}

// ── Fallback API response shapes ──────────────────────────────────────────────
interface RawBooking {
  id?: string | number;
  _id?: string | number;
  bookingNumber?: string;
  status?: string;
  user?: { firstName?: string; lastName?: string };
  driver?: { fullName?: string };
  createdAt?: string;
  updatedAt?: string;
  from?: string;
}
interface RawUser {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt?: string;
}
interface RawVehicle {
  vehicleId?: string;
  id?: string | number;
  make?: string;
  model?: string;
  year?: number;
  createdAt?: string; // present after VehicleListDto update
}
// PagedResult<T> from backend serialises as { data, page, pageSize, totalCount, totalPages }
interface PagedResult<T> {
  data?: T[];
  // legacy/other shapes
  resultData?: T[];
  items?: T[];
}

// ── Icon + colour per type ────────────────────────────────────────────────────
const TYPE_META: Record<
  RecentActivityItem["type"],
  { color: "primary" | "success" | "warning" | "info"; icon: React.ReactNode }
> = {
  booking: { color: "primary", icon: <EventAvailableIcon fontSize="small" /> },
  payment: { color: "success", icon: <PaymentIcon fontSize="small" /> },
  user:    { color: "info",    icon: <PersonAddIcon fontSize="small" /> },
  vehicle: { color: "warning", icon: <DirectionsCarIcon fontSize="small" /> },
};

// ── Timestamp formatter ───────────────────────────────────────────────────────
// Today  → relative  ("2 min ago", "1 hr ago")
// Older  → short date ("Apr 29", "May 1")
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "–";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Clamp negative diff (slight clock skew)
  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);

  // Same calendar day → relative
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth()    === now.getMonth()    &&
    date.getDate()     === now.getDate();

  if (sameDay) {
    if (seconds < 60)  return "just now";
    if (minutes < 60)  return `${minutes} min ago`;
    return `${hours} hr ago`;
  }

  // Older than today → "Apr 29" or "Apr 29, 2025" if a different year
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fallback: assemble from the three existing working APIs
// ─────────────────────────────────────────────────────────────────────────────
async function fetchViaFallbackApis(
  accessToken: string,
  isSupplier: boolean,
  userId: string,
): Promise<RecentActivityItem[]> {

  const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
    // Bookings — POST /api/admin/bookings/search/1/10
    apiFetchJson<PagedResult<RawBooking>>("api/admin/bookings/search/1/10", {
      method: "POST",
      accessToken,
      body: JSON.stringify({
        userId: null,
        suppliers: isSupplier ? [userId] : null,
        statuses: null,
        carId: null,
        filter: { from: null, to: null, keyword: null, pickupLocation: null, dropOffLocation: null },
        page: 1,
        size: 10,
        language: "en",
      }),
    }).catch((err: unknown) => { logger.error("RecentActivity fallback: bookings", err); return null; }),

    // Users — POST /api/admin/users/1/10
    apiFetchJson<PagedResult<RawUser>>("api/admin/users/1/10", {
      method: "POST",
      accessToken,
      body: JSON.stringify({ keyword: null, types: ["user"] }),
    }).catch((err: unknown) => { logger.error("RecentActivity fallback: users", err); return null; }),

    // Vehicles — POST /api/vehicles/search/1/10
    // Response is PagedResult<VehicleListDto> → serialises as { data: [...], ... }
    apiFetchJson<PagedResult<RawVehicle>>("api/vehicles/search/1/10", {
      method: "POST",
      accessToken,
      body: JSON.stringify({ suppliers: null, keyword: null }),
    }).catch((err: unknown) => { logger.error("RecentActivity fallback: vehicles", err); return null; }),
  ]);

  // Keep only the single most-recent item per type
  const latestByType = new Map<RecentActivityItem["type"], RecentActivityItem>();

  const keepLatest = (item: RecentActivityItem) => {
    const prev = latestByType.get(item.type);
    if (!prev || new Date(item.createdAt) > new Date(prev.createdAt)) {
      latestByType.set(item.type, item);
    }
  };

  // ── Bookings ──────────────────────────────────────────────────────────────
  // Backend may return resultData or data depending on which endpoint/version
  const bookings = bookingsRes?.resultData ?? bookingsRes?.data ?? bookingsRes?.items ?? [];
  for (const b of bookings) {
    const createdAt = b.createdAt ?? b.from;
    if (!createdAt) continue; // no timestamp → skip rather than fake

    const rawId = String(b.id ?? b._id ?? "");
    const shortId = (b.bookingNumber ?? rawId.substring(0, 6)).toUpperCase();
    const customer =
      b.user
        ? `${b.user.firstName ?? ""} ${b.user.lastName ?? ""}`.trim() || "a customer"
        : b.driver?.fullName ?? "a customer";

    keepLatest({ type: "booking", message: `Booking #${shortId} created by ${customer}`, createdAt, icon: "booking" });

    // Payment: only when the booking has been paid (Confirmed or Completed)
    if ((b.status === "Completed" || b.status === "Confirmed") && b.updatedAt) {
      keepLatest({ type: "payment", message: `Payment completed for Booking #${shortId}`, createdAt: b.updatedAt, icon: "payment" });
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = usersRes?.resultData ?? usersRes?.data ?? usersRes?.items ?? [];
  for (const u of users) {
    if (!u.createdAt) continue;
    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || "New user";
    keepLatest({ type: "user", message: `New user registered: ${fullName}`, createdAt: u.createdAt, icon: "user" });
  }

  // ── Vehicles ──────────────────────────────────────────────────────────────
  // PagedResult serialises as { data: [...] }
  const vehicles = vehiclesRes?.data ?? vehiclesRes?.resultData ?? vehiclesRes?.items ?? [];
  for (const v of vehicles) {
    if (!v.createdAt) continue; // available after VehicleListDto.CreatedAt added
    const label = [v.make, v.model].filter(Boolean).join(" ") || "Vehicle";
    keepLatest({ type: "vehicle", message: `Vehicle ${label} added`, createdAt: v.createdAt, icon: "vehicle" });
  }

  return [...latestByType.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RecentActivity() {
  const theme = useTheme();
  const { data: session } = useSession();

  const [items, setItems]     = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const fetchActivity = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(false);

    // ── Strategy 1: dedicated endpoint (available after backend rebuild) ──
    try {
      const data = await apiFetchJson<RecentActivityItem[]>(
        "api/dashboard/recent-summary",
        { accessToken: session.accessToken },
      );
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
      return;
    } catch (primaryErr: unknown) {
      const status = primaryErr instanceof ApiError ? primaryErr.status : 0;
      if (status !== 404) {
        // Real server error (401, 500…) — surface it
        logger.error("RecentActivity: primary endpoint failed", primaryErr);
        setError(true);
        setLoading(false);
        return;
      }
      // 404 = endpoint not compiled yet → fall back silently
      logger.warn("RecentActivity: /recent-summary returned 404, using fallback APIs");
    }

    // ── Strategy 2: assemble from existing working APIs ───────────────────
    try {
      const isSupplier = session.user?.roles?.includes("Supplier") ?? false;
      const userId     = session.user?.id ?? "";
      const fallback   = await fetchViaFallbackApis(session.accessToken, isSupplier, userId);
      setItems(fallback);
    } catch (fallbackErr: unknown) {
      logger.error("RecentActivity: fallback also failed", fallbackErr);
      setItems([]); // graceful empty rather than error banner
    }

    setLoading(false);
  }, [session?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  // ── Render ────────────────────────────────────────────────────────────────

  const renderBody = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 180 }}>
          <CircularProgress size={26} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 180, gap: 1 }}>
          <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
            Failed to load recent activity.
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => { void fetchActivity(); }}
          >
            Try again
          </Typography>
        </Box>
      );
    }

    if (items.length === 0) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 180 }}>
          <Typography color="text.secondary" variant="body2">
            No recent activity available.
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={0.5}>
        {items.map((item, idx) => {
          const meta = TYPE_META[item.type] ?? TYPE_META.booking;
          const colorMain = theme.palette[meta.color].main;

          return (
            <Box
              key={`${item.type}-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1,
                px: 1,
                borderRadius: 2,
                transition: "background 0.15s ease",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: alpha(colorMain, 0.1),
                  color: colorMain,
                  flexShrink: 0,
                }}
              >
                {meta.icon}
              </Avatar>

              <Box
                sx={{
                  minWidth: 0,
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.84rem",
                    color: "text.primary",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.message}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", flexShrink: 0, whiteSpace: "nowrap" }}
                >
                  {formatTimestamp(item.createdAt)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    );
  };

  return (
    <Card
      elevation={0}
      sx={t => ({
        borderRadius: 4,
        border: "1px solid",
        borderColor: t.palette.border?.main ?? t.palette.divider,
        height: "100%",
        boxShadow: t.palette.shadow?.card ?? "none",
        overflow: "hidden",
      })}
    >
      <CardContent sx={{ p: 2.5, height: "100%", "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem" }}>
            Recent Activity
          </Typography>
          <IconButton
            size="small"
            onClick={() => { void fetchActivity(); }}
            disabled={loading}
            aria-label="Refresh recent activity"
            sx={{ transition: "transform 0.25s ease", "&:hover": { transform: "rotate(90deg)" } }}
          >
            <RefreshIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Box>
        {renderBody()}
      </CardContent>
    </Card>
  );
}
