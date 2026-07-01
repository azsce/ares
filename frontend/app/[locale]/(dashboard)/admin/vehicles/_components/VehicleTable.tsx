"use client";

import { memo, type JSX } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Checkbox,
  Stack,
  CircularProgress,
  LinearProgress,
  Pagination,
  Tooltip,
  Alert,
  Button,
  alpha,
  type Theme,
} from "@mui/material";
import {
  EditRounded as EditIcon,
  DeleteOutlineRounded as DeleteIcon,
  DirectionsCarFilledTwoTone as CarIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";
import VisibilityOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Vehicle } from "@/api-clients/cars/cars";
import { toImageUrl } from "@/utils/image-url";

type StatusColor = "success" | "warning" | "info" | "error";

const getStatusConfig = (v: Vehicle, t: (key: string) => string): { label: string; colorKey: StatusColor } => {
  if (v.isOnRental) return { label: t("statusLabels.fullyBooked"), colorKey: "warning" };
  const rawStatus = (v.status ?? "").toLowerCase();
  const rawAvail = (v.availabilityStatus ?? "").toLowerCase();
  if (rawStatus === "pending") {
    return { label: t("statusLabels.pending"), colorKey: "warning" };
  }
  if (rawStatus === "approved" || rawStatus === "active") {
    return { label: t("statusLabels.approved"), colorKey: "success" };
  }
  if (rawStatus === "rejected") {
    return { label: t("statusLabels.rejected"), colorKey: "error" };
  }
  if (rawStatus === "maintenance" || rawAvail === "maintenance") {
    return { label: t("statusLabels.maintenance"), colorKey: "info" };
  }
  if (rawStatus === "retired" || v.category === "Deleted") {
    return { label: t("statusLabels.retired"), colorKey: "error" };
  }
  if (v.available) return { label: t("statusLabels.available"), colorKey: "success" };
  return { label: t("statusLabels.unavailable"), colorKey: "info" };
};

const ActionButtons = memo(function ActionButtons({
  vehicleId,
  available,
  hasActiveBookings,
  onDelete,
  onNavigate,
}: {
  readonly vehicleId: string;
  readonly available: boolean;
  readonly hasActiveBookings?: boolean;
  readonly onDelete: (id: string, available: boolean, hasBookings?: boolean) => void;
  readonly onNavigate: (path: string) => void;
}) {
  const t = useTranslations("dashboardAdmin.vehicles");

  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title={t("tooltips.view")}>
        <IconButton
          size="small"
          onClick={() => {
            onNavigate(`/admin/vehicles/${vehicleId}`);
          }}
          sx={{ borderRadius: 2 }}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={t("tooltips.edit")}>
        <IconButton
          size="small"
          onClick={() => {
            onNavigate(`/admin/vehicles/${vehicleId}`);
          }}
          sx={{ borderRadius: 2 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={available && !hasActiveBookings ? t("tooltips.delete") : t("tooltips.cannotDeleteRented")}>
        <span>
          <IconButton
            onClick={() => {
              onDelete(vehicleId, available, hasActiveBookings);
            }}
            size="small"
            disabled={!available || hasActiveBookings}
            sx={{
              borderRadius: 2,
              "&:hover": {
                bgcolor: theme => alpha(theme.palette.error.main, 0.1),
                color: "error.main",
              },
              "&.Mui-disabled": { opacity: 0.3 },
            }}
          >
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
});

const VehicleMobileCard = memo(function VehicleMobileCard({
  v,
  theme,
  onDelete,
  onNavigate,
}: {
  readonly v: Vehicle;
  readonly theme: Theme;
  readonly onDelete: (id: string, available: boolean, hasBookings?: boolean) => void;
  readonly onNavigate: (path: string) => void;
}) {
  const t = useTranslations("dashboardAdmin.vehicles");
  const status = getStatusConfig(v, t);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "background 0.15s",
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.03) },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 2,
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {v.imageUrl ? (
            <Image
              src={toImageUrl(v.imageUrl) as string}
              alt={`${v.make} ${v.model}`}
              width={100}
              height={80}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <CarIcon fontSize="small" />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
            {v.make} {v.model}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {v.categoryName || v.category || "General"}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              label={status.label}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: alpha((theme.palette[status.colorKey] as { main: string }).main, 0.15),
                color: (theme.palette[status.colorKey] as { main: string }).main,
              }}
            />
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontWeight: 800, color: "primary.main" }}>${v.dailyRate}</Typography>
          <Typography variant="caption" color="text.secondary">
            /{t("tableHeaders.dailyRate").split(" ").pop() || "day"}
          </Typography>
        </Box>
      </Stack>

      <ActionButtons
        vehicleId={v.id}
        available={!!v.available}
        hasActiveBookings={v.hasActiveBookings}
        onDelete={onDelete}
        onNavigate={onNavigate}
      />
    </Paper>
  );
});

function EmptyState({
  filtersActive,
  handleClearFilters,
}: {
  readonly filtersActive: boolean;
  readonly handleClearFilters: () => void;
}) {
  const t = useTranslations("dashboardAdmin.vehicles");

  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Avatar
        sx={{
          width: 64,
          height: 64,
          mx: "auto",
          mb: 2,
          bgcolor: (t: import("@mui/material").Theme) => alpha(t.palette.text.disabled, 0.1),
        }}
      >
        <SearchIcon sx={{ fontSize: 32, color: "text.disabled" }} />
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 700 }} color="text.secondary">
        {filtersActive ? t("emptyState.noMatchTitle") : t("emptyState.noVehiclesTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {filtersActive ? t("emptyState.noMatchDesc") : t("emptyState.noVehiclesDesc")}
      </Typography>
      {filtersActive && (
        <Button
          size="small"
          variant="outlined"
          onClick={handleClearFilters}
          sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none" }}
        >
          {t("emptyState.clearFiltersBtn")}
        </Button>
      )}
    </Box>
  );
}

// Separate helper component to avoid recreating in each render
const Avatar = memo(function Avatar({ sx, children }: { readonly sx: object; readonly children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
});

const VehicleTableRow = memo(function VehicleTableRow({
  v,
  theme,
  onDelete,
  onNavigate,
  selected,
  onToggle,
}: {
  readonly v: Vehicle;
  readonly theme: Theme;
  readonly onDelete: (id: string, available: boolean, hasBookings?: boolean) => void;
  readonly onNavigate: (path: string) => void;
  readonly selected: boolean;
  readonly onToggle: () => void;
}) {
  const t = useTranslations("dashboardAdmin.vehicles");
  const status = getStatusConfig(v, t);
  const paletteColor = theme.palette[status.colorKey] as {
    main: string;
  };
  const statusColor = paletteColor.main;

  return (
    <TableRow
      hover
      sx={{
        transition: "background 0.15s",
        "&:last-child td": { border: 0 },
        "&:hover": {
          bgcolor: t => alpha(t.palette.primary.main, 0.03),
        },
      }}
    >
      <TableCell padding="checkbox" sx={{ pl: 2 }}>
        <Checkbox size="small" checked={selected} onChange={onToggle} color="primary" />
      </TableCell>
      <TableCell sx={{ py: { xs: 1.2, sm: 1.8 }, pl: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: { xs: 40, sm: 52 },
              height: { xs: 40, sm: 52 },
              borderRadius: 2,
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: t => alpha(t.palette.primary.main, 0.08),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {v.imageUrl ? (
              <Image
                src={toImageUrl(v.imageUrl) as string}
                alt={`${v.make} ${v.model}`}
                width={420}
                height={300}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <CarIcon fontSize="small" />
            )}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 15 }, color: "text.primary" }}>
              {v.make} {v.model}
            </Typography>
            <Stack
              direction="row"
              spacing={0.8}
              sx={{ alignItems: "center", display: { xs: "flex", sm: "none" }, mt: 0.3 }}
            >
              <Typography variant="caption" color="text.secondary">
                {v.categoryName || v.category || "General"}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                ·
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }} color="primary.main">
                ${v.dailyRate}/{t("tableHeaders.dailyRate").split(" ").pop() || "day"}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </TableCell>

      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
        <Chip
          label={v.categoryName || v.category || "General"}
          size="small"
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: t => alpha(t.palette.primary.main, 0.08),
            color: "primary.main",
          }}
        />
      </TableCell>

      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
        <Typography sx={{ fontWeight: 700 }} color="primary.main">
          ${v.dailyRate}
          <Typography component="span" sx={{ fontWeight: 400 }} variant="caption" color="text.secondary">
            {" "}
            /{t("tableHeaders.dailyRate").split(" ").pop() || "day"}
          </Typography>
        </Typography>
      </TableCell>

      <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }} noWrap>
          {v.supplierName?.trim() || "—"}
        </Typography>
      </TableCell>

      <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
        <Typography variant="body2" color="text.secondary">
          {v.year ?? "—"}
        </Typography>
      </TableCell>

      <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
        <Typography variant="body2" color="text.secondary">
          {v.transmission === "Automatic"
            ? t("transmissions.automatic")
            : v.transmission === "Manual"
              ? t("transmissions.manual")
              : v.transmission || "—"}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={status.label}
          size="small"
          sx={{
            textTransform: "capitalize",
            borderRadius: 2,
            bgcolor: alpha(statusColor, 0.15),
            color: statusColor,
            fontWeight: 700,
            fontSize: { xs: 11, sm: 12 },
          }}
        />
      </TableCell>

      <TableCell align="right">
        <ActionButtons
          vehicleId={v.vehicleId || v.id}
          available={!!v.available}
          hasActiveBookings={v.hasActiveBookings}
          onDelete={onDelete}
          onNavigate={onNavigate}
        />
      </TableCell>
    </TableRow>
  );
});

interface MobileVehicleListProps {
  readonly vehicles: readonly Vehicle[];
  readonly theme: Theme;
  readonly handleDelete: (id: string, isAvailable: boolean, hasBookings?: boolean) => void;
  readonly handleNavigate: (path: string) => void;
  readonly filtersActive: boolean;
  readonly handleClearFilters: () => void;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly page: number;
  readonly handlePageChange: (_: unknown, v: number) => void;
}

function MobileVehicleList({
  vehicles,
  theme,
  handleDelete,
  handleNavigate,
  filtersActive,
  handleClearFilters,
  totalCount,
  totalPages,
  page,
  handlePageChange,
}: MobileVehicleListProps) {
  const t = useTranslations("dashboardAdmin.vehicles");

  return (
    <Box>
      {vehicles.length > 0 ? (
        vehicles.map((v: Vehicle) => (
          <VehicleMobileCard
            key={v.vehicleId || v.id}
            v={v}
            theme={theme}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
          />
        ))
      ) : (
        <EmptyState filtersActive={filtersActive} handleClearFilters={handleClearFilters} />
      )}

      <Stack direction="column" spacing={1} sx={{ alignItems: "center", mt: 2, mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {t("showingCount", { count: vehicles.length, total: totalCount })}
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          size="small"
          siblingCount={0}
          boundaryCount={1}
          sx={{ "& .MuiPaginationItem-root": { borderRadius: 2 } }}
        />
      </Stack>
    </Box>
  );
}

interface DesktopVehicleListProps {
  readonly loading: boolean;
  readonly vehicles: readonly Vehicle[];
  readonly theme: Theme;
  readonly handleDelete: (id: string, isAvailable: boolean, hasBookings?: boolean) => void;
  readonly handleNavigate: (path: string) => void;
  readonly filtersActive: boolean;
  readonly handleClearFilters: () => void;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly page: number;
  readonly handlePageChange: (_: unknown, v: number) => void;
  readonly selectedVehicleIds: ReadonlySet<string>;
  readonly toggleVehicleSelection: (id: string) => void;
  readonly toggleSelectAll: () => void;
}

function DesktopVehicleList({
  loading,
  vehicles,
  theme,
  handleDelete,
  handleNavigate,
  filtersActive,
  handleClearFilters,
  totalCount,
  totalPages,
  page,
  handlePageChange,
  selectedVehicleIds,
  toggleVehicleSelection,
  toggleSelectAll,
}: DesktopVehicleListProps) {
  const t = useTranslations("dashboardAdmin.vehicles");
  const allSelected = vehicles.length > 0 && vehicles.every(v => selectedVehicleIds.has(v.vehicleId || v.id));
  const someSelected = vehicles.some(v => selectedVehicleIds.has(v.vehicleId || v.id)) && !allSelected;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 2,
          }}
        />
      )}
      <TableContainer sx={{ overflowX: "auto", opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease" }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: t => alpha(t.palette.primary.main, 0.04),
                "& .MuiTableCell-head": {
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "text.secondary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  py: 1.5,
                },
              }}
            >
              <TableCell padding="checkbox" sx={{ pl: 2 }}>
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell sx={{ pl: 2 }}>{t("tableHeaders.vehicle")}</TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{t("tableHeaders.category")}</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{t("tableHeaders.dailyRate")}</TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{t("tableHeaders.supplier")}</TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{t("tableHeaders.year")}</TableCell>
              <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>{t("tableHeaders.transmission")}</TableCell>
              <TableCell>{t("tableHeaders.availability")}</TableCell>
              <TableCell align="right" sx={{ pr: 4 }}>
                {t("tableHeaders.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {vehicles.length > 0 ? (
              vehicles.map((v: Vehicle) => (
                <VehicleTableRow
                  key={v.vehicleId || v.id}
                  v={v}
                  theme={theme}
                  onDelete={handleDelete}
                  onNavigate={handleNavigate}
                  selected={selectedVehicleIds.has(v.vehicleId || v.id)}
                  onToggle={() => {
                    toggleVehicleSelection(v.vehicleId || v.id);
                  }}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                  <EmptyState filtersActive={filtersActive} handleClearFilters={handleClearFilters} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("showingCount", { count: vehicles.length, total: totalCount })}
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          size="small"
          sx={{ "& .MuiPaginationItem-root": { borderRadius: 2 } }}
        />
      </Stack>
    </Paper>
  );
}

export interface VehicleTableProps {
  readonly loading: boolean;
  readonly vehicles: readonly Vehicle[];
  readonly listError: string | null;
  readonly isMobile: boolean;
  readonly theme: Theme;
  readonly handleDelete: (id: string, isAvailable: boolean, hasBookings?: boolean) => void;
  readonly handleNavigate: (path: string) => void;
  readonly filtersActive: boolean;
  readonly handleClearFilters: () => void;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly page: number;
  readonly handlePageChange: (_: unknown, v: number) => void;
  readonly refresh: () => void;
  readonly selectedVehicleIds: ReadonlySet<string>;
  readonly toggleVehicleSelection: (id: string) => void;
  readonly toggleSelectAll: () => void;
}

export default memo(function VehicleTable({
  loading,
  vehicles,
  listError,
  isMobile,
  theme,
  handleDelete,
  handleNavigate,
  filtersActive,
  handleClearFilters,
  totalCount,
  totalPages,
  page,
  handlePageChange,
  refresh,
  selectedVehicleIds,
  toggleVehicleSelection,
  toggleSelectAll,
}: VehicleTableProps): JSX.Element {
  if (loading && vehicles.length === 0 && !listError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (listError && vehicles.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          py: 8,
          textAlign: "center",
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          sx={{ maxWidth: 460, mx: "auto", borderRadius: 2, mb: 3 }}
          action={
            <Button
              size="small"
              color="error"
              onClick={() => {
                refresh();
              }}
            >
              Retry
            </Button>
          }
        >
          {listError}
        </Alert>
      </Paper>
    );
  }

  if (isMobile) {
    return (
      <MobileVehicleList
        vehicles={vehicles}
        theme={theme}
        handleDelete={handleDelete}
        handleNavigate={handleNavigate}
        filtersActive={filtersActive}
        handleClearFilters={handleClearFilters}
        totalCount={totalCount}
        totalPages={totalPages}
        page={page}
        handlePageChange={handlePageChange}
      />
    );
  }

  return (
    <DesktopVehicleList
      loading={loading}
      vehicles={vehicles}
      theme={theme}
      handleDelete={handleDelete}
      handleNavigate={handleNavigate}
      filtersActive={filtersActive}
      handleClearFilters={handleClearFilters}
      totalCount={totalCount}
      totalPages={totalPages}
      page={page}
      handlePageChange={handlePageChange}
      selectedVehicleIds={selectedVehicleIds}
      toggleVehicleSelection={toggleVehicleSelection}
      toggleSelectAll={toggleSelectAll}
    />
  );
});
