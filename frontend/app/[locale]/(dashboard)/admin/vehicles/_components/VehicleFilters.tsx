"use client";

import { type JSX } from "react";
import { TextField, InputAdornment, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import { SearchRounded as SearchIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { VehicleStatus, type VehicleStatusFilter, type VehicleSortBy } from "@/api-clients/cars/cars";
import type { Category } from "@/api-clients/categories/categories";
import type { Supplier } from "@/api-clients/suppliers/suppliers";

const STATUS_OPTIONS: readonly { value: VehicleStatusFilter; labelKey: string }[] = [
  { value: "", labelKey: "allStatusesOpt" },
  { value: VehicleStatus.Pending, labelKey: "statusLabels.pending" },
  { value: VehicleStatus.Approved, labelKey: "statusLabels.approved" },
  { value: VehicleStatus.Rejected, labelKey: "statusLabels.rejected" },
  { value: VehicleStatus.Available, labelKey: "statusLabels.available" },
  { value: VehicleStatus.FullyBooked, labelKey: "statusLabels.fullyBooked" },
  { value: VehicleStatus.Maintenance, labelKey: "statusLabels.maintenance" },
  { value: VehicleStatus.Retired, labelKey: "statusLabels.retired" },
];

const TRANSMISSION_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "", label: "All transmissions" },
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const SORT_OPTIONS: readonly { value: VehicleSortBy; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priceHigh", label: "Price: High → Low" },
  { value: "priceLow", label: "Price: Low → High" },
];

export interface VehicleFiltersProps {
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly categoryIdFilter: string;
  readonly setCategoryIdFilter: (value: string) => void;
  readonly statusFilter: VehicleStatusFilter;
  readonly setStatusFilter: (value: VehicleStatusFilter) => void;
  readonly supplierFilter: string;
  readonly setSupplierFilter: (value: string) => void;
  readonly transmissionFilter: string;
  readonly setTransmissionFilter: (value: string) => void;
  readonly sortBy: VehicleSortBy;
  readonly setSortBy: (value: VehicleSortBy) => void;
  readonly categories: readonly Category[];
  readonly suppliers: readonly Supplier[];
}

export default function VehicleFilters({
  search,
  setSearch,
  categoryIdFilter,
  setCategoryIdFilter,
  statusFilter,
  setStatusFilter,
  supplierFilter,
  setSupplierFilter,
  transmissionFilter,
  setTransmissionFilter,
  sortBy,
  setSortBy,
  categories,
  suppliers,
}: VehicleFiltersProps): JSX.Element {
  const t = useTranslations("dashboardAdmin.vehicles");

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 6, lg: 3.25 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("searchVehiclesPlaceholder")}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.75 }}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("categoryFilterLabel")}
          value={categoryIdFilter}
          onChange={e => {
            setCategoryIdFilter(e.target.value);
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
        >
          <MenuItem value="">{t("allCategoriesOpt")}</MenuItem>
          {categories.map(c => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.75 }}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("statusFilterLabel")}
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value as VehicleStatusFilter);
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
        >
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 4, lg: 1.75 }}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("supplierFilterLabel")}
          value={supplierFilter}
          onChange={e => {
            setSupplierFilter(e.target.value);
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
        >
          <MenuItem value="">{t("allSuppliersOpt")}</MenuItem>
          {suppliers.map(s => (
            <MenuItem key={s.id} value={s.id}>
              {s.companyProfile?.companyName?.trim() || `${s.firstName} ${s.lastName}`.trim()}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 4, lg: 1.75 }}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("transmissionFilterLabel")}
          value={transmissionFilter}
          onChange={e => {
            setTransmissionFilter(e.target.value);
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
        >
          {TRANSMISSION_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.value === ""
                ? t("allTransmissionsOpt")
                : opt.value === "Automatic"
                  ? t("transmissions.automatic")
                  : opt.value === "Manual"
                    ? t("transmissions.manual")
                    : opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 4, lg: 1.75 }}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("sortByFilterLabel")}
          value={sortBy}
          onChange={e => {
            setSortBy(e.target.value as VehicleSortBy);
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
        >
          {SORT_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.value === "newest"
                ? t("sortOptions.newest")
                : opt.value === "oldest"
                  ? t("sortOptions.oldest")
                  : opt.value === "priceHigh"
                    ? t("sortOptions.priceHigh")
                    : t("sortOptions.priceLow")}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
}
