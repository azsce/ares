"use client";

import { useState, useCallback, useMemo, useEffect, type JSX } from "react";
import dynamic from "next/dynamic";
import { Box, Typography, Stack, Button, Alert, Snackbar, useTheme, useMediaQuery } from "@mui/material";
import { AddRounded as AddIcon } from "@mui/icons-material";
import { useRouter } from "@/shared/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  deleteCar,
  type Vehicle,
  type AdminVehicleFilter,
  type VehicleStatusFilter,
  type VehicleSortBy,
  type AdminVehicleStats,
} from "@/api-clients/cars/cars";
import { useVehicles, useAdminVehicleStats } from "@/api-clients/cars/hooks";
import { getSuppliers, type Supplier } from "@/api-clients/suppliers/suppliers";
import { getCategories, bulkAssignVehicles, type Category } from "@/api-clients/categories/categories";
import { logger } from "@/utils/logger";

// Import components
import FleetOverview from "./_components/FleetOverview";
import VehicleFilters from "./_components/VehicleFilters";
import VehicleTable from "./_components/VehicleTable";

// Lazy load dialogs using next/dynamic
const BulkAssignDialog = dynamic(() => import("./_components/BulkAssignDialog"), { ssr: false });
const DeleteConfirmDialog = dynamic(() => import("./_components/DeleteConfirmDialog"), { ssr: false });

interface VehiclesClientProps {
  readonly accessToken: string;
  readonly initialVehiclesData?: {
    data?: Vehicle[];
    totalPages?: number;
    totalCount?: number;
  };
  readonly initialStats?: AdminVehicleStats;
}

const getErrorMessage = (err: unknown, t: (key: string) => string): string => {
  let msg = "";
  if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response: { data?: { message?: string } } }).response;
    msg = response.data?.message || "";
  }

  if (msg.includes("active bookings")) {
    return t("errors.activeBookings");
  }
  if (msg.includes("Cannot delete")) {
    return t("errors.cannotDeleteRented");
  }
  return t("errors.generic");
};

export default function VehiclesClient({
  accessToken,
  initialVehiclesData,
  initialStats,
}: VehiclesClientProps): JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations("dashboardAdmin.vehicles");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const [openBulkAssign, setOpenBulkAssign] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false);

  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId") || "";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatusFilter>("");
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [transmissionFilter, setTransmissionFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<VehicleSortBy>("newest");
  const [categoryIdFilter, setCategoryIdFilter] = useState<string>(initialCategoryId);

  useEffect(() => {
    const paramVal = searchParams.get("categoryId");
    if (paramVal !== null) {
      setCategoryIdFilter(paramVal);
    }
  }, [searchParams]);

  const vehicleFilter = useMemo<AdminVehicleFilter>(
    () => ({
      keyword: search,
      status: statusFilter,
      supplierId: supplierFilter || undefined,
      transmission: transmissionFilter || undefined,
      sortBy,
      categoryId: categoryIdFilter || undefined,
    }),
    [search, statusFilter, supplierFilter, transmissionFilter, sortBy, categoryIdFilter]
  );

  const filtersActive = useMemo(
    () =>
      Boolean(search) ||
      Boolean(statusFilter) ||
      Boolean(supplierFilter) ||
      Boolean(transmissionFilter) ||
      Boolean(categoryIdFilter) ||
      sortBy !== "newest",
    [search, statusFilter, supplierFilter, transmissionFilter, sortBy, categoryIdFilter]
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setSupplierFilter("");
    setTransmissionFilter("");
    setSortBy("newest");
    setCategoryIdFilter("");
  }, []);

  const {
    vehicles,
    loading,
    error: listError,
    page,
    totalPages,
    totalCount,
    setPage,
    refresh,
  } = useVehicles(accessToken, vehicleFilter, 1, initialVehiclesData);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const result = await getSuppliers(1, 100);
        const list = result.data ?? result.resultData ?? result.items ?? [];
        setSuppliers(list);
      } catch (err) {
        logger.error("Failed to load suppliers for filter dropdown", err);
      }

      try {
        const catResult = await getCategories();
        setCategories(catResult);
      } catch (err) {
        logger.error("Failed to load categories for bulk assign", err);
      }
    })();
  }, []);

  const {
    stats: vehicleStats,
    error: statsError,
    refresh: refreshStats,
  } = useAdminVehicleStats(accessToken, initialStats);

  const total = vehicleStats?.totalVehicles ?? 0;
  const availableCount = vehicleStats?.availableVehicles ?? 0;
  const rentalCount = vehicleStats?.onRentalVehicles ?? 0;
  const maintenanceCount = vehicleStats?.maintenanceVehicles ?? 0;

  const handleDelete = useCallback(
    (id: string, isAvailable: boolean, hasBookings?: boolean) => {
      if (hasBookings) {
        setErrorMsg(t("errors.activeBookings"));
        return;
      }
      if (!isAvailable) {
        setErrorMsg(t("errors.cannotDeleteRented"));
        return;
      }
      setDeleteId(id);
      setOpenDelete(true);
    },
    [t]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteCar(accessToken, deleteId);
      setOpenDelete(false);
      setDeleteId(null);
      refresh();
      refreshStats();
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, t));
      logger.error("Failed to delete car", err);
    }
  }, [deleteId, accessToken, refresh, refreshStats, t]);

  const handleCloseDelete = useCallback(() => {
    setOpenDelete(false);
  }, []);
  const handleCloseError = useCallback(() => {
    setErrorMsg(null);
  }, []);
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const handlePageChange = useCallback(
    (_: unknown, v: number) => {
      setPage(v);
    },
    [setPage]
  );

  const toggleVehicleSelection = useCallback((id: string) => {
    setSelectedVehicleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (vehicles.length === 0) return;
    const currentIds = vehicles.map(v => v.vehicleId || v.id);
    const allSelected = currentIds.every(id => selectedVehicleIds.has(id));

    setSelectedVehicleIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        currentIds.forEach(id => next.delete(id));
      } else {
        currentIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, [vehicles, selectedVehicleIds]);

  const handleBulkAssignSubmit = async () => {
    if (!selectedCategoryId || selectedVehicleIds.size === 0) return;

    setBulkAssignLoading(true);
    try {
      await bulkAssignVehicles(selectedCategoryId, Array.from(selectedVehicleIds));
      setOpenBulkAssign(false);
      setSelectedVehicleIds(new Set());
      refresh();
      refreshStats();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t));
    } finally {
      setBulkAssignLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 }, maxWidth: 1300, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ gap: 2, justifyContent: "space-between", mb: 4, alignItems: { xs: "flex-start", sm: "center" } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.6rem", md: "2rem" } }}>
            {t("inventoryTitle")}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t("inventorySubtitle")}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
          {selectedVehicleIds.size > 0 && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setOpenBulkAssign(true);
              }}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              {t("bulkAssignBtn", { count: selectedVehicleIds.size })}
            </Button>
          )}

          <Box
            onClick={() => {
              handleNavigate("/admin/vehicles/create");
            }}
            sx={{
              px: 2.5,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 700,
              color: "primary.contrastText",
              cursor: "pointer",
              background: t => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
              boxShadow: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
              transition: "0.2s",
              whiteSpace: "nowrap",
              justifyContent: { xs: "center", sm: "flex-start" },
              "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
            }}
          >
            <AddIcon fontSize="small" />
            {t("addBtn")}
          </Box>
        </Stack>
      </Stack>

      {statsError && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button
              size="small"
              color="warning"
              onClick={() => {
                refreshStats();
              }}
            >
              Retry
            </Button>
          }
        >
          {statsError}
        </Alert>
      )}

      <FleetOverview
        total={total}
        availableCount={availableCount}
        rentalCount={rentalCount}
        maintenanceCount={maintenanceCount}
      />

      <VehicleFilters
        search={search}
        setSearch={setSearch}
        categoryIdFilter={categoryIdFilter}
        setCategoryIdFilter={setCategoryIdFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        transmissionFilter={transmissionFilter}
        setTransmissionFilter={setTransmissionFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        suppliers={suppliers}
      />

      {listError && vehicles.length > 0 && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button
              size="small"
              color="warning"
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
      )}

      <VehicleTable
        loading={loading}
        vehicles={vehicles}
        listError={listError}
        isMobile={isMobile}
        theme={theme}
        handleDelete={handleDelete}
        handleNavigate={handleNavigate}
        filtersActive={filtersActive}
        handleClearFilters={handleClearFilters}
        totalCount={totalCount}
        totalPages={totalPages}
        page={page}
        handlePageChange={handlePageChange}
        refresh={refresh}
        selectedVehicleIds={selectedVehicleIds}
        toggleVehicleSelection={toggleVehicleSelection}
        toggleSelectAll={toggleSelectAll}
      />

      {openBulkAssign && (
        <BulkAssignDialog
          open={openBulkAssign}
          onClose={() => {
            setOpenBulkAssign(false);
          }}
          onSubmit={handleBulkAssignSubmit}
          selectedCount={selectedVehicleIds.size}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          categories={categories}
          loading={bulkAssignLoading}
        />
      )}

      {openDelete && <DeleteConfirmDialog open={openDelete} onClose={handleCloseDelete} onConfirm={confirmDelete} />}

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ maxWidth: { xs: "calc(100% - 32px)", sm: "auto" }, left: { xs: 16, sm: "auto" } }}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
