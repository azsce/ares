import { Box, Typography, Button, Avatar, alpha } from "@mui/material";
import { SearchRounded as SearchIcon } from "@mui/icons-material";

export function EmptyState({
  filtersActive,
  handleClearFilters,
  t,
}: {
  readonly filtersActive: boolean;
  readonly handleClearFilters: () => void;
  readonly t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
      <Avatar
        sx={{
          width: 64,
          height: 64,
          mx: "auto",
          mb: 2,
          bgcolor: theme => alpha(theme.palette.text.disabled, 0.1),
        }}
      >
        <SearchIcon sx={{ fontSize: 32, color: "text.disabled" }} />
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 700 }} color="text.secondary">
        {filtersActive ? t("emptyState.noMatchTitle") : t("emptyState.noCategoriesTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {filtersActive ? t("emptyState.noMatchDesc") : t("emptyState.noCategoriesDesc")}
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
