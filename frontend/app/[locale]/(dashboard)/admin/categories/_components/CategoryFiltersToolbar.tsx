import { Stack, TextField, InputAdornment, MenuItem, Button } from "@mui/material";
import { SearchRounded as SearchIcon, AddRounded as AddIcon } from "@mui/icons-material";
import { useRouter } from "@/shared/i18n/routing";

export function CategoryFiltersToolbar({
  search,
  setSearch,
  status,
  setStatus,
  offer,
  setOffer,
  sortBy,
  setSortBy,
  setPage,
  t,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  offer: string;
  setOffer: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  setPage: (value: number) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const router = useRouter();

  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      sx={{ mb: 3, width: "100%", justifyContent: "space-between", alignItems: { xs: "stretch", lg: "center" } }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexGrow: 1, flexWrap: "wrap", gap: 2 }}>
        <TextField
          size="small"
          placeholder={t("toolbar.searchPlaceholder")}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: "100%", sm: 240 } }}
        />
        <TextField
          select
          size="small"
          label={t("toolbar.statusLabel")}
          value={status}
          onChange={e => {
            setStatus(e.target.value);
            setPage(1);
          }}
          sx={{ width: { xs: "100%", sm: 150 } }}
        >
          <MenuItem value="">{t("toolbar.allStatuses")}</MenuItem>
          <MenuItem value="Active">{t("table.statusActive")}</MenuItem>
          <MenuItem value="Inactive">{t("table.statusInactive")}</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label={t("toolbar.offerLabel")}
          value={offer}
          onChange={e => {
            setOffer(e.target.value);
            setPage(1);
          }}
          sx={{ width: { xs: "100%", sm: 150 } }}
        >
          <MenuItem value="">{t("toolbar.allOffers")}</MenuItem>
          <MenuItem value="Active Offer">{t("toolbar.activeOffer")}</MenuItem>
          <MenuItem value="Expired Offer">{t("toolbar.expiredOffer")}</MenuItem>
          <MenuItem value="No Offer">{t("toolbar.noOffer")}</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label={t("toolbar.sortByLabel")}
          value={sortBy}
          onChange={e => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          sx={{ width: { xs: "100%", sm: 160 } }}
        >
          <MenuItem value="Name A-Z">{t("toolbar.sortNameAZ")}</MenuItem>
          <MenuItem value="Name Z-A">{t("toolbar.sortNameZA")}</MenuItem>
          <MenuItem value="Vehicles Count">{t("toolbar.sortVehiclesCount")}</MenuItem>
          <MenuItem value="Commission">{t("toolbar.sortCommission")}</MenuItem>
          <MenuItem value="Created Date">{t("toolbar.sortCreatedDate")}</MenuItem>
        </TextField>
      </Stack>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          router.push("/admin/categories/create");
        }}
        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, flexShrink: 0 }}
      >
        {t("addCategory")}
      </Button>
    </Stack>
  );
}
